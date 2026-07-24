import { parseSyncPayload } from "./syncPayload";

describe("parseSyncPayload", () => {
  it("正しい syncRound メッセージを SyncRoundPayload に変換する", () => {
    const result = parseSyncPayload({
      action: "syncRound",
      id: "watch-123",
      place: "河川敷公園",
      playedAt: "2026-07-24T10:30:00.000Z",
      scores: [1, 3, 2, 4],
      totalStrokes: 7,
    });
    expect(result).toEqual({
      action: "syncRound",
      id: "watch-123",
      place: "河川敷公園",
      playedAt: "2026-07-24T10:30:00.000Z",
      scores: [1, 3, 2, 4],
      totalStrokes: 7,
    });
  });

  it("action が syncRound でなければ null を返す", () => {
    expect(parseSyncPayload({ action: "startRound", id: "x" })).toBeNull();
  });

  it("id が無い/文字列でなければ null を返す", () => {
    expect(parseSyncPayload({ action: "syncRound", scores: [1] })).toBeNull();
    expect(
      parseSyncPayload({ action: "syncRound", id: 123, scores: [1] }),
    ).toBeNull();
  });

  it("scores が配列でなければ null を返す", () => {
    expect(
      parseSyncPayload({ action: "syncRound", id: "x", scores: "1,2" }),
    ).toBeNull();
  });

  it("place が文字列でなければ null に正規化する", () => {
    const result = parseSyncPayload({
      action: "syncRound",
      id: "x",
      place: null,
      playedAt: "2026-07-24T10:30:00.000Z",
      scores: [2, 3],
      totalStrokes: 5,
    });
    expect(result?.place).toBeNull();
  });

  it("scores 内の非数値を除去する", () => {
    const result = parseSyncPayload({
      action: "syncRound",
      id: "x",
      playedAt: "2026-07-24T10:30:00.000Z",
      scores: [1, "2", 3, null, 4],
      totalStrokes: 8,
    });
    expect(result?.scores).toEqual([1, 3, 4]);
  });

  it("playedAt が欠落していても文字列にフォールバックする", () => {
    const result = parseSyncPayload({
      action: "syncRound",
      id: "x",
      scores: [1, 2],
      totalStrokes: 3,
    });
    expect(typeof result?.playedAt).toBe("string");
    expect(result?.playedAt.length).toBeGreaterThan(0);
  });

  it("totalStrokes が数値でなければ 0 にフォールバックする", () => {
    const result = parseSyncPayload({
      action: "syncRound",
      id: "x",
      playedAt: "2026-07-24T10:30:00.000Z",
      scores: [1, 2],
    });
    expect(result?.totalStrokes).toBe(0);
  });
});
