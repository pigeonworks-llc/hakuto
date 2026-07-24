import type { NewRoundInput, Round } from "../../types";
import { calculateTotalStrokes } from "./round";

describe("calculateTotalStrokes", () => {
  it("HIO がない場合、実打数がそのまま totalStrokes になる", () => {
    const result = calculateTotalStrokes([4, 3, 5, 4, 3, 4, 5, 4]);
    expect(result.rawTotal).toBe(32);
    expect(result.holeInOneCount).toBe(0);
    expect(result.totalStrokes).toBe(32);
  });

  it("HIO が 1 つある場合、実打数 -3 が totalStrokes になる", () => {
    const result = calculateTotalStrokes([1, 3, 5, 4, 3, 4, 5, 4]);
    expect(result.rawTotal).toBe(29);
    expect(result.holeInOneCount).toBe(1);
    expect(result.totalStrokes).toBe(26);
  });

  it("HIO が 2 つある場合、実打数 -6 が totalStrokes になる", () => {
    const result = calculateTotalStrokes([1, 3, 5, 1, 3, 4, 5, 4]);
    expect(result.rawTotal).toBe(26);
    expect(result.holeInOneCount).toBe(2);
    expect(result.totalStrokes).toBe(20);
  });

  it("すべて HIO の場合、実打数 = ホール数、totalStrokes = 5 ホールで -10", () => {
    const result = calculateTotalStrokes([1, 1, 1, 1, 1]);
    expect(result.rawTotal).toBe(5);
    expect(result.holeInOneCount).toBe(5);
    expect(result.totalStrokes).toBe(-10);
  });

  it("1 ホールのみの場合も正しく計算される", () => {
    const result = calculateTotalStrokes([1]);
    expect(result.rawTotal).toBe(1);
    expect(result.holeInOneCount).toBe(1);
    expect(result.totalStrokes).toBe(-2);
  });

  it("空配列の場合、すべて 0 を返す", () => {
    const result = calculateTotalStrokes([]);
    expect(result.rawTotal).toBe(0);
    expect(result.holeInOneCount).toBe(0);
    expect(result.totalStrokes).toBe(0);
  });

  it("HIO 以外の最小打数 (2) でも HIO と誤判定しない", () => {
    const result = calculateTotalStrokes([2, 2, 2, 2, 2, 2, 2, 2]);
    expect(result.holeInOneCount).toBe(0);
    expect(result.totalStrokes).toBe(16);
  });
});

describe("Round type", () => {
  it("新しい Round 型が place/playedAt を持つ", () => {
    const round: Round = {
      id: "round-1",
      place: "河川敷公園",
      playedAt: "2026-07-24T10:30:00.000Z",
      totalStrokes: 32,
      notes: null,
      source: "manual",
      createdAt: "2026-07-24T10:32:00.000Z",
    };
    expect(round.place).toBe("河川敷公園");
    expect(round.playedAt).toBe("2026-07-24T10:30:00.000Z");
    expect(round.totalStrokes).toBe(32);
  });

  it("Round 型の place は null を許容する", () => {
    const round: Round = {
      id: "round-2",
      place: null,
      playedAt: "2026-07-24T12:00:00.000Z",
      totalStrokes: 28,
      notes: null,
      source: "manual",
      createdAt: "2026-07-24T12:00:00.000Z",
    };
    expect(round.place).toBeNull();
  });

  it("NewRoundInput が place/playedAt を使う", () => {
    const input: NewRoundInput = {
      place: "河川敷公園",
      playedAt: "2026-07-24T10:30:00.000Z",
      scores: [4, 3, 5, 4, 3, 4, 5, 4],
    };
    expect(input.place).toBe("河川敷公園");
    expect(input.scores.length).toBe(8);
    expect(input.playedAt).toBe("2026-07-24T10:30:00.000Z");
  });

  it("NewRoundInput の place は null を許容する", () => {
    const input: NewRoundInput = {
      place: null,
      playedAt: "2026-07-24T12:00:00.000Z",
      scores: [4, 3, 5, 4, 3, 4, 5, 4],
    };
    expect(input.place).toBeNull();
  });

  it("NewRoundInput は source を省略できる (manual が default)", () => {
    const input: NewRoundInput = {
      place: "公園",
      playedAt: "2026-07-24T12:00:00.000Z",
      scores: [3, 4, 5],
    };
    // source は省略可能だが既定で "manual"
    expect(input.source).toBeUndefined();
  });
});

describe("Full scenario: 8-hole round with HIO", () => {
  it("8ホール中2ホールが HIO の場合、合計 = raw - 6", () => {
    // シナリオ: 8H で [1, 3, 2, 4, 1, 3, 2, 4] = raw 20, HIO 2回
    const scores = [1, 3, 2, 4, 1, 3, 2, 4];
    const { rawTotal, holeInOneCount, totalStrokes } = calculateTotalStrokes(scores);
    expect(rawTotal).toBe(20);
    expect(holeInOneCount).toBe(2);
    expect(totalStrokes).toBe(14); // 20 - 2*3 = 14
  });

  it("16ホールのラウンドも正しく計算される", () => {
    const scores = Array.from({ length: 16 }, (_, i) => (i % 4 === 0 ? 1 : 3));
    // 16ホール中 4 ホールが HIO (index 0,4,8,12)、残り12ホールが 3打
    const { rawTotal, holeInOneCount, totalStrokes } = calculateTotalStrokes(scores);
    expect(holeInOneCount).toBe(4);
    expect(rawTotal).toBe(40); // 4*1 + 12*3 = 40
    expect(totalStrokes).toBe(28); // 40 - 4*3 = 28
  });
});
