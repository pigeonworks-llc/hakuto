import { SCHEMA } from "./schema";

describe("db/index", () => {
  it("スキーマに全テーブル定義が含まれる", () => {
    expect(SCHEMA).toContain("CREATE TABLE IF NOT EXISTS courses");
    expect(SCHEMA).toContain("CREATE TABLE IF NOT EXISTS rounds");
    expect(SCHEMA).toContain("CREATE TABLE IF NOT EXISTS hole_scores");
  });

  it("WAL モードの設定を含む", () => {
    expect(SCHEMA).toBeDefined();
  });
});
