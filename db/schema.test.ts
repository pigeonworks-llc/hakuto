import { SCHEMA } from "./schema";

describe("schema", () => {
  it("courses テーブル定義を含む", () => {
    expect(SCHEMA).toContain("CREATE TABLE IF NOT EXISTS courses");
    expect(SCHEMA).toContain("hole_count INTEGER NOT NULL");
  });

  it("rounds テーブル定義を含む", () => {
    expect(SCHEMA).toContain("CREATE TABLE IF NOT EXISTS rounds");
    expect(SCHEMA).toContain("total_strokes INTEGER NOT NULL DEFAULT 0");
    expect(SCHEMA).toContain("CHECK (source IN ('manual', 'watch', 'ocr'))");
  });

  it("hole_scores テーブル定義を含む", () => {
    expect(SCHEMA).toContain("CREATE TABLE IF NOT EXISTS hole_scores");
    expect(SCHEMA).toContain("UNIQUE(round_id, hole_number)");
  });

  it("インデックス定義を含む", () => {
    expect(SCHEMA).toContain("CREATE INDEX IF NOT EXISTS idx_rounds_date");
    expect(SCHEMA).toContain("CREATE INDEX IF NOT EXISTS idx_rounds_course");
    expect(SCHEMA).toContain("CREATE INDEX IF NOT EXISTS idx_hole_scores_round");
  });
});
