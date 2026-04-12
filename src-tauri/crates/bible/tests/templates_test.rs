use rhema_bible::{BibleDb, NewBackdrop, NewTemplate};
use tempfile::tempdir;

fn fresh_db() -> (tempfile::TempDir, BibleDb) {
    let dir = tempdir().unwrap();
    let path = dir.path().join("test.db");
    let db = BibleDb::open(&path).unwrap();
    db.apply_sql(include_str!("../../../../data/migrations/001_songs.sql"))
        .unwrap();
    db.apply_sql(include_str!(
        "../../../../data/migrations/002_templates.sql"
    ))
    .unwrap();
    (dir, db)
}

fn sample_template(category: &str) -> NewTemplate {
    NewTemplate {
        name: format!("Test {}", category),
        category: category.to_string(),
        is_builtin: None,
        canvas_json: r#"{"width":1920,"height":1080}"#.to_string(),
        slots_json: Some(r#"[{"id":"title"}]"#.to_string()),
        thumbnail_png: None,
    }
}

fn sample_backdrop(kind: &str) -> NewBackdrop {
    NewBackdrop {
        name: format!("Backdrop {}", kind),
        kind: kind.to_string(),
        data_json: r##"{"color":"#000"}"##.to_string(),
        thumbnail_png: None,
        is_builtin: None,
    }
}

#[test]
fn insert_and_get_template() {
    let (_dir, db) = fresh_db();
    let id = db.insert_template(&sample_template("verse")).unwrap();
    let t = db.get_template(id).unwrap().unwrap();
    assert_eq!(t.name, "Test verse");
    assert_eq!(t.category, "verse");
    assert!(!t.is_builtin);
    assert!(t.slots_json.is_some());
}

#[test]
fn list_by_category() {
    let (_dir, db) = fresh_db();
    db.insert_template(&sample_template("verse")).unwrap();
    db.insert_template(&sample_template("lyrics")).unwrap();
    db.insert_template(&sample_template("verse")).unwrap();

    let all = db.list_templates(None).unwrap();
    assert_eq!(all.len(), 3);

    let verses = db.list_templates(Some("verse")).unwrap();
    assert_eq!(verses.len(), 2);

    let lyrics = db.list_templates(Some("lyrics")).unwrap();
    assert_eq!(lyrics.len(), 1);
}

#[test]
fn delete_template() {
    let (_dir, db) = fresh_db();
    let id = db.insert_template(&sample_template("alert")).unwrap();
    assert!(db.get_template(id).unwrap().is_some());
    db.delete_template(id).unwrap();
    assert!(db.get_template(id).unwrap().is_none());
}

#[test]
fn insert_and_list_backdrops() {
    let (_dir, db) = fresh_db();
    db.insert_backdrop(&sample_backdrop("solid")).unwrap();
    db.insert_backdrop(&sample_backdrop("gradient")).unwrap();
    db.insert_backdrop(&sample_backdrop("solid")).unwrap();

    let all = db.list_backdrops(None).unwrap();
    assert_eq!(all.len(), 3);

    let solids = db.list_backdrops(Some("solid")).unwrap();
    assert_eq!(solids.len(), 2);

    // Delete one
    let id = solids[0].id;
    db.delete_backdrop(id).unwrap();
    let after = db.list_backdrops(Some("solid")).unwrap();
    assert_eq!(after.len(), 1);
}
