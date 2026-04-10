pub const EVENT_AUDIO_LEVEL: &str = "audio_level";
pub const EVENT_TRANSCRIPT_PARTIAL: &str = "transcript_partial";
pub const EVENT_TRANSCRIPT_FINAL: &str = "transcript_final";
pub const EVENT_TRANSLATION_CHUNK: &str = "translation_chunk";
pub const EVENT_SONG_MATCH: &str = "song_match";
pub const EVENT_SONG_MATCH_RELEASED: &str = "song_match_released";

#[derive(Clone, serde::Serialize)]
pub struct SongMatchPayload {
    pub song_id: i64,
    pub section_index: usize,
    pub line_index: usize,
    pub confidence: f32,
}

#[derive(Clone, serde::Serialize)]
pub struct AudioLevelPayload {
    pub rms: f32,
    pub peak: f32,
}

#[derive(Clone, serde::Serialize)]
pub struct TranscriptPayload {
    pub text: String,
    pub is_final: bool,
    pub confidence: f64,
}

#[derive(Clone, serde::Serialize)]
pub struct TranslationPayload {
    pub source_text: String,
    pub target_text: String,
    pub target_lang: String,
    pub source_sentence_id: String,
    pub timestamp_ms: u64,
    pub failed: bool,
}

impl From<rhema_translate::TranslatedChunk> for TranslationPayload {
    fn from(c: rhema_translate::TranslatedChunk) -> Self {
        Self {
            source_text: c.source_text,
            target_text: c.target_text,
            target_lang: c.target_lang,
            source_sentence_id: c.source_sentence_id,
            timestamp_ms: c.timestamp_ms,
            failed: c.failed,
        }
    }
}
