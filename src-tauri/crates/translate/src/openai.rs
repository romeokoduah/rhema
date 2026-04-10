use crate::types::{TranslateError, TranslatedChunk};
use serde::{Deserialize, Serialize};
use std::time::{Duration, SystemTime, UNIX_EPOCH};

const OPENAI_URL: &str = "https://api.openai.com/v1/chat/completions";
const MODEL: &str = "gpt-4o-mini";
const TIMEOUT_SECS: u64 = 10;

#[derive(Clone)]
pub struct OpenAiTranslator {
    client: reqwest::Client,
    api_key: String,
    endpoint: String,
}

#[derive(Serialize)]
struct ChatRequest<'a> {
    model: &'a str,
    temperature: f32,
    messages: Vec<ChatMessage<'a>>,
}

#[derive(Serialize)]
struct ChatMessage<'a> {
    role: &'a str,
    content: &'a str,
}

#[derive(Deserialize)]
struct ChatResponse {
    choices: Vec<Choice>,
}

#[derive(Deserialize)]
struct Choice {
    message: ResponseMessage,
}

#[derive(Deserialize)]
struct ResponseMessage {
    content: String,
}

impl OpenAiTranslator {
    pub fn new(api_key: String) -> Self {
        Self::with_endpoint(api_key, OPENAI_URL.to_string())
    }

    pub fn with_endpoint(api_key: String, endpoint: String) -> Self {
        let client = reqwest::Client::builder()
            .timeout(Duration::from_secs(TIMEOUT_SECS))
            .build()
            .expect("reqwest client build");
        Self { client, api_key, endpoint }
    }

    pub async fn translate(
        &self,
        source_text: &str,
        target_lang: &str,
        source_sentence_id: String,
    ) -> TranslatedChunk {
        let now_ms = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_millis() as u64)
            .unwrap_or(0);

        match self.call_api(source_text, target_lang).await {
            Ok(text) => TranslatedChunk {
                source_text: source_text.to_string(),
                target_text: text,
                target_lang: target_lang.to_string(),
                source_sentence_id,
                timestamp_ms: now_ms,
                failed: false,
            },
            Err(err) => {
                log::warn!("Translation failed: {err}");
                TranslatedChunk {
                    source_text: source_text.to_string(),
                    target_text: source_text.to_string(),
                    target_lang: target_lang.to_string(),
                    source_sentence_id,
                    timestamp_ms: now_ms,
                    failed: true,
                }
            }
        }
    }

    async fn call_api(&self, source_text: &str, target_lang: &str) -> Result<String, TranslateError> {
        let system_prompt = format!(
            "Translate the following English text to {target_lang}. Preserve meaning, tone, and any Bible verse references verbatim. Return ONLY the translated text with no commentary."
        );
        let body = ChatRequest {
            model: MODEL,
            temperature: 0.2,
            messages: vec![
                ChatMessage { role: "system", content: &system_prompt },
                ChatMessage { role: "user", content: source_text },
            ],
        };

        let resp = self
            .client
            .post(&self.endpoint)
            .bearer_auth(&self.api_key)
            .json(&body)
            .send()
            .await?;

        let status = resp.status();
        if status == reqwest::StatusCode::UNAUTHORIZED {
            return Err(TranslateError::InvalidApiKey);
        }
        if !status.is_success() {
            let body = resp.text().await.unwrap_or_default();
            return Err(TranslateError::ApiStatus { status: status.as_u16(), body });
        }

        let parsed: ChatResponse = resp.json().await.map_err(|e| TranslateError::Parse(e.to_string()))?;
        let text = parsed
            .choices
            .into_iter()
            .next()
            .map(|c| c.message.content)
            .ok_or_else(|| TranslateError::Parse("no choices".into()))?;
        let trimmed = text.trim().to_string();
        if trimmed.is_empty() {
            return Err(TranslateError::Parse("empty content".into()));
        }
        Ok(trimmed)
    }
}
