use rhema_bible::{BibleDb, NewSong, SongSection};
use tempfile::tempdir;

fn fresh_db() -> (tempfile::TempDir, BibleDb) {
    let dir = tempdir().unwrap();
    let path = dir.path().join("test.db");
    let db = BibleDb::open(&path).unwrap();
    db.apply_sql(include_str!("../../../../data/migrations/001_songs.sql"))
        .unwrap();
    (dir, db)
}

fn sample() -> NewSong {
    NewSong {
        title: "Amazing Grace".into(),
        artist: Some("John Newton".into()),
        ccli_number: None,
        sections: vec![
            SongSection {
                kind: "verse".into(),
                label: "Verse 1".into(),
                lines: vec![
                    "Amazing grace, how sweet the sound".into(),
                    "That saved a wretch like me".into(),
                ],
            },
            SongSection {
                kind: "chorus".into(),
                label: "Chorus".into(),
                lines: vec!["I once was lost but now am found".into()],
            },
        ],
    }
}

#[test]
fn insert_and_get_song() {
    let (_dir, db) = fresh_db();
    let id = db.insert_song(&sample()).unwrap();
    let song = db.get_song(id).unwrap().unwrap();
    assert_eq!(song.title, "Amazing Grace");
    assert_eq!(song.sections.len(), 2);
    assert_eq!(
        song.sections[0].lines[0],
        "Amazing grace, how sweet the sound"
    );
}

#[test]
fn list_filters_by_fts() {
    let (_dir, db) = fresh_db();
    db.insert_song(&sample()).unwrap();
    let all = db.list_songs(None).unwrap();
    assert_eq!(all.len(), 1);
    let hits = db.list_songs(Some("grace")).unwrap();
    assert_eq!(hits.len(), 1);
    let miss = db.list_songs(Some("xyzzy")).unwrap();
    assert_eq!(miss.len(), 0);
}

#[test]
fn update_song_refreshes_fts() {
    let (_dir, db) = fresh_db();
    let id = db.insert_song(&sample()).unwrap();
    let mut updated = sample();
    updated.title = "Amazing Grace (Updated)".into();
    db.update_song(id, &updated).unwrap();
    let hits = db.list_songs(Some("Updated")).unwrap();
    assert_eq!(hits.len(), 1);
}

#[test]
fn delete_song_removes_row() {
    let (_dir, db) = fresh_db();
    let id = db.insert_song(&sample()).unwrap();
    db.delete_song(id).unwrap();
    assert!(db.get_song(id).unwrap().is_none());
}
