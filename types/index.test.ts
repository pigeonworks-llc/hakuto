import type { Course, Round, HoleScore, StatsSummary, CourseStats } from "./index";

describe("types", () => {
  it("Course 型が期待するフィールドを持つ", () => {
    const course: Course = {
      id: "1",
      name: "テストコース",
      holeCount: 8,
      createdAt: "2026-07-24T00:00:00.000Z",
      updatedAt: "2026-07-24T00:00:00.000Z",
    };
    expect(course.name).toBe("テストコース");
  });

  it("Round 型が期待するフィールドを持つ", () => {
    const round: Round = {
      id: "1",
      courseId: "1",
      courseName: "テストコース",
      date: "2026-07-24",
      totalStrokes: 32,
      notes: null,
      source: "manual",
      createdAt: "2026-07-24T00:00:00.000Z",
    };
    expect(round.totalStrokes).toBe(32);
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

  it("CourseStats 型が期待するフィールドを持つ", () => {
    const cs: CourseStats = {
      courseId: "1",
      courseName: "テストコース",
      rounds: 5,
      averageStrokes: 34.0,
      bestScore: 30,
    };
    expect(cs.rounds).toBe(5);
  });
});
