#!/usr/bin/env bash
# configure-watch-target.sh
#
# Xcode project に watchOS target を追加するラッパー。
# Expo prebuild (--clean) の直後に実行すること。
# 依存: gem install xcodeproj
#
# Usage:
#   bash scripts/configure-watch-target.sh
#
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "→ configure-watch-target"

# Check Ruby dependency
if ! gem list xcodeproj --quiet 2>/dev/null | grep -q xcodeproj; then
	gem install xcodeproj --no-document || {
		echo "✗ xcodeproj gem のインストールに失敗しました (gem install xcodeproj)"
		exit 1
	}
fi

ruby scripts/configure-watch-target.rb
echo "✓ watch target configured"
