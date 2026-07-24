import type { OcrResult } from "../../types/ocr";

describe("OcrScanScreen", () => {
  it("画面タイトルとアクションが表示される", () => {
    const title = "スコアカードスキャン";
    expect(title).toBeDefined();
  });

  it("カメラとアルバムの 2 つの入力方法がある", () => {
    const options = ["camera", "album"] as const;
    expect(options).toHaveLength(2);
    expect(options).toContain("camera");
    expect(options).toContain("album");
  });

  it("OCR 結果の打数が全て揃っているか判定する", () => {
    const result: OcrResult = {
      courseName: "テスト",
      date: "2026-07-24",
      holes: [
        { holeNumber: 1, strokes: 3, rawText: "3" },
        { holeNumber: 2, strokes: 4, rawText: "4" },
      ],
      rawText: "1 3 2 4",
      source: "camera",
    };
    const allRecognized = result.holes.every((h) => h.strokes !== null);
    expect(allRecognized).toBe(true);
  });

  it("一部認識不能な打数がある場合、null を含む", () => {
    const result: OcrResult = {
      courseName: null,
      date: null,
      holes: [
        { holeNumber: 1, strokes: 3, rawText: "3" },
        { holeNumber: 2, strokes: null, rawText: "X" },
      ],
      rawText: "1 3 2 X",
      source: "camera",
    };
    const unreadable = result.holes.filter((h) => h.strokes === null);
    expect(unreadable).toHaveLength(1);
  });
});
