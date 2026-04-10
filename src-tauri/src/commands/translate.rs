use std::sync::atomic::Ordering;
use std::sync::Mutex;

use tauri::{AppHandle, Emitter, State};

use crate::events::{TranslationPayload, EVENT_TRANSLATION_CHUNK};
use crate::state::AppState;

#[tauri::command]
pub fn set_translation_enabled(
    state: State<'_, Mutex<AppState>>,
    enabled: bool,
) -> Result<(), String> {
    let s = state.lock().map_err(|e| e.to_string())?;
    s.translation_enabled.store(enabled, Ordering::SeqCst);
    Ok(())
}

#[tauri::command]
pub fn set_translation_language(
    state: State<'_, Mutex<AppState>>,
    lang: String,
) -> Result<(), String> {
    let s = state.lock().map_err(|e| e.to_string())?;
    *s.translation_lang.lock().map_err(|e| e.to_string())? = lang;
    Ok(())
}

#[tauri::command]
pub fn set_openai_api_key(
    state: State<'_, Mutex<AppState>>,
    api_key: String,
) -> Result<(), String> {
    let s = state.lock().map_err(|e| e.to_string())?;
    let mut slot = s.translator.lock().map_err(|e| e.to_string())?;
    *slot = if api_key.is_empty() {
        None
    } else {
        Some(rhema_translate::OpenAiTranslator::new(api_key))
    };
    Ok(())
}

#[tauri::command]
pub async fn translate_text(
    app: AppHandle,
    state: State<'_, Mutex<AppState>>,
    text: String,
    target_lang: String,
    source_sentence_id: String,
) -> Result<(), String> {
    let translator = {
        let s = state.lock().map_err(|e| e.to_string())?;
        let guard = s.translator.lock().map_err(|e| e.to_string())?;
        guard.clone()
    };
    let Some(translator) = translator else {
        return Err("OpenAI not configured".into());
    };
    let chunk = translator
        .translate(&text, &target_lang, source_sentence_id)
        .await;
    let payload: TranslationPayload = chunk.into();
    app.emit(EVENT_TRANSLATION_CHUNK, payload)
        .map_err(|e| e.to_string())?;
    Ok(())
}
