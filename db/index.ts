import * as SQLite from "expo-sqlite";
import { SCHEMA, SCHEMA_VERSION } from "./schema";

let db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync("hakuto.db");

  const version = db.getFirstSync<{ version: number }>(
    "PRAGMA user_version"
  );
  const currentVersion = version?.version ?? 0;

  if (currentVersion < 1) {
    // Fresh install — create tables from scratch
    await db.execAsync(SCHEMA);
    await db.execAsync("PRAGMA user_version = 1");
  }

  if (currentVersion >= 1 && currentVersion < 2) {
    // Migration 1→2: drop old tables (no data), create new schema
    await db.execAsync("DROP TABLE IF EXISTS hole_scores");
    await db.execAsync("DROP TABLE IF EXISTS rounds");
    await db.execAsync("DROP TABLE IF EXISTS courses");
    await db.execAsync(SCHEMA);
  }

  await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
  await db.execAsync("PRAGMA journal_mode = WAL;");
  return db;
}

export function resetDbForTest(): void {
  db = null;
}
