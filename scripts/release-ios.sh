#!/usr/bin/env bash
# Hakuto iOS リリース — xcodebuild + fastlane で TestFlight へアップロード
#
# Usage:
#   ./scripts/release-ios.sh              ビルド + TestFlight アップロード
#   ./scripts/release-ios.sh --check      前提チェックのみ
#   ./scripts/release-ios.sh --no-upload  IPA 生成まで (upload 省略)
#
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# --- 固定値 ---
KEY_ID="RS5PZU2T2S"
ISSUER_ID="88eb0dab-20b4-4091-b284-d458c90a960d"
P8_PATH="$HOME/.appstoreconnect/private_keys/AuthKey_${KEY_ID}.p8"
TEAM_ID="8FT9UF5MA6"
BUNDLE_ID="com.pigeonworks.hakuto"
WATCH_BUNDLE_ID="com.pigeonworks.hakuto.watch"
# Expo prebuild は expo.name ("Hakuto") で scheme/project/target を生成する。
# slug ("hakuto") ではない。scheme/target 名は xcodebuild で case-sensitive。
SCHEME="Hakuto"

ARCHIVE_PATH="$REPO_ROOT/ios/build/Hakuto.xcarchive"
EXPORT_PATH="$REPO_ROOT/ios/build/export"
EXPORT_PLIST="$REPO_ROOT/ios/build/export-options.plist"
IPA_PATH="$EXPORT_PATH/${SCHEME}.ipa"
WATCH_PRODUCTS="$REPO_ROOT/ios/build/watch-products"
WATCH_PROJECT_PATH="$REPO_ROOT/watch-app/HakutoWatch.xcodeproj"

SKIP_PREBUILD=0
NO_UPLOAD=0
CHECK_ONLY=0

while [[ $# -gt 0 ]]; do
	case "$1" in
	--check)
		CHECK_ONLY=1
		shift
		;;
	--no-upload)
		NO_UPLOAD=1
		shift
		;;
	--skip-prebuild)
		SKIP_PREBUILD=1
		shift
		;;
	-h | --help)
		grep '^#' "$0" | sed 's/^# \{0,1\}//'
		exit 0
		;;
	*)
		echo "✗ unknown: $1"
		exit 2
		;;
	esac
done

fail() {
	echo "✗ $*" >&2
	exit 1
}
ok() { echo "✓ $*"; }
step() {
	echo
	echo "→ $*"
}

# --- preflight ---
step "preflight"
command -v fastlane >/dev/null || fail "fastlane not found (brew install fastlane)"
command -v node >/dev/null || fail "node not found"
command -v xcodebuild >/dev/null || fail "xcodebuild not found (install Xcode)"
[[ -f "$P8_PATH" ]] || fail "API key missing: $P8_PATH"
ok "fastlane / node / xcodebuild / API key OK"
ok "team=$TEAM_ID bundle=$BUNDLE_ID"

[[ "$CHECK_ONLY" -eq 1 ]] && {
	ok "preflight passed (--check)"
	exit 0
}

# --- buildNumber ---
# hakuto は静的 app.json (expo.ios.buildNumber) を SoT とする。次リリースは
# app.json の buildNumber を手で +1 してから release する (bump 自動化は follow-up)。
step "buildNumber (app.json SoT)"
APP_BUILD_NUMBER="$(node -e "process.stdout.write(String(require('./app.json').expo.ios.buildNumber||'1'))")"
ok "buildNumber -> $APP_BUILD_NUMBER (app.json)"

# --- prebuild ---
if [[ "$SKIP_PREBUILD" -eq 0 ]]; then
	step "expo prebuild (ios, clean)"
	npx expo prebuild --platform ios --clean
fi

# Fastfile copy (prebuild で ios/ が新規生成されるため)
mkdir -p ios/fastlane
cp fastlane/Fastfile ios/fastlane/Fastfile

# Apply patches (expo-modules-jsi Swift fix for Xcode 16)
npx patch-package 2>/dev/null || true

# --- configure watch target (prebuild 後に実行) ---
step "configure watch target"
bash scripts/configure-watch-target.sh

# --- signing (iOS) ---
step "fastlane signing (iOS)"
SOPS_APPLE="$HOME/.config/secrets/eatreel-apple.sops.env"
if [[ -z "${MATCH_PASSWORD:-}" && -f "$SOPS_APPLE" ]]; then
	(cd ios && sops exec-env "$SOPS_APPLE" \
		'FASTLANE_SKIP_UPDATE_CHECK=1 FASTLANE_HIDE_CHANGELOG=1 fastlane signing')
elif [[ -n "${MATCH_PASSWORD:-}" ]]; then
	(cd ios && FASTLANE_SKIP_UPDATE_CHECK=1 FASTLANE_HIDE_CHANGELOG=1 fastlane signing)
else
	fail "MATCH_PASSWORD 未設定 かつ $SOPS_APPLE 不在"
fi

# --- signing (Watch) ---
step "fastlane signing (Watch)"
if [[ -f "$WATCH_PROJECT_PATH" ]]; then
	if [[ -z "${MATCH_PASSWORD:-}" && -f "$SOPS_APPLE" ]]; then
		(cd ios && sops exec-env "$SOPS_APPLE" \
			'FASTLANE_SKIP_UPDATE_CHECK=1 FASTLANE_HIDE_CHANGELOG=1 fastlane signing_watch')
	elif [[ -n "${MATCH_PASSWORD:-}" ]]; then
		(cd ios && FASTLANE_SKIP_UPDATE_CHECK=1 FASTLANE_HIDE_CHANGELOG=1 fastlane signing_watch)
	fi
