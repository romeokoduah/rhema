pub mod deepgram;
pub mod error;
pub mod keyterms;
pub mod rest;
pub mod types;

#[cfg(feature = "local-whisper")]
pub mod local_whisper;
#[cfg(feature = "local-whisper")]
pub mod whisper_model;

pub use deepgram::DeepgramClient;
pub use error::SttError;
pub use keyterms::bible_keyterms;
pub use types::{SttConfig, TranscriptEvent, Word};

pub use rest::DeepgramRestClient;
