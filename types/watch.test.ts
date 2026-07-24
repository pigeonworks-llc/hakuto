import type { WatchSessionState, WatchRoundData, WatchCommand } from "./watch";

describe("Watch types", () => {
  it("WatchSessionState の初期状態が disconnected", () => {
    const state: WatchSessionState = {
      isPaired: false,
      isReachable: false,
      activationState: "inactive",
    };
    expect(state.activationState).toBe("inactive");
    expect(state.isPaired).toBe(false);
  });

  it("WatchRoundData が正しい構造を持つ", () => {
    const data: WatchRoundData = {
      courseName: "テストコース",
      holeCount: 8,
      scores: [],
      currentHole: 1,
      timestamp: Date.now(),
    };
    expect(data.holeCount).toBe(8);
    expect(data.scores).toHaveLength(0);
  });

  it("WatchCommand が正しい action を持つ", () => {
    const cmd: WatchCommand = { action: "startRound", courseName: "A", holeCount: 8 };
    expect(cmd.action).toBe("startRound");
  });
});
