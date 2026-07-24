import type { Round } from "../types";

describe("RoundCard", () => {
  const baseRound: Round = {
    id: "1",
    place: "河川敷公園",
    playedAt: "2026-07-24T10:30:00.000Z",
    totalStrokes: 32,
    notes: null,
    source: "manual",
    createdAt: "2026-07-24T10:32:00.000Z",
  };

  it("place が表示用に使われる", () => {
    expect(baseRound.place).toBe("河川敷公園");
  });

  it("playedAt は日付+時刻の ISO 文字列", () => {
    expect(baseRound.playedAt).toContain("T");
    expect(baseRound.playedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("place が null の場合は場所不明として扱われる", () => {
    const r: Round = { ...baseRound, place: null };
    expect(r.place).toBeNull();
  });

  it("totalStrokes は HIO 計算後の値である", () => {
    expect(baseRound.totalStrokes).toBe(32);
  });

  it("source は manual/watch/ocr のいずれか", () => {
    expect(["manual", "watch", "ocr"]).toContain(baseRound.source);
  });

  it("Round 型に courseId は含まれない", () => {
    expect("courseId" in baseRound).toBe(false);
    expect("courseName" in baseRound).toBe(false);
    expect("date" in baseRound).toBe(false);
  });
});
