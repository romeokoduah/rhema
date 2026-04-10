use rhema_bible::{BibleDb, NewSong, SongSection};
use rhema_detection::song_detect::SongDetector;
use std::sync::Arc;
use tempfile::tempdir;

fn db_with_song() -> (tempfile::TempDir, Arc<BibleDb>) {
    let dir = tempdir().unwrap();
    let path = dir.path().join("test.db");
    let db = BibleDb::open(&path).unwrap();
    db.apply_sql(include_str!("../../../../data/migrations/001_songs.sql")).unwrap();
    db.insert_song(&NewSong {
        title: "Amazing Grace".into(),
        artist: None,
        ccli_number: None,
        sections: vec![
            SongSection {
                kind: "verse".into(),
                label: "Verse 1".into(),
                lines: vec![
                    "amazing grace how sweet the sound".into(),
                    "that saved a wretch like me".into(),
                ],
            },
            SongSection {
                kind: "chorus".into(),
                label: "Chorus".into(),
                lines: vec!["i once was lost but now am found".into()],
            },
        ],
    })
    .unwrap();
    (dir, Arc::new(db))
}

#[test]
fn locks_onto_song_after_clear_match() {
    let (_dir, db) = db_with_song();
    let mut detector = SongDetector::new(db);
    let m = detector.ingest("amazing grace how sweet the sound that saved a wretch like me");
    assert!(m.is_some(), "expected lock after clear match");
    let m = m.unwrap();
    assert_eq!(m.section_index, 0);
    assert!(m.confidence >= 0.6);
}

#[test]
fn ignores_unrelated_text() {
    let (_dir, db) = db_with_song();
    let mut detector = SongDetector::new(db);
    let m = detector.ingest("today we will talk about the weather in paris");
    assert!(m.is_none());
}

#[test]
fn releases_lock_after_silence() {
    let (_dir, db) = db_with_song();
    let mut detector = SongDetector::new(db);
    detector.ingest("amazing grace how sweet the sound that saved a wretch like me");
    for _ in 0..10 {
        detector.ingest("random unrelated chatter about other topics entirely");
    }
    // After silence, lock should have been dropped; a fresh ingest of unrelated text shouldn't match.
    assert!(detector.ingest("meaningless filler").is_none());
}
