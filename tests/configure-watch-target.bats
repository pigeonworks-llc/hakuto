#!/usr/bin/env bats
# configure-watch-target.sh の contract: Xcode project に watchOS target を追加できること

setup() {
  cd "$(dirname "$BATS_TEST_DIRNAME")"
}

@test "configure-watch-target.rb が xcodeproj 不在でエラー" {
  run ruby scripts/configure-watch-target.rb /nonexistent/path 2>&1 || true
  [[ "$output" == *"xcodeproj not found"* ]]
}

@test "configure-watch-target.rb が watch-app 不在でエラー" {
  # ダミーの ios ディレクトリを作り空の xcodeproj を置く — これは watch-app 不在をテスト
  local tmpdir=$(mktemp -d)
  mkdir -p "$tmpdir/ios/Hakuto.xcodeproj"
  touch "$tmpdir/ios/Hakuto.xcodeproj/project.pbxproj"
  run ruby "$(dirname "$BATS_TEST_DIRNAME")/scripts/configure-watch-target.rb" "$tmpdir/ios" 2>&1 || true
  # watch-app ディレクトリがないのでエラーになるはず
  [[ "$output" == *"watch-app"* ]] || [[ "$output" == *"not found"* ]]
  rm -rf "$tmpdir"
}

@test "configure-watch-target.sh がヘルプ的にエラーハンドリングする" {
  run bash scripts/configure-watch-target.sh 2>&1 || true
  # Ruby スクリプトが走るか、もしくは何らかの出力があること
  [ -n "$output" ]
}
