use std::sync::Mutex;
use tauri::State;

use crate::state::AppState;
use rhema_bible::{Backdrop, NewBackdrop, NewTemplate, Template};

#[tauri::command]
pub fn list_templates(
    state: State<'_, Mutex<AppState>>,
    category: Option<String>,
) -> Result<Vec<Template>, String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;
    let db = app_state
        .bible_db
        .as_ref()
        .ok_or_else(|| "Bible database not loaded".to_string())?;
    db.list_templates(category.as_deref())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_template(
    state: State<'_, Mutex<AppState>>,
    id: i64,
) -> Result<Option<Template>, String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;
    let db = app_state
        .bible_db
        .as_ref()
        .ok_or_else(|| "Bible database not loaded".to_string())?;
    db.get_template(id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_template(
    state: State<'_, Mutex<AppState>>,
    template: NewTemplate,
) -> Result<i64, String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;
    let db = app_state
        .bible_db
        .as_ref()
        .ok_or_else(|| "Bible database not loaded".to_string())?;
    db.insert_template(&template).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_template(
    state: State<'_, Mutex<AppState>>,
    id: i64,
    template: NewTemplate,
) -> Result<(), String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;
    let db = app_state
        .bible_db
        .as_ref()
        .ok_or_else(|| "Bible database not loaded".to_string())?;
    db.update_template(id, &template)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_template(
    state: State<'_, Mutex<AppState>>,
    id: i64,
) -> Result<(), String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;
    let db = app_state
        .bible_db
        .as_ref()
        .ok_or_else(|| "Bible database not loaded".to_string())?;
    db.delete_template(id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_backdrops(
    state: State<'_, Mutex<AppState>>,
    kind: Option<String>,
) -> Result<Vec<Backdrop>, String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;
    let db = app_state
        .bible_db
        .as_ref()
        .ok_or_else(|| "Bible database not loaded".to_string())?;
    db.list_backdrops(kind.as_deref())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_backdrop(
    state: State<'_, Mutex<AppState>>,
    backdrop: NewBackdrop,
) -> Result<i64, String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;
    let db = app_state
        .bible_db
        .as_ref()
        .ok_or_else(|| "Bible database not loaded".to_string())?;
    db.insert_backdrop(&backdrop).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_backdrop(
    state: State<'_, Mutex<AppState>>,
    id: i64,
) -> Result<(), String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;
    let db = app_state
        .bible_db
        .as_ref()
        .ok_or_else(|| "Bible database not loaded".to_string())?;
    db.delete_backdrop(id).map_err(|e| e.to_string())
}
