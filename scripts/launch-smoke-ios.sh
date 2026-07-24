#!/usr/bin/env bash
# Hakuto 起動クラッシュ smoke — simulator に Release build を install→launch し、
# プロセス生存 + 直近 crash report を検査する。TestFlight upload の前に
# 「起動即クラッシュ」class を検出する (2026-07-24 の app/ test-file crash の反省)。
#
# Usage:
#   ./scripts/launch-smoke-ios.sh          sim build→install→launch→検査
#   ./scripts/launch-smoke-ios.sh --check  前提のみ (simulator 存在確認)
#
# 制御 env:
#   HAKUTO_SMOKE_SIM   使う simulator UDID or name (既定: "iPhone 16 Pro")
#   SKIP_LAUNCH_SMOKE  release-ios.sh 側で 1 なら本 smoke を skip
#
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

BUNDLE_ID="com.pigeonworks.hakuto"
SCHEME="Hakuto"
SIM="${HAKUTO_SMOKE_SIM:-iPhone 16 Pro}"
CHECK_ONLY=0

while [[ $# -gt 0 ]]; do
	case "$1" in
	--check)
		CHECK_ONLY=1
		shift
		;;
	-h | --help)
		grep '^#' "$0" | sed 's/^# \{0,1\}//'
		exit 0
		;;
	*)
		echo "✗ unknown: $1" >&2
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

# --- simulator 解決 ---
step "resolve simulator ($SIM)"
UDID="$(xcrun simctl list devices available 2>/dev/null | grep -F "$SIM (" | head -1 | grep -oE '[0-9A-F]{8}-[0-9A-F-]{27}' || true)"
[[ -n "$UDID" ]] || fail "simulator not found: $SIM (xcrun simctl list devices)"
ok "simulator $SIM = $UDID"

[[ "$CHECK_ONLY" -eq 1 ]] && {
	ok "check passed"
	exit 0
}

xcrun simctl boot "$UDID" 2>/dev/null || true
xcrun simctl bootstatus "$UDID" -b 2>/dev/null || true

# --- simulator 用 Release build (with pre-bundle + SKIP_BUNDLING) ---
step "xcodebuild build (simulator, Release)"
SIM_DERIVED="$REPO_ROOT/ios/build/smoke-sim"
rm -rf "$SIM_DERIVED"
# Pre-bundle JS to avoid Metro transformFile error
SIM_BUNDLE_OUTPUT="$SIM_DERIVED/Build/Products/Release-iphonesimulator/${SCHEME}.app/main.jsbundle"
mkdir -p "$(dirname "$SIM_BUNDLE_OUTPUT")"
npx expo export:embed \
	--platform ios \
	--entry-file node_modules/expo-router/entry.js \
	--bundle-output "$SIM_BUNDLE_OUTPUT" \
	--assets-dest "$(dirname "$SIM_BUNDLE_OUTPUT")/assets" \
	--dev false >/dev/null 2>&1 || true
(cd ios && SKIP_BUNDLING=1 xcodebuild \
	-workspace "${SCHEME}.xcworkspace" -scheme "$SCHEME" \
	-configuration Release -sdk iphonesimulator \
	-destination "id=$UDID" \
	-derivedDataPath "$SIM_DERIVED" \
	CODE_SIGNING_ALLOWED=NO build) >/dev/null
APP="$(find "$SIM_DERIVED/Build/Products" -maxdepth 2 -name "${SCHEME}.app" -type d | head -1)"
[[ -n "$APP" ]] || fail "sim .app not produced"
# Inject pre-bundled JS into the built .app。
# SIM_BUNDLE_OUTPUT は .app 内パスに事前 bundle しているため、found APP と
# 同一ファイルになることがある。macOS の cp は src==dst で exit 1 になり
# set -e で smoke 全体が中断する (起動クラッシュと誤検出される) ため、
# 別ファイルのときだけ copy する。
if [[ -f "$SIM_BUNDLE_OUTPUT" ]] && ! [[ "$SIM_BUNDLE_OUTPUT" -ef "$APP/main.jsbundle" ]]; then
	cp "$SIM_BUNDLE_OUTPUT" "$APP/main.jsbundle"
fi
ok "app: $APP"

# --- install + launch ---
step "install + launch"
SINCE="$(date +%Y-%m-%d\ %H:%M:%S)"
xcrun simctl install "$UDID" "$APP"
xcrun simctl launch "$UDID" "$BUNDLE_ID" >/dev/null || fail "launch invocation failed"

# --- 生存確認 (プロセスが起動し、かつ生存し続けるか + crash report 検査) ---
# Release + SKIP_BUNDLING の cold launch は 2.6M jsbundle 読込で数秒かかる。
# 固定 sleep 5 では起動途中を取りこぼし false crash になる (2026-07-24 実測:
# app は launchctl list に居るのに 5s 判定が空振り)。最大 15s poll して起動を
# 待ち、さらに 3s 後も生存を確認して「起動即クラッシュ」でないことを確定する。
step "liveness check"
alive=0
for _ in $(seq 1 15); do
	if xcrun simctl spawn "$UDID" launchctl list 2>/dev/null | grep -q "$BUNDLE_ID"; then
		alive=1
		break
	fi
	sleep 1
done
if [[ "$alive" -eq 1 ]]; then
	sleep 3
	xcrun simctl spawn "$UDID" launchctl list 2>/dev/null | grep -q "$BUNDLE_ID" || alive=0
fi
if [[ "$alive" -eq 1 ]]; then
	ok "process alive — no launch crash"
else
	# crash report を拾って原因を出す
	CRASH="$(find "$HOME/Library/Logs/DiagnosticReports" -iname "*Hakuto*" -newermt "$SINCE" 2>/dev/null | head -1 || true)"
	if [[ -n "$CRASH" ]]; then
		echo "--- crash report head ---" >&2
		grep -m1 -iE "Exception Type|Termination|ReferenceError|Unhandled" "$CRASH" >&2 || true
	fi
	fail "起動クラッシュ検出 — プロセスが起動後に不在 (upload 中止)"
fi

echo
ok "launch smoke passed"
