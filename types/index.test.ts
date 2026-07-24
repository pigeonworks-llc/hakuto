import type { Round, HoleScore, StatsSummary } from "./index";

describe("types", () => {
  it("Round 型が新しい place/playedAt フィールドを持つ", () => {
    const round: Round = {
      id: "1",
      place: "河川敷公園",
      playedAt: "2026-07-24T10:30:00.000Z",
      totalStrokes: 32,
      notes: null,
      source: "manual",
      createdAt: "2026-07-24T00:00:00.000Z",
    };
    expect(round.place).toBe("河川敷公園");
    expect(round.playedAt).toBe("2026-07-24T10:30:00.000Z");
    expect(round.totalStrokes).toBe(32);
  });

  it("Round 型の place は null を許容する", () => {
    const round: Round = {
      id: "2",
      place: null,
      playedAt: "2026-07-24T12:00:00.000Z",
      totalStrokes: 28,
      notes: null,
      source: "manual",
      createdAt: "2026-07-24T00:00:00.000Z",
    };
    expect(round.place).toBeNull();
  });

  it("HoleScore 型が期待するフィールドを持つ", () => {
    const hs: HoleScore = {
      id: "1",
      roundId: "1",
      holeNumber: 1,
      strokes: 4,
    };
    expect(hs.strokes).toBe(4);
  });

  it("StatsSummary 型が期待するフィールドを持つ", () => {
    const stats: StatsSummary = {
      totalRounds: 10,
      averageStrokes: 35.5,
      bestScore: 28,
      recentAvgStrokes: 34.2,
    };
    expect(stats.totalRounds).toBe(10);
  });

  it("Round 型に courseId と courseName は存在しない", () => {
    const round: Round = {
      id: "3",
      place: null,
      playedAt: "2026-07-24T12:00:00.000Z",
      totalStrokes: 28,
      notes: null,
      source: "manual",
      createdAt: "2026-07-24T00:00:00.000Z",
    };
    // @ts-expect-error — courseId は削除されたのでアクセス不可
    expect(round.courseId).toBeUndefined();
  });

  it("StatsSummary に courseIds/コース別フィールドは存在しない", () => {
    const stats: StatsSummary = {
      totalRounds: 10,
      averageStrokes: 35.5,
      bestScore: 28,
      recentAvgStrokes: 34.2,
    };
    // CourseStats 型そのものが削除されたことを確認
    expect("courseId" in stats).toBe(false);
  });
});
