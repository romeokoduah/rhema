CREATE TABLE IF NOT EXISTS templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('lower_third','verse','lyrics','announcement','countdown','alert')),
  is_builtin INTEGER NOT NULL DEFAULT 0,
  canvas_json TEXT NOT NULL,
  slots_json TEXT,
  thumbnail_png BLOB,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE TABLE IF NOT EXISTS backdrops (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('solid','gradient','image')),
  data_json TEXT NOT NULL,
  thumbnail_png BLOB,
  is_builtin INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
