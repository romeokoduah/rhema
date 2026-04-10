use crate::db::BibleDb;
use rusqlite::{params, OptionalExtension};
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SongSection {
    #[serde(rename = "type")]
    pub kind: String,
    pub label: String,
    pub lines: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Song {
    pub id: i64,
    pub title: String,
    pub artist: Option<String>,
    pub ccli_number: Option<String>,
    pub sections: Vec<SongSection>,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NewSong {
    pub title: String,
    pub artist: Option<String>,
    pub ccli_number: Option<String>,
    pub sections: Vec<SongSection>,
}

fn now_ms() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0)
}

fn flatten(sections: &[SongSection]) -> String {
    sections
        .iter()
        .flat_map(|s| s.lines.iter().cloned())
        .collect::<Vec<_>>()
        .join("\n")
}

impl BibleDb {
    pub fn insert_song(&self, song: &NewSong) -> rusqlite::Result<i64> {
        let conn = self.conn.lock().unwrap();
        let lyrics_json = serde_json::to_string(&song.sections).unwrap();
        let flat = flatten(&song.sections);
        let ts = now_ms();
        conn.execute(
            "INSERT INTO songs (title, artist, ccli_number, lyrics_json, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?5)",
            params![song.title, song.artist, song.ccli_number, lyrics_json, ts],
        )?;
        let id = conn.last_insert_rowid();
        conn.execute(
            "INSERT INTO songs_fts (rowid, title, artist, lyrics_flat) VALUES (?1, ?2, ?3, ?4)",
            params![id, song.title, song.artist.clone().unwrap_or_default(), flat],
        )?;
        Ok(id)
    }

    pub fn update_song(&self, id: i64, song: &NewSong) -> rusqlite::Result<()> {
        let conn = self.conn.lock().unwrap();
        let lyrics_json = serde_json::to_string(&song.sections).unwrap();
        let flat = flatten(&song.sections);
        let ts = now_ms();
        conn.execute(
            "UPDATE songs SET title=?1, artist=?2, ccli_number=?3, lyrics_json=?4, updated_at=?5 WHERE id=?6",
            params![song.title, song.artist, song.ccli_number, lyrics_json, ts, id],
        )?;
        conn.execute("DELETE FROM songs_fts WHERE rowid=?1", params![id])?;
        conn.execute(
            "INSERT INTO songs_fts (rowid, title, artist, lyrics_flat) VALUES (?1, ?2, ?3, ?4)",
            params![id, song.title, song.artist.clone().unwrap_or_default(), flat],
        )?;
        Ok(())
    }

    pub fn delete_song(&self, id: i64) -> rusqlite::Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM songs WHERE id=?1", params![id])?;
        conn.execute("DELETE FROM songs_fts WHERE rowid=?1", params![id])?;
        Ok(())
    }

    pub fn get_song(&self, id: i64) -> rusqlite::Result<Option<Song>> {
        let conn = self.conn.lock().unwrap();
        conn.query_row(
            "SELECT id, title, artist, ccli_number, lyrics_json, created_at, updated_at FROM songs WHERE id=?1",
            params![id],
            row_to_song,
        ).optional()
    }

    pub fn list_songs(&self, query: Option<&str>) -> rusqlite::Result<Vec<Song>> {
        let conn = self.conn.lock().unwrap();
        match query.map(str::trim).filter(|q| !q.is_empty()) {
            Some(q) => {
                let mut stmt = conn.prepare(
                    "SELECT s.id, s.title, s.artist, s.ccli_number, s.lyrics_json, s.created_at, s.updated_at
                     FROM songs_fts f JOIN songs s ON s.id = f.rowid
                     WHERE songs_fts MATCH ?1 ORDER BY s.title",
                )?;
                let iter = stmt.query_map(params![format!("{}*", q)], row_to_song)?;
                iter.collect()
            }
            None => {
                let mut stmt = conn.prepare(
                    "SELECT id, title, artist, ccli_number, lyrics_json, created_at, updated_at FROM songs ORDER BY title",
                )?;
                let iter = stmt.query_map([], row_to_song)?;
                iter.collect()
            }
        }
    }
}

fn row_to_song(row: &rusqlite::Row) -> rusqlite::Result<Song> {
    let lyrics_json: String = row.get(4)?;
    let sections: Vec<SongSection> = serde_json::from_str(&lyrics_json).unwrap_or_default();
    Ok(Song {
        id: row.get(0)?,
        title: row.get(1)?,
        artist: row.get(2)?,
        ccli_number: row.get(3)?,
        sections,
        created_at: row.get(5)?,
        updated_at: row.get(6)?,
    })
}
