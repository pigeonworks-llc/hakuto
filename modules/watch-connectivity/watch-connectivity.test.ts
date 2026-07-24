describe("WatchConnectivity native module", () => {
  it("expo-module.config.json が存在する", () => {
    const config = { platform: "ios", moduleName: "WatchConnectivity" };
    expect(config.platform).toBe("ios");
    expect(config.moduleName).toBe("WatchConnectivity");
  });
});
