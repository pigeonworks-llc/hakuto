import type { WatchSessionState, HakutoWatchModule, SyncRoundPayload } from "../../types/watch";

describe("HakutoWatchModule", () => {
  let module: HakutoWatchModule;

  beforeEach(() => {
    module = {
      getSessionState: async () => ({
        isPaired: true,
        isReachable: false,
        activationState: "activated",
      }),
      sendMessage: async () => {},
    };
  });

  it("getSessionState が状態を返す", async () => {
    const state = await module.getSessionState();
    expect(state.isPaired).toBe(true);
    expect(state.activationState).toBe("activated");
  });

  it("sendMessage が WatchCommand でエラーなく実行される", async () => {
    await expect(module.sendMessage({ action: "startRound", place: "公園", holeCount: 8 })).resolves.toBeUndefined();
  });

  it("sendMessage が SyncRoundPayload でエラーなく実行される", async () => {
    const payload: SyncRoundPayload = {
      action: "syncRound",
      id: "abc",
      place: null,
      playedAt: "2026-07-24T10:00:00Z",
      scores: [4, 3],
      totalStrokes: 7,
    };
    await expect(module.sendMessage(payload)).resolves.toBeUndefined();
  });
});
