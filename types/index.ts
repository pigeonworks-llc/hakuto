/** ラウンド */
export interface Round {
  id: string;
  place: string | null;
  playedAt: string;
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
  place: string | null;
  playedAt: string;
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
