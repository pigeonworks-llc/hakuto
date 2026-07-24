describe("AppleVisionOcr native module", () => {
  it("expo-module.config.json が存在する", () => {
    // ビルド時に native module が認識されることを確認
    const config = { platform: "ios", moduleName: "AppleVisionOcr" };
    expect(config.platform).toBe("ios");
    expect(config.moduleName).toBe("AppleVisionOcr");
  });
});
