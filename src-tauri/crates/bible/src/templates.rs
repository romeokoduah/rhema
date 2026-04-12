use crate::db::BibleDb;
use rusqlite::{params, OptionalExtension};
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Template {
    pub id: i64,
    pub name: String,
    pub category: String,
    pub is_builtin: bool,
    pub canvas_json: String,
    pub slots_json: Option<String>,
    pub thumbnail_png: Option<Vec<u8>>,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NewTemplate {
    pub name: String,
    pub category: String,
    pub is_builtin: Option<bool>,
    pub canvas_json: String,
    pub slots_json: Option<String>,
    pub thumbnail_png: Option<Vec<u8>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Backdrop {
    pub id: i64,
    pub name: String,
    #[serde(rename = "type")]
    pub kind: String,
    pub data_json: String,
    pub thumbnail_png: Option<Vec<u8>>,
    pub is_builtin: bool,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NewBackdrop {
    pub name: String,
    #[serde(rename = "type")]
    pub kind: String,
    pub data_json: String,
    pub thumbnail_png: Option<Vec<u8>>,
    pub is_builtin: Option<bool>,
}

fn now_ms() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0)
}

impl BibleDb {
    pub fn insert_template(&self, t: &NewTemplate) -> rusqlite::Result<i64> {
        let conn = self.conn.lock().unwrap();
        let ts = now_ms();
        let builtin = t.is_builtin.unwrap_or(false) as i64;
        conn.execute(
            "INSERT INTO templates (name, category, is_builtin, canvas_json, slots_json, thumbnail_png, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?7)",
            params![t.name, t.category, builtin, t.canvas_json, t.slots_json, t.thumbnail_png, ts],
        )?;
        Ok(conn.last_insert_rowid())
    }

    pub fn update_template(&self, id: i64, t: &NewTemplate) -> rusqlite::Result<()> {
        let conn = self.conn.lock().unwrap();
        let ts = now_ms();
        let builtin = t.is_builtin.unwrap_or(false) as i64;
        conn.execute(
            "UPDATE templates SET name=?1, category=?2, is_builtin=?3, canvas_json=?4, slots_json=?5, thumbnail_png=?6, updated_at=?7 WHERE id=?8",
            params![t.name, t.category, builtin, t.canvas_json, t.slots_json, t.thumbnail_png, ts, id],
        )?;
        Ok(())
    }

    pub fn delete_template(&self, id: i64) -> rusqlite::Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM templates WHERE id=?1", params![id])?;
        Ok(())
    }

    pub fn get_template(&self, id: i64) -> rusqlite::Result<Option<Template>> {
        let conn = self.conn.lock().unwrap();
        conn.query_row(
            "SELECT id, name, category, is_builtin, canvas_json, slots_json, thumbnail_png, created_at, updated_at FROM templates WHERE id=?1",
            params![id],
            row_to_template,
        )
        .optional()
    }

    pub fn list_templates(&self, category: Option<&str>) -> rusqlite::Result<Vec<Template>> {
        let conn = self.conn.lock().unwrap();
        match category.map(str::trim).filter(|c| !c.is_empty()) {
            Some(cat) => {
                let mut stmt = conn.prepare(
                    "SELECT id, name, category, is_builtin, canvas_json, slots_json, thumbnail_png, created_at, updated_at FROM templates WHERE category=?1 ORDER BY name",
                )?;
                let iter = stmt.query_map(params![cat], row_to_template)?;
                iter.collect()
            }
            None => {
                let mut stmt = conn.prepare(
                    "SELECT id, name, category, is_builtin, canvas_json, slots_json, thumbnail_png, created_at, updated_at FROM templates ORDER BY name",
                )?;
                let iter = stmt.query_map([], row_to_template)?;
                iter.collect()
            }
        }
    }

    pub fn insert_backdrop(&self, b: &NewBackdrop) -> rusqlite::Result<i64> {
        let conn = self.conn.lock().unwrap();
        let ts = now_ms();
        let builtin = b.is_builtin.unwrap_or(false) as i64;
        conn.execute(
            "INSERT INTO backdrops (name, type, data_json, thumbnail_png, is_builtin, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?6)",
            params![b.name, b.kind, b.data_json, b.thumbnail_png, builtin, ts],
        )?;
        Ok(conn.last_insert_rowid())
    }

    pub fn list_backdrops(&self, kind: Option<&str>) -> rusqlite::Result<Vec<Backdrop>> {
        let conn = self.conn.lock().unwrap();
        match kind.map(str::trim).filter(|k| !k.is_empty()) {
            Some(k) => {
                let mut stmt = conn.prepare(
                    "SELECT id, name, type, data_json, thumbnail_png, is_builtin, created_at, updated_at FROM backdrops WHERE type=?1 ORDER BY name",
                )?;
                let iter = stmt.query_map(params![k], row_to_backdrop)?;
                iter.collect()
            }
            None => {
                let mut stmt = conn.prepare(
                    "SELECT id, name, type, data_json, thumbnail_png, is_builtin, created_at, updated_at FROM backdrops ORDER BY name",
                )?;
                let iter = stmt.query_map([], row_to_backdrop)?;
                iter.collect()
            }
        }
    }

    pub fn delete_backdrop(&self, id: i64) -> rusqlite::Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM backdrops WHERE id=?1", params![id])?;
        Ok(())
    }
}

fn row_to_template(row: &rusqlite::Row) -> rusqlite::Result<Template> {
    let is_builtin_int: i64 = row.get(3)?;
    Ok(Template {
        id: row.get(0)?,
        name: row.get(1)?,
        category: row.get(2)?,
        is_builtin: is_builtin_int != 0,
        canvas_json: row.get(4)?,
        slots_json: row.get(5)?,
        thumbnail_png: row.get(6)?,
        created_at: row.get(7)?,
        updated_at: row.get(8)?,
    })
}

fn row_to_backdrop(row: &rusqlite::Row) -> rusqlite::Result<Backdrop> {
    let is_builtin_int: i64 = row.get(5)?;
    Ok(Backdrop {
        id: row.get(0)?,
        name: row.get(1)?,
        kind: row.get(2)?,
        data_json: row.get(3)?,
        thumbnail_png: row.get(4)?,
        is_builtin: is_builtin_int != 0,
        created_at: row.get(6)?,
        updated_at: row.get(7)?,
    })
}
