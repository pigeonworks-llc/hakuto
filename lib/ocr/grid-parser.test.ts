import { describe, it, expect } from "@jest/globals";
import { parseOcrText, findNumberSequences, parseHoleStrokes } from "./grid-parser";

describe("findNumberSequences", () => {
  it("空白区切りの数字列を抽出する", () => {
    const result = findNumberSequences("1 3 2 4 3 5 4 6 5 3");
    expect(result).toEqual([1, 3, 2, 4, 3, 5, 4, 6, 5, 3]);
  });

  it("改行区切りの数字列を抽出する", () => {
    const result = findNumberSequences("1\n3\n2\n4\n3");
    expect(result).toEqual([1, 3, 2, 4, 3]);
  });

  it("数字以外の文字を無視する", () => {
    const result = findNumberSequences("Hole 1: 3 strokes, Hole 2: 4 strokes");
    expect(result).toEqual([1, 3, 2, 4]);
  });

  it("空の入力には空配列を返す", () => {
    expect(findNumberSequences("")).toEqual([]);
    expect(findNumberSequences("abc def")).toEqual([]);
  });
});

describe("parseHoleStrokes", () => {
  it("連続する数字を穴番号と打数に交互に割り当てる", () => {
    const result = parseHoleStrokes([1, 3, 2, 4, 3, 5, 4, 6, 5, 3]);
    expect(result).toEqual([
      { holeNumber: 1, strokes: 3 },
      { holeNumber: 2, strokes: 4 },
      { holeNumber: 3, strokes: 5 },
      { holeNumber: 4, strokes: 6 },
      { holeNumber: 5, strokes: 3 },
    ]);
  });

  it("穴番号と打数がペアになっていない場合、余りを切り捨てる", () => {
    const result = parseHoleStrokes([1, 3, 2, 4, 3]);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ holeNumber: 1, strokes: 3 });
  });

  it("最初の数字が 1 でない場合も startHole を指定できる", () => {
    const result = parseHoleStrokes([3, 5, 4, 6, 5, 3], 3);
    expect(result).toEqual([
      { holeNumber: 3, strokes: 5 },
      { holeNumber: 4, strokes: 6 },
      { holeNumber: 5, strokes: 3 },
    ]);
  });
});

describe("parseOcrText", () => {
  it("簡略形式（スペース区切り数字）をパースする", () => {
    const result = parseOcrText("1 3 2 4 3 5 4 6 5 3 6 4 7 5 8 4");
    expect(result.courseName).toBeNull();
    expect(result.holes).toHaveLength(8);
    expect(result.holes[0]).toEqual({ holeNumber: 1, strokes: 3, rawText: "3" });
  });

  it("コース名を含むテキストからコース名を抽出する", () => {
    const text = "コース: 日南コース\n1 3 2 4 3 5 4 6";
    const result = parseOcrText(text);
    expect(result.courseName).toBe("日南コース");
  });

  it("日付を含むテキストから日付を抽出する", () => {
    const text = "2026/7/24\n1 3 2 4 3 5 4 6";
    const result = parseOcrText(text);
    expect(result.date).toBe("2026-07-24");
  });

  it("日本語日付からも日付を抽出する", () => {
    const text = "2026年7月24日\n1 3 2 4 3 5 4 6";
    const result = parseOcrText(text);
    expect(result.date).toBe("2026-07-24");
  });

  it("16 ホールのスコアもパースできる", () => {
    const text = "1 3 2 4 3 5 4 6 5 3 6 4 7 5 8 4 9 5 10 4 11 3 12 5 13 4 14 6 15 3 16 4";
    const result = parseOcrText(text);
    expect(result.holes).toHaveLength(16);
    expect(result.holes[15]).toEqual({ holeNumber: 16, strokes: 4, rawText: "4" });
  });

  it("認識不能な値を null として保持する", () => {
    const text = "1 3 2 X 3 5 4 6";
    const result = parseOcrText(text);
    expect(result.holes).toHaveLength(4);
    expect(result.holes[1].strokes).toBeNull();
    expect(result.holes[1].rawText).toBe("X");
  });

  it("空のテキストには空スコアを返す", () => {
    const result = parseOcrText("");
    expect(result.holes).toEqual([]);
    expect(result.courseName).toBeNull();
  });
});
