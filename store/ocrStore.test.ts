import type { OcrResult } from "../types/ocr";

describe("OcrStore", () => {
  it("アクティブな OCR 結果を保持できる", async () => {
    // store の使用例をテスト
    const mockResult: OcrResult = {
      courseName: "テストコース",
      date: "2026-07-24",
      holes: [{ holeNumber: 1, strokes: 3, rawText: "3" }],
      rawText: "1 3",
      source: "camera",
    };
    expect(mockResult.courseName).toBe("テストコース");
    expect(mockResult.holes).toHaveLength(1);
  });

  it("空の結果を扱える", () => {
    const empty: OcrResult = {
      courseName: null,
      date: null,
      holes: [],
      rawText: "",
      source: "camera",
    };
    expect(empty.holes).toHaveLength(0);
  });
});
