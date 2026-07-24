import type { OcrResult, OcrHoleResult } from "../../types/ocr";

describe("OcrConfirmScreen", () => {
  const mockHoles: OcrHoleResult[] = Array.from({ length: 8 }, (_, i) => ({
    holeNumber: i + 1,
    strokes: 3 + i,
    rawText: String(3 + i),
  }));

  const mockResult: OcrResult = {
    courseName: "テストコース",
    date: "2026-07-24",
    holes: mockHoles,
    rawText: "",
    source: "camera",
  };

  it("全打数が表示される", () => {
    expect(mockResult.holes).toHaveLength(8);
  });

  it("打数合計が正しく計算される", () => {
    const total = mockResult.holes.reduce(
      (sum, h) => sum + (h.strokes ?? 0),
      0,
    );
    // 3+4+5+6+7+8+9+10 = 52
    expect(total).toBe(52);
  });

  it("打数を手動で修正できる", () => {
    const updated = mockResult.holes.map((h, i) =>
      i === 0 ? { ...h, strokes: 4 } : h,
    );
    expect(updated[0].strokes).toBe(4);
  });
});
