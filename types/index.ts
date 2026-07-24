/** コース */
export interface Course {
  id: string;
  name: string;
  holeCount: number;
  createdAt: string;
  updatedAt: string;
}

/** ラウンド */
export interface Round {
  id: string;
  courseId: string;
  courseName: string;
  date: string;
  totalStrokes: number;
  notes: string | null;
  source: "manual" | "watch" | "ocr";
  createdAt: string;
}

/** ホールごとの打数 */
export interface HoleScore {
  id: string;
  roundId: string;
  holeNumber: number;
  strokes: number;
}

/** 新規ラウンド作成用入力 */
export interface NewRoundInput {
  courseId: string;
  courseName: string;
  date: string;
  scores: number[];
  notes?: string;
  source?: "manual" | "watch" | "ocr";
}

/** ラウンド + ホールスコア一覧 */
export interface RoundWithScores extends Round {
  scores: HoleScore[];
}

/** 統計サマリ */
export interface StatsSummary {
  totalRounds: number;
  averageStrokes: number;
  bestScore: number;
  recentAvgStrokes: number;
}

/** コース別統計 */
export interface CourseStats {
  courseId: string;
  courseName: string;
  rounds: number;
  averageStrokes: number;
  bestScore: number;
}
