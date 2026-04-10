use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TranslationRequest {
    pub source_text: String,
    pub target_lang: String,
    pub source_sentence_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TranslatedChunk {
    pub source_text: String,
    pub target_text: String,
    pub target_lang: String,
    pub source_sentence_id: String,
    pub timestamp_ms: u64,
    pub failed: bool,
}

#[derive(Debug, thiserror::Error)]
pub enum TranslateError {
    #[error("HTTP error: {0}")]
    Http(#[from] reqwest::Error),
    #[error("API returned status {status}: {body}")]
    ApiStatus { status: u16, body: String },
    #[error("Invalid API key")]
    InvalidApiKey,
    #[error("Parse error: {0}")]
    Parse(String),
}
