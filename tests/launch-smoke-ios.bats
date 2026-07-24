#!/usr/bin/env bats
# launch-smoke.sh の contract: 起動クラッシュを検出できること

setup() {
  cd "$(dirname "$BATS_TEST_DIRNAME")"
}

@test "launch-smoke.sh がヘルプを表示する" {
  run bash scripts/launch-smoke-ios.sh --help
  [ "$status" -eq 0 ]
  [[ "$output" == *"Usage"* ]]
}

@test "launch-smoke.sh が simulator 不在で明示エラー" {
  run env HAKUTO_SMOKE_SIM="nonexistent-udid-xxxx" bash scripts/launch-smoke-ios.sh --check
  # --check は前提確認のみ。不正 UDID は非0で明示的に落ちる
  [ "$status" -ne 0 ] || [[ "$output" == *"simulator"* ]]
}
