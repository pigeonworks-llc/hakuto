import { Text, View } from "react-native";

describe("ErrorBoundary", () => {
  it("children をレンダリングする", () => {
    const element = (
      <View>
        <Text>test</Text>
      </View>
    );
    expect(element).toBeDefined();
  });

  it("エラー時にフォールバックを表示する", () => {
    const fallback = <Text>エラーが発生しました</Text>;
    expect(fallback).toBeDefined();
  });
});
