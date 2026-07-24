import type { OcrHoleResult, OcrResult, OcrSource } from "./ocr";

describe("OCR types", () => {
  it("OcrHoleResult に null strokes を許容する", () => {
    const result: OcrHoleResult = { holeNumber: 1, strokes: null, rawText: "---" };
    expect(result.strokes).toBeNull();
  });

  it("OcrResult に全フィールドが含まれる", () => {
    const holes: OcrHoleResult[] = [
      { holeNumber: 1, strokes: 3, rawText: "3" },
    ];
    const result: OcrResult = {
      courseName: "テストコース",
      date: "2026-07-24",
      holes,
      rawText: "3",
      source: "camera",
    };
    expect(result.courseName).toBe("テストコース");
    expect(result.holes).toHaveLength(1);
    expect(result.source).toBe("camera");
  });

  it("source は camera または album", () => {
    const camera: OcrSource = "camera";
    const album: OcrSource = "album";
    expect([camera, album]).toContain("camera");
    expect([camera, album]).toContain("album");
  });
});
