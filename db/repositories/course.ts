import type { SQLiteDatabase } from "expo-sqlite";
import type { Course } from "../../types";

export async function listCourses(db: SQLiteDatabase): Promise<Course[]> {
  return await db.getAllAsync<Course>(
    "SELECT id, name, hole_count as holeCount, created_at as createdAt, updated_at as updatedAt FROM courses ORDER BY name"
  );
}

export async function getCourse(db: SQLiteDatabase, id: string): Promise<Course | null> {
  return (
    (await db.getFirstAsync<Course>(
      "SELECT id, name, hole_count as holeCount, created_at as createdAt, updated_at as updatedAt FROM courses WHERE id = ?",
      [id]
    )) ?? null
  );
}

export async function insertCourse(
  db: SQLiteDatabase,
  id: string,
  name: string,
  holeCount: number
): Promise<void> {
  await db.runAsync(
    "INSERT INTO courses (id, name, hole_count) VALUES (?, ?, ?)",
    [id, name, holeCount]
  );
}

export async function deleteCourse(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync("DELETE FROM courses WHERE id = ?", [id]);
}
