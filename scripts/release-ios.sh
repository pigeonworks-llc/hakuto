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
# Expo prebuild は expo.name ("Hakuto") で scheme/project/target を生成する。
# slug ("hakuto") ではない。scheme/target 名は xcodebuild で case-sensitive。
SCHEME="Hakuto"

ARCHIVE_PATH="$REPO_ROOT/ios/build/Hakuto.xcarchive"
EXPORT_PATH="$REPO_ROOT/ios/build/export"
EXPORT_PLIST="$REPO_ROOT/ios/build/export-options.plist"
IPA_PATH="$EXPORT_PATH/${SCHEME}.ipa"

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

# --- signing ---
step "fastlane signing (match)"
SOPS_APPLE="$HOME/.config/secrets/eatreel-apple.sops.env"
if [[ -z "${MATCH_PASSWORD:-}" && -f "$SOPS_APPLE" ]]; then
	(cd ios && sops exec-env "$SOPS_APPLE" \
		'FASTLANE_SKIP_UPDATE_CHECK=1 FASTLANE_HIDE_CHANGELOG=1 fastlane signing')
elif [[ -n "${MATCH_PASSWORD:-}" ]]; then
	(cd ios && FASTLANE_SKIP_UPDATE_CHECK=1 FASTLANE_HIDE_CHANGELOG=1 fastlane signing)
else
	fail "MATCH_PASSWORD 未設定 かつ $SOPS_APPLE 不在"
fi

# --- archive ---
step "xcodebuild archive"
rm -rf "$ARCHIVE_PATH"
(cd ios && xcodebuild \
	-workspace "${SCHEME}.xcworkspace" -scheme "$SCHEME" \
	-configuration Release -destination "generic/platform=iOS" \
	-archivePath "$ARCHIVE_PATH" archive)
ok "archive: $ARCHIVE_PATH"

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

# --- TestFlight upload ---
step "fastlane upload"
(cd ios && FASTLANE_SKIP_UPDATE_CHECK=1 FASTLANE_HIDE_CHANGELOG=1 \
	fastlane upload ipa:"$IPA_PATH")

echo
ok "TestFlight upload complete — App Store Connect でビルド処理を待つ (10-30分)"
