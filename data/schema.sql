CREATE TABLE IF NOT EXISTS translations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    abbreviation TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    language TEXT NOT NULL,
    license TEXT NOT NULL,
    is_copyrighted INTEGER NOT NULL DEFAULT 0,
    is_downloaded INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    translation_id INTEGER NOT NULL REFERENCES translations(id),
    book_number INTEGER NOT NULL,
    name TEXT NOT NULL,
    abbreviation TEXT NOT NULL,
    testament TEXT NOT NULL,
    UNIQUE(translation_id, book_number)
);

CREATE TABLE IF NOT EXISTS verses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    translation_id INTEGER NOT NULL REFERENCES translations(id),
    book_id INTEGER NOT NULL REFERENCES books(id),
    book_number INTEGER NOT NULL,
    book_name TEXT NOT NULL,
    book_abbreviation TEXT NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    text TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_verses_lookup ON verses(translation_id, book_number, chapter, verse);
CREATE INDEX IF NOT EXISTS idx_verses_chapter ON verses(translation_id, book_number, chapter);

CREATE TABLE IF NOT EXISTS cross_references (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_book INTEGER NOT NULL,
    from_chapter INTEGER NOT NULL,
    from_verse INTEGER NOT NULL,
    to_book INTEGER NOT NULL,
    to_chapter INTEGER NOT NULL,
    to_verse_start INTEGER NOT NULL,
    to_verse_end INTEGER NOT NULL,
    votes INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_crossref_from ON cross_references(from_book, from_chapter, from_verse);

CREATE TABLE IF NOT EXISTS embedding_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    translation_id INTEGER NOT NULL REFERENCES translations(id),
    model_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    computed_at TEXT,
    UNIQUE(translation_id, model_name)
);

CREATE TABLE IF NOT EXISTS songs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  artist TEXT,
  ccli_number TEXT,
  lyrics_json TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_songs_title ON songs(title);

CREATE VIRTUAL TABLE IF NOT EXISTS songs_fts USING fts5(
  title,
  artist,
  lyrics_flat
);

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
