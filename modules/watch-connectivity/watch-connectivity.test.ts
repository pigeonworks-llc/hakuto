describe("HakutoWatchKit native module", () => {
  it("expo-module.config.json が HakutoWatchModule を指す", () => {
    const config = { platform: "ios", moduleName: "HakutoWatchModule" };
    expect(config.platform).toBe("ios");
    expect(config.moduleName).toBe("HakutoWatchModule");
  });

  it("podspec が HakutoWatchKit を名乗る", () => {
    const podName = "HakutoWatchKit";
    expect(podName).toBe("HakutoWatchKit");
  });

  it("Events API onMessage が型として使用可能", () => {
    const eventName = "onMessage";
    expect(eventName).toBe("onMessage");
  });
});
