import * as SQLite from "expo-sqlite";
import { SCHEMA } from "./schema";

let db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync("hakuto.db");
  await db.execAsync(SCHEMA);
  await db.execAsync("PRAGMA journal_mode = WAL;");
  return db;
}

export function resetDbForTest(): void {
  db = null;
}
