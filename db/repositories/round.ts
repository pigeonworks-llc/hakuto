import type { SQLiteDatabase } from "expo-sqlite";
import type { HoleScore, NewRoundInput, Round, RoundWithScores } from "../../types";

let counter = 0;
function genId(): string {
  counter++;
  return `${Date.now()}-${counter}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function insertRound(
  db: SQLiteDatabase,
  input: NewRoundInput
): Promise<string> {
  const roundId = genId();
  const total = input.scores.reduce((a, b) => a + b, 0);
  const source = input.source ?? "manual";

  await db.runAsync(
    "INSERT INTO rounds (id, course_id, course_name, date, total_strokes, notes, source) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [roundId, input.courseId, input.courseName, input.date, total, input.notes ?? null, source]
  );

  for (let i = 0; i < input.scores.length; i++) {
    const scoreId = genId();
    await db.runAsync(
      "INSERT INTO hole_scores (id, round_id, hole_number, strokes) VALUES (?, ?, ?, ?)",
      [scoreId, roundId, i + 1, input.scores[i]]
    );
  }

  return roundId;
}

export async function listRounds(db: SQLiteDatabase): Promise<Round[]> {
  return await db.getAllAsync<Round>(
    "SELECT id, course_id as courseId, course_name as courseName, date, total_strokes as totalStrokes, notes, source, created_at as createdAt FROM rounds ORDER BY date DESC, created_at DESC"
  );
}

export async function getRound(
  db: SQLiteDatabase,
  id: string
): Promise<RoundWithScores | null> {
  const round = await db.getFirstAsync<Round>(
    "SELECT id, course_id as courseId, course_name as courseName, date, total_strokes as totalStrokes, notes, source, created_at as createdAt FROM rounds WHERE id = ?",
    [id]
  );
  if (!round) return null;

  const scores = await db.getAllAsync<HoleScore>(
    "SELECT id, round_id as roundId, hole_number as holeNumber, strokes FROM hole_scores WHERE round_id = ? ORDER BY hole_number",
    [id]
  );

  return { ...round, scores };
}

export async function deleteRound(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync("DELETE FROM rounds WHERE id = ?", [id]);
}
