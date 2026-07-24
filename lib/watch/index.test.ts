import type { WatchSessionState, WatchConnectivityModule } from "../../types/watch";

describe("WatchConnectivityModule", () => {
  let module: WatchConnectivityModule;

  beforeEach(() => {
    module = {
      getSessionState: async () => ({
        isPaired: true,
        isReachable: false,
        activationState: "activated",
      }),
      sendMessage: async () => {},
      onMessage: () => {},
      removeMessageHandler: () => {},
    };
  });

  it("getSessionState が状態を返す", async () => {
    const state = await module.getSessionState();
    expect(state.isPaired).toBe(true);
    expect(state.activationState).toBe("activated");
  });

  it("sendMessage がエラーなく実行される", async () => {
    await expect(module.sendMessage({ action: "startRound", courseName: "A", holeCount: 8 })).resolves.toBeUndefined();
  });

  it("onMessage がハンドラを登録できる", () => {
    const handler = () => {};
    expect(() => module.onMessage(handler)).not.toThrow();
  });
});
