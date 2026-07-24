import { SCHEMA, SCHEMA_VERSION } from "./schema";

describe("schema", () => {
  it("courses テーブル定義を含まない (削除)", () => {
    expect(SCHEMA).not.toContain("CREATE TABLE IF NOT EXISTS courses");
    expect(SCHEMA).not.toContain("hole_count INTEGER");
  });

  it("rounds テーブル定義を place/played_at で持つ", () => {
    expect(SCHEMA).toContain("CREATE TABLE IF NOT EXISTS rounds");
    expect(SCHEMA).toContain("place TEXT");
    expect(SCHEMA).toContain("played_at TEXT NOT NULL");
    expect(SCHEMA).toContain("total_strokes INTEGER NOT NULL DEFAULT 0");
    expect(SCHEMA).toContain("CHECK (source IN ('manual', 'watch', 'ocr'))");
  });

  it("hole_scores テーブル定義を含む", () => {
    expect(SCHEMA).toContain("CREATE TABLE IF NOT EXISTS hole_scores");
    expect(SCHEMA).toContain("UNIQUE(round_id, hole_number)");
  });

  it("インデックス定義は新しいカラム名を参照する", () => {
    expect(SCHEMA).toContain("CREATE INDEX IF NOT EXISTS idx_rounds_date");
    expect(SCHEMA).toContain("idx_hole_scores_round");
    // 古い course インデックスは削除
    expect(SCHEMA).not.toContain("idx_rounds_course");
  });

  it("SCHEMA_VERSION が 2 である", () => {
    expect(SCHEMA_VERSION).toBe(2);
  });

  it("courses テーブルの REFERENCES を含まない", () => {
    expect(SCHEMA).not.toContain("REFERENCES courses");
  });
});
