use std::path::Path;
use std::sync::Mutex;

use rusqlite::Connection;

use crate::error::BibleError;

pub struct BibleDb {
    pub(crate) conn: Mutex<Connection>,
}

impl BibleDb {
    pub fn open(path: &Path) -> Result<Self, BibleError> {
        let conn = Connection::open(path)?;
        conn.execute_batch("PRAGMA journal_mode=WAL;")?;
        Ok(Self {
            conn: Mutex::new(conn),
        })
    }

    /// Execute an arbitrary batch of SQL against the underlying connection.
    /// Primarily used to apply migration files at startup and in tests.
    pub fn apply_sql(&self, sql: &str) -> rusqlite::Result<()> {
        self.conn.lock().unwrap().execute_batch(sql)
    }
}
