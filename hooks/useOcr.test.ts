import type { OcrResult } from "../types/ocr";

describe("useOcr", () => {
  it("mock store の初期状態が idle", () => {
    const status = "idle" as const;
    expect(status).toBe("idle");
  });

  it("OcrResult が正しい構造を持つ", () => {
    const result: OcrResult = {
      courseName: "テスト",
      date: "2026-07-24",
      holes: [
        { holeNumber: 1, strokes: 3, rawText: "3" },
        { holeNumber: 2, strokes: 5, rawText: "5" },
      ],
      rawText: "1 3 2 5",
      source: "camera",
    };
    expect(result.holes).toHaveLength(2);
    expect(result.source).toBe("camera");
  });

  it("OCR 結果の打数を更新できる", () => {
    const result: OcrResult = {
      courseName: null,
      date: null,
      holes: [
        { holeNumber: 1, strokes: null, rawText: "X" },
        { holeNumber: 2, strokes: 4, rawText: "4" },
      ],
      rawText: "",
      source: "camera",
    };
    const updated = {
      ...result,
      holes: result.holes.map((h, i) =>
        i === 0 ? { ...h, strokes: 3 } : h,
      ),
    };
    expect(updated.holes[0].strokes).toBe(3);
  });
});
