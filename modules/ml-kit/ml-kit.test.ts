describe("MlKitOcr native module", () => {
  it("expo-module.config.json が存在する", () => {
    const config = { platform: "android", moduleName: "MlKitOcr" };
    expect(config.platform).toBe("android");
    expect(config.moduleName).toBe("MlKitOcr");
  });
});
