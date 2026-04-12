use serde::Serialize;
use regex::Regex;
use std::sync::LazyLock;

#[derive(Debug, Clone, Serialize)]
#[serde(tag = "kind")]
pub enum VoiceCommand {
    GoToVerse { book: String, chapter: u32, verse: Option<u32> },
    NextChapter,
    PreviousChapter,
    NextVerse,
    PreviousVerse,
}

static GO_TO_RE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"(?i)(?:go\s+to|turn\s+to|open|read)\s+((?:first|second|third|1|2|3)\s+)?([a-zA-Z]+)\s+(?:chapter\s+)?(\d+)(?:\s*[:.]\s*(\d+))?").unwrap()
});

static NEXT_CHAPTER_RE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"(?i)next\s+chapter").unwrap()
});

static PREV_CHAPTER_RE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"(?i)(?:previous|last|prior)\s+chapter").unwrap()
});

static NEXT_VERSE_RE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"(?i)next\s+verse").unwrap()
});

static PREV_VERSE_RE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"(?i)(?:previous|last|prior)\s+verse").unwrap()
});

pub fn parse_voice_command(text: &str) -> Option<VoiceCommand> {
    if let Some(caps) = GO_TO_RE.captures(text) {
        let prefix = caps.get(1).map(|m| m.as_str().trim()).unwrap_or("");
        let book_name = caps.get(2).map(|m| m.as_str()).unwrap_or("");
        let chapter: u32 = caps.get(3).and_then(|m| m.as_str().parse().ok()).unwrap_or(1);
        let verse: Option<u32> = caps.get(4).and_then(|m| m.as_str().parse().ok());

        let book = if prefix.is_empty() {
            book_name.to_string()
        } else {
            format!("{} {}", normalize_prefix(prefix), book_name)
        };

        return Some(VoiceCommand::GoToVerse { book, chapter, verse });
    }

    if NEXT_CHAPTER_RE.is_match(text) { return Some(VoiceCommand::NextChapter); }
    if PREV_CHAPTER_RE.is_match(text) { return Some(VoiceCommand::PreviousChapter); }
    if NEXT_VERSE_RE.is_match(text) { return Some(VoiceCommand::NextVerse); }
    if PREV_VERSE_RE.is_match(text) { return Some(VoiceCommand::PreviousVerse); }

    None
}

fn normalize_prefix(p: &str) -> &'static str {
    match p.to_lowercase().as_str().trim() {
        "first" | "1" => "1",
        "second" | "2" => "2",
        "third" | "3" => "3",
        _ => "1",
    }
}
