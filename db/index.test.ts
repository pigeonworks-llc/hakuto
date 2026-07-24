import { SCHEMA, SCHEMA_VERSION } from "./schema";

describe("db/index", () => {
  it("スキーマに rounds と hole_scores の定義が含まれる", () => {
    expect(SCHEMA).toContain("CREATE TABLE IF NOT EXISTS rounds");
    expect(SCHEMA).toContain("CREATE TABLE IF NOT EXISTS hole_scores");
  });

  it("スキーマに courses の定義は含まれない", () => {
    expect(SCHEMA).not.toContain("CREATE TABLE IF NOT EXISTS courses");
  });

  it("SCHEMA_VERSION が 2 である", () => {
    expect(SCHEMA_VERSION).toBe(2);
  });

  it("rounds テーブルに place と played_at カラムが定義されている", () => {
    expect(SCHEMA).toContain("place TEXT");
    expect(SCHEMA).toContain("played_at TEXT NOT NULL");
  });
});
