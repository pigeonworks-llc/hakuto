export const SCHEMA = `
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  hole_count INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS rounds (
  id TEXT PRIMARY KEY NOT NULL,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  course_name TEXT NOT NULL,
  date TEXT NOT NULL,
  total_strokes INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'watch', 'ocr')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS hole_scores (
  id TEXT PRIMARY KEY NOT NULL,
  round_id TEXT NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  hole_number INTEGER NOT NULL,
  strokes INTEGER NOT NULL,
  UNIQUE(round_id, hole_number)
);

CREATE INDEX IF NOT EXISTS idx_rounds_date ON rounds(date DESC);
CREATE INDEX IF NOT EXISTS idx_rounds_course ON rounds(course_id);
CREATE INDEX IF NOT EXISTS idx_hole_scores_round ON hole_scores(round_id);
`;

export const MIGRATIONS: string[] = [];
