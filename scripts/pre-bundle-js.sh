#!/usr/bin/env bash
# pre-bundle-js.sh
#
# JS bundle を事前生成し、xcodebuild の SKIP_BUNDLING フラグと組み合わせて
# アーカイブ内の main.jsbundle を注入する。
# release-ios.sh の prebuild と archive の間で実行。
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

ENTRY_FILE="node_modules/expo-router/entry.js"
BUNDLE_OUTPUT="ios/build/Hakuto.app/main.jsbundle"
ASSETS_DEST="ios/build/Hakuto.app/assets"

mkdir -p "$(dirname "$BUNDLE_OUTPUT")"

npx expo export:embed \
	--platform ios \
	--entry-file "$ENTRY_FILE" \
	--bundle-output "$BUNDLE_OUTPUT" \
	--assets-dest "$ASSETS_DEST" \
	--dev false

echo "✓ JS bundle generated: $BUNDLE_OUTPUT ($(du -h "$BUNDLE_OUTPUT" | cut -f1))"
