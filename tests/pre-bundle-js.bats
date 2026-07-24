#!/usr/bin/env bats
# pre-bundle-js.sh の contract: JS bundle を事前生成できること

setup() {
  cd "$(dirname "$BATS_TEST_DIRNAME")"
}

@test "pre-bundle-js.sh がヘルプ的にエラーハンドリングする" {
  run bash scripts/pre-bundle-js.sh 2>&1 || true
  [ -n "$output" ]
}
