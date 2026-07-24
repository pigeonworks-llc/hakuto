/** OCR で認識されたホールごとの打数 */
export interface OcrHoleResult {
  holeNumber: number;
  strokes: number | null; // null = 認識不能
  rawText: string;
}

/** 認識モード */
export type OcrSource = "camera" | "album";

/** OCR 処理の状態 */
export type OcrStatus = "idle" | "scanning" | "processing" | "done" | "error";

/** OCR 処理結果 */
export interface OcrResult {
  courseName: string | null;
  date: string | null;
  holes: OcrHoleResult[];
  rawText: string;
  source: OcrSource;
}

/** Native OCR モジュールの interface */
export interface OcrModule {
  /** 画像 URI からテキスト認識 */
  recognizeText(imageUri: string): Promise<string>;
  /** モジュールが利用可能か */
  isAvailable(): Promise<boolean>;
}
