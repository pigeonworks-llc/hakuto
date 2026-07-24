import type { Round, NewRoundInput } from "../../types";

describe("round repository", () => {
  it("Round 型が正しく構築できる", () => {
    const round: Round = {
      id: "round-1",
      courseId: "course-1",
      courseName: "日南町営グラウンド",
      date: "2026-07-24",
      totalStrokes: 32,
      notes: null,
      source: "manual",
      createdAt: "2026-07-24T00:00:00.000Z",
    };
    expect(round.totalStrokes).toBe(32);
  });

  it("NewRoundInput 型が正しく構築できる", () => {
    const input: NewRoundInput = {
      courseId: "course-1",
      courseName: "日南町営グラウンド",
      date: "2026-07-24",
      scores: [4, 3, 5, 4, 3, 4, 5, 4],
    };
    expect(input.scores.length).toBe(8);
  });
});