fi

# --- build watch app (standalone, inject into archive later) ---
WATCH_PRODUCTS="$REPO_ROOT/ios/build/watch-products"
WATCH_PROJECT_PATH="$REPO_ROOT/watch-app/HakutoWatch.xcodeproj"
if [[ -f "$WATCH_PROJECT_PATH" ]]; then
	step "xcodebuild build (Watch app)"
	rm -rf "$WATCH_PRODUCTS"
	mkdir -p "$WATCH_PRODUCTS"
	(cd ios && xcodebuild \
		-project "$WATCH_PROJECT_PATH" \
		-scheme "HakutoWatch" \
		-configuration Release \
		-destination "generic/platform=watchos" \
		CONFIGURATION_BUILD_DIR="$WATCH_PRODUCTS" \
		build)
	ok "watch app built: $WATCH_PRODUCTS/HakutoWatch.app"
else
	echo "⚠ watch project not found — building without watch app"
fi

# --- pre-bundle JS (avoid Metro transformFile crash during archive) ---
step "pre-bundle JS"
mkdir -p ios/build/Hakuto.app
bash scripts/pre-bundle-js.sh
echo 'export SKIP_BUNDLING=1' >ios/.xcode.env.updates

# --- archive (iOS) ---
step "xcodebuild archive"
rm -rf "$ARCHIVE_PATH"
(cd ios && xcodebuild \
	-workspace "${SCHEME}.xcworkspace" -scheme "$SCHEME" \
	-configuration Release -destination "generic/platform=iOS" \
	-archivePath "$ARCHIVE_PATH" archive)
ok "archive: $ARCHIVE_PATH"

# --- inject watch app into archive ---
if [[ -d "$WATCH_PRODUCTS/HakutoWatch.app" && -d "$ARCHIVE_PATH" ]]; then
	step "inject watch app into archive"
	WATCH_DEST="$ARCHIVE_PATH/Products/Applications/${SCHEME}.app/Watch"
	mkdir -p "$WATCH_DEST"
	cp -R "$WATCH_PRODUCTS/HakutoWatch.app" "$WATCH_DEST/"
	ok "injected HakutoWatch.app into archive Watch/ directory"
fi

# --- inject pre-bundled JS into archive (SKIP_BUNDLING対応) ---
PRE_BUNDLE="$REPO_ROOT/ios/build/Hakuto.app/main.jsbundle"
if [[ -f "$PRE_BUNDLE" && -d "$ARCHIVE_PATH" ]]; then
	step "inject JS bundle into archive"
	APP_DIR="$ARCHIVE_PATH/Products/Applications/${SCHEME}.app"
	cp "$PRE_BUNDLE" "$APP_DIR/main.jsbundle"
	ok "injected main.jsbundle into archive (${APP_DIR}/main.jsbundle)"
	# Also inject assets if they exist
	if [[ -d "$REPO_ROOT/ios/build/Hakuto.app/assets" ]]; then
		cp -R "$REPO_ROOT/ios/build/Hakuto.app/assets" "$APP_DIR/"
		ok "injected assets into archive"
	fi
fi

# --- export ---
step "xcodebuild -exportArchive"
mkdir -p "$(dirname "$EXPORT_PLIST")"
cat >"$EXPORT_PLIST" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key><string>app-store</string>
  <key>teamID</key><string>${TEAM_ID}</string>
  <key>uploadSymbols</key><false/>
  <key>manageAppVersionAndBuildNumber</key><false/>
  <key>signingStyle</key><string>manual</string>
  <key>provisioningProfiles</key>
  <dict>
    <key>${BUNDLE_ID}</key><string>match AppStore ${BUNDLE_ID}</string>
    <key>${WATCH_BUNDLE_ID}</key><string>match AppStore ${WATCH_BUNDLE_ID}</string>
  </dict>
</dict>
</plist>
PLIST
rm -rf "$EXPORT_PATH"
xcodebuild -exportArchive -exportOptionsPlist "$EXPORT_PLIST" \
	-archivePath "$ARCHIVE_PATH" -exportPath "$EXPORT_PATH"
[[ -f "$IPA_PATH" ]] || fail "IPA not produced: $IPA_PATH"
ok "IPA: $IPA_PATH ($(du -h "$IPA_PATH" | cut -f1))"

[[ "$NO_UPLOAD" -eq 1 ]] && {
	ok "IPA 生成完了 (--no-upload): $IPA_PATH"
	exit 0
}

# --- 起動クラッシュ smoke (upload の前に fail-fast) ---
# 2026-07-24 app/ test-file の起動即クラッシュの反省。sim に Release build を
# install→launch しプロセス生存を確認、crash なら upload を中止する。
# SKIP_LAUNCH_SMOKE=1 で明示 skip 可 (sim 不在 / 高速 iteration 時)。
if [[ "${SKIP_LAUNCH_SMOKE:-0}" -eq 1 ]]; then
	echo "⚠ launch smoke を SKIP_LAUNCH_SMOKE=1 で省略 — 起動クラッシュ検出なしで upload" >&2
else
	bash "$REPO_ROOT/scripts/launch-smoke-ios.sh" ||
		fail "launch smoke で起動クラッシュ検出 — upload 中止 (SKIP_LAUNCH_SMOKE=1 で明示省略可)"
fi

# --- TestFlight upload ---
step "fastlane upload"
(cd ios && FASTLANE_SKIP_UPDATE_CHECK=1 FASTLANE_HIDE_CHANGELOG=1 \
	fastlane upload ipa:"$IPA_PATH")

echo
ok "TestFlight upload complete — App Store Connect でビルド処理を待つ (10-30分)"
