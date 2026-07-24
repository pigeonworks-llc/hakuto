import type { OcrHoleResult, OcrResult } from "../../types/ocr";

/**
 * OCR 抽出テキストから数字列を抽出する。
 * 「Hole 1: 3」のようなテキストから [1, 3] を取り出す。
 */
export function findNumberSequences(text: string): number[] {
  const digits = text.match(/\d+/g);
  if (!digits) return [];
  return digits.map(Number);
}

/**
 * 数字列を (穴番号, 打数) のペアに変換する。
 * [1, 3, 2, 4, 3, 5] → [{hole:1, strokes:3}, {hole:2, strokes:4}, {hole:3, strokes:5}]
 * @param numbers 数字列
 * @param startHole 開始ホール番号 (default: 1)
 */
export function parseHoleStrokes(
  numbers: number[],
  startHole: number = 1,
): { holeNumber: number; strokes: number }[] {
  const pairs: { holeNumber: number; strokes: number }[] = [];
  for (let i = 0; i + 1 < numbers.length; i += 2) {
    pairs.push({
      holeNumber: startHole + i / 2,
      strokes: numbers[i + 1],
    });
  }
  return pairs;
}

/**
 * コース名らしき行を抽出する。
 * 「コース: X」「場所: X」パターンにマッチ。
 */
function extractCourseName(lines: string[]): string | null {
  for (const line of lines) {
    const match = line.match(/^(?:コース|場所|会場|course)\s*[:：]\s*(.+)$/i);
    if (match) return match[1].trim();
  }
  return null;
}

/**
 * 日付らしき行を抽出する。
 * YYYY/M/D, YYYY年M月D日, YYYY-MM-DD にマッチ。
 */
function extractDate(lines: string[]): string | null {
  for (const line of lines) {
    const m1 = line.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/);
    if (m1) {
      const y = m1[1];
      const m = m1[2].padStart(2, "0");
      const d = m1[3].padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
    const m2 = line.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
    if (m2) {
      return `${m2[1]}-${m2[2].padStart(2, "0")}-${m2[3].padStart(2, "0")}`;
    }
    const m3 = line.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m3) {
      return `${m3[1]}-${m3[2].padStart(2, "0")}-${m3[3].padStart(2, "0")}`;
    }
  }
  return null;
}

/**
 * 認識不能マーカーを検出する (X, -, xx, 空欄)。
 */
function isUnreadableValue(token: string): boolean {
  return /^[xX\-]{1,3}$/.test(token) || token.trim() === "";
}

/**
 * OCR 抽出テキストからスコアカードの構造をパースする。
 *
 * 想定入力例:
 * ```
 * コース: 日南コース
 * 2026/7/24
 * 1 3 2 4 3 5 4 6 5 3 6 4 7 5 8 4
 * ```
 */
export function parseOcrText(text: string): OcrResult {
  if (!text.trim()) {
    return { courseName: null, date: null, holes: [], rawText: text, source: "camera" };
  }

  const lines = text.split("\n").filter((l) => l.trim());
  const courseName = extractCourseName(lines);
  const date = extractDate(lines);

  // 数字ペアが読みやすい行を探す — 最小で数字が 4 つ以上連続する行を使う
  const numberLine = lines
    .map((line) => line.match(/\d+/g))
    .filter((m): m is RegExpMatchArray => m !== null && m.length >= 4)
    .sort((a, b) => b.length - a.length)[0];

  if (!numberLine) {
    return { courseName, date, holes: [], rawText: text, source: "camera" };
  }

  // 原テキストから tokens を取り出し、認識不能マーカーを null 扱いする
  const rawTokens = text
    .split(/[\s,，、\t\n\r]+/)
    .filter((t) => t.length > 0);

  const allNumbers = numberLine.map(Number);
  const holes: OcrHoleResult[] = [];

  let startHole = 1;
  // 最初の数字が 1-8 の範囲なら穴番号扱い（ペア判定）
  // 先頭が穴番号っぽい場合、飛ばして打数からスタート
  let offset = 0;
  if (
    allNumbers.length >= 2 &&
    allNumbers[0] >= 1 &&
    allNumbers[0] <= 16 &&
    !rawTokens.some((t) => t.startsWith("Hole") || t.startsWith("hole"))
  ) {
    // 単純な「1 3 2 4」形式 → 最初の数字は穴番号
    // 穴番号マッチング: 1,2,3,... と続いているかチェック
    const isSequential = allNumbers.slice(0, Math.min(8, allNumbers.length)).every(
      (n, i) => n === i + 1,
    );
    if (isSequential) {
      offset = 1; // 穴番号列をスキップ
    }
  }

  for (let i = offset; i < allNumbers.length; i++) {
    const holeNumber = startHole + (i - offset);
    const rawToken = rawTokens.find(
      (t) => t === String(allNumbers[i]),
    ) ?? String(allNumbers[i]);
    const strokes = isUnreadableValue(rawToken)
      ? null
      : allNumbers[i];
    holes.push({
      holeNumber,
      strokes,
      rawText: rawToken,
    });
  }

  return { courseName, date, holes, rawText: text, source: "camera" };
}
