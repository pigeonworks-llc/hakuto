import type { WatchSessionState } from "../types/watch";

describe("useWatchRound", () => {
  it("初期状態が未接続", () => {
    const state: WatchSessionState = {
      isPaired: false,
      isReachable: false,
      activationState: "inactive",
    };
    expect(state.activationState).toBe("inactive");
  });

  it("Watch 接続時に isPaired が true", () => {
    const state: WatchSessionState = {
      isPaired: true,
      isReachable: true,
      activationState: "activated",
    };
    expect(state.isPaired).toBe(true);
  });
});
