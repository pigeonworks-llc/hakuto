import { COLORS, HOLE_COUNTS, STROKE_RANGE } from "./constants";

describe("constants", () => {
  it("COLORS がブランドカラーを持つ", () => {
    expect(COLORS.primary).toBe("#3a5a40");
    expect(COLORS.background).toBe("#fafaf7");
    expect(COLORS.accent).toBe("#5fb3a1");
  });

  it("HOLE_COUNTS が 8 と 16", () => {
    expect(HOLE_COUNTS).toEqual([8, 16]);
  });

  it("STROKE_RANGE が 1〜15", () => {
    expect(STROKE_RANGE.min).toBe(1);
    expect(STROKE_RANGE.max).toBe(15);
  });
});
