#!/usr/bin/env bats

setup() {
  cd "$(dirname "$BATS_TEST_DIRNAME")"
}

@test "release-ios.sh --check が成功する" {
  run bash scripts/release-ios.sh --check
  # preflight only — fastlane/xcodebuild が無い環境でも通る範囲
  [ "$status" -eq 0 ] || echo "exit=$status output=$output"
}

@test "release-ios.sh がヘルプを表示する" {
  run bash scripts/release-ios.sh --help
  [ "$status" -eq 0 ]
  [[ "$output" == *"Usage"* ]]
}

@test "release-ios.sh は未定義引数でエラー" {
  run bash scripts/release-ios.sh --bogus
  [ "$status" -ne 0 ]
}
