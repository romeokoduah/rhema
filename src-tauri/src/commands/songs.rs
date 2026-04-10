use std::sync::Mutex;
use tauri::State;

use crate::state::AppState;
use rhema_bible::{NewSong, Song};

#[tauri::command]
pub fn list_songs(
    state: State<'_, Mutex<AppState>>,
    query: Option<String>,
) -> Result<Vec<Song>, String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;
    let db = app_state
        .bible_db
        .as_ref()
        .ok_or_else(|| "Bible database not loaded".to_string())?;
    db.list_songs(query.as_deref()).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_song(
    state: State<'_, Mutex<AppState>>,
    id: i64,
) -> Result<Option<Song>, String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;
    let db = app_state
        .bible_db
        .as_ref()
        .ok_or_else(|| "Bible database not loaded".to_string())?;
    db.get_song(id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_song(
    state: State<'_, Mutex<AppState>>,
    song: NewSong,
) -> Result<i64, String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;
    let db = app_state
        .bible_db
        .as_ref()
        .ok_or_else(|| "Bible database not loaded".to_string())?;
    db.insert_song(&song).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_song(
    state: State<'_, Mutex<AppState>>,
    id: i64,
    song: NewSong,
) -> Result<(), String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;
    let db = app_state
        .bible_db
        .as_ref()
        .ok_or_else(|| "Bible database not loaded".to_string())?;
    db.update_song(id, &song).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_song(
    state: State<'_, Mutex<AppState>>,
    id: i64,
) -> Result<(), String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;
    let db = app_state
        .bible_db
        .as_ref()
        .ok_or_else(|| "Bible database not loaded".to_string())?;
    db.delete_song(id).map_err(|e| e.to_string())
}
