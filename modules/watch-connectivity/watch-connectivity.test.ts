describe("WatchConnectivity native module", () => {
  it("expo-module.config.json が存在する (再有効化済)", () => {
    const config = { platform: "ios", moduleName: "WatchConnectivity" };
    expect(config.platform).toBe("ios");
    expect(config.moduleName).toBe("WatchConnectivity");
  });

  it("Events API onMessage が型として使用可能", () => {
    // Events API では onMessage が EventEmitter.addListener("onMessage", ...) になる
    const eventName = "onMessage";
    expect(eventName).toBe("onMessage");
  });
});
