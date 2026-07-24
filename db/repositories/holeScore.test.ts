import type { HoleScore } from "../../types";

describe("holeScore repository", () => {
  it("HoleScore 型が正しく構築できる", () => {
    const hs: HoleScore = {
      id: "hs-1",
      roundId: "round-1",
      holeNumber: 1,
      strokes: 4,
    };
    expect(hs.holeNumber).toBe(1);
    expect(hs.strokes).toBe(4);
  });
});
