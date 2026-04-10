use std::sync::Mutex;
use tauri::{AppHandle, Emitter, State};

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

#[derive(Clone, serde::Serialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum BroadcastContent {
    SongSection {
        title: String,
        label: String,
        lines: Vec<String>,
    },
}

#[tauri::command]
pub fn set_song_autodetect_enabled(
    state: State<'_, Mutex<AppState>>,
    enabled: bool,
) -> Result<(), String> {
    let s = state.lock().map_err(|e| e.to_string())?;
    s.song_detect_enabled
        .store(enabled, std::sync::atomic::Ordering::SeqCst);
    if !enabled {
        if let Ok(mut slot) = s.song_detector.lock() {
            if let Some(d) = slot.as_mut() {
                d.release();
            }
        }
    }
    Ok(())
}

#[tauri::command]
pub fn set_song_autodetect_sensitivity(
    state: State<'_, Mutex<AppState>>,
    threshold: f32,
) -> Result<(), String> {
    let s = state.lock().map_err(|e| e.to_string())?;
    if let Ok(mut slot) = s.song_detector.lock() {
        if let Some(d) = slot.as_mut() {
            d.set_threshold(threshold);
        }
    }
    Ok(())
}

#[tauri::command]
pub fn broadcast_song_section(
    app: AppHandle,
    title: String,
    label: String,
    lines: Vec<String>,
) -> Result<(), String> {
    let payload = BroadcastContent::SongSection {
        title,
        label,
        lines,
    };
    app.emit("broadcast_song_section", payload)
        .map_err(|e| e.to_string())
}
