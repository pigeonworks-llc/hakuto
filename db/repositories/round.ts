import type { SQLiteDatabase } from "expo-sqlite";
import type {
  HoleScore,
  NewRoundInput,
  Round,
  RoundWithScores,
} from "../../types";

let counter = 0;
function genId(): string {
  counter++;
  return `${Date.now()}-${counter}-${Math.random().toString(36).slice(2, 8)}`;
}

/** HIO の数と実打数の生データから total_strokes を計算 (HIO −3打) */
export function calculateTotalStrokes(scores: number[]): {
  rawTotal: number;
  holeInOneCount: number;
  totalStrokes: number;
} {
  const rawTotal = scores.reduce((a, b) => a + b, 0);
  const holeInOneCount = scores.filter((s) => s === 1).length;
  const totalStrokes = rawTotal - 3 * holeInOneCount;
  return { rawTotal, holeInOneCount, totalStrokes };
}

export async function insertRound(
  db: SQLiteDatabase,
  input: NewRoundInput,
): Promise<string> {
  const roundId = genId();
  const { totalStrokes } = calculateTotalStrokes(input.scores);
  const source = input.source ?? "manual";

  await db.runAsync(
    "INSERT INTO rounds (id, place, played_at, total_strokes, notes, source) VALUES (?, ?, ?, ?, ?, ?)",
    [
      roundId,
      input.place ?? null,
      input.playedAt,
      totalStrokes,
      input.notes ?? null,
      source,
    ],
  );

  for (let i = 0; i < input.scores.length; i++) {
    const scoreId = genId();
    await db.runAsync(
      "INSERT INTO hole_scores (id, round_id, hole_number, strokes) VALUES (?, ?, ?, ?)",
      [scoreId, roundId, i + 1, input.scores[i]],
    );
  }

  return roundId;
}

export async function listRounds(db: SQLiteDatabase): Promise<Round[]> {
  return await db.getAllAsync<Round>(
    "SELECT id, place, played_at as playedAt, total_strokes as totalStrokes, notes, source, created_at as createdAt FROM rounds ORDER BY played_at DESC, created_at DESC",
  );
}

export async function getRound(
  db: SQLiteDatabase,
  id: string,
): Promise<RoundWithScores | null> {
  const round = await db.getFirstAsync<Round>(
    "SELECT id, place, played_at as playedAt, total_strokes as totalStrokes, notes, source, created_at as createdAt FROM rounds WHERE id = ?",
    [id],
  );
  if (!round) return null;

  const scores = await db.getAllAsync<HoleScore>(
    "SELECT id, round_id as roundId, hole_number as holeNumber, strokes FROM hole_scores WHERE round_id = ? ORDER BY hole_number",
    [id],
  );

  return { ...round, scores };
}

export async function deleteRound(
  db: SQLiteDatabase,
  id: string,
): Promise<void> {
  await db.runAsync("DELETE FROM rounds WHERE id = ?", [id]);
}
