import type { WatchSessionState, WatchRoundData, WatchCommand, SyncRoundPayload } from "./watch";

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

  it("WatchRoundData が place/totalStrokes を持つ", () => {
    const data: WatchRoundData = {
      place: "テスト場所",
      holeCount: 8,
      scores: [4, 3, 4],
      currentHole: 4,
      totalStrokes: 11,
      timestamp: Date.now(),
    };
    expect(data.place).toBe("テスト場所");
    expect(data.totalStrokes).toBe(11);
    expect(data.scores).toHaveLength(3);
  });

  it("WatchRoundData の place は null を許容する", () => {
    const data: WatchRoundData = {
      place: null,
      holeCount: 8,
      scores: [],
      currentHole: 1,
      totalStrokes: 0,
      timestamp: Date.now(),
    };
    expect(data.place).toBeNull();
  });

  it("WatchCommand が place/holeCount を持つ", () => {
    const cmd: WatchCommand = { action: "startRound", place: "公園", holeCount: 8 };
    expect(cmd.action).toBe("startRound");
    expect(cmd.place).toBe("公園");
  });

  it("SyncRoundPayload が同期データ構造を持つ", () => {
    const payload: SyncRoundPayload = {
      action: "syncRound",
      id: "abc-123",
      place: "河川敷",
      playedAt: "2026-07-24T10:00:00Z",
      scores: [4, 3, 5, 4],
      totalStrokes: 16,
    };
    expect(payload.action).toBe("syncRound");
    expect(payload.totalStrokes).toBe(16);
    expect(payload.scores).toHaveLength(4);
  });
});
