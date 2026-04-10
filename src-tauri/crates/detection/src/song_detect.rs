use rhema_bible::{BibleDb, Song};
use serde::Serialize;
use std::collections::VecDeque;
use std::sync::Arc;

#[derive(Debug, Clone, Serialize)]
pub struct SongMatch {
    pub song_id: i64,
    pub section_index: usize,
    pub line_index: usize,
    pub confidence: f32,
}

pub struct SongDetector {
    db: Arc<BibleDb>,
    window: VecDeque<String>,
    window_max_words: usize,
    threshold: f32,
    margin: f32,
    locked: Option<LockedSong>,
    silence_counter: usize,
    silence_limit: usize,
}

struct LockedSong {
    song: Song,
}

impl SongDetector {
    pub fn new(db: Arc<BibleDb>) -> Self {
        Self {
            db,
            window: VecDeque::new(),
            window_max_words: 60,
            threshold: 0.65,
            margin: 0.15,
            locked: None,
            silence_counter: 0,
            silence_limit: 7,
        }
    }

    pub fn set_threshold(&mut self, threshold: f32) {
        self.threshold = threshold.clamp(0.3, 0.95);
    }

    pub fn release(&mut self) {
        self.locked = None;
        self.window.clear();
        self.silence_counter = 0;
    }

    pub fn ingest(&mut self, sentence: &str) -> Option<SongMatch> {
        for word in sentence.split_whitespace() {
            self.window.push_back(word.to_lowercase());
        }
        while self.window.len() > self.window_max_words {
            self.window.pop_front();
        }
        let window_text: String = self.window.iter().cloned().collect::<Vec<_>>().join(" ");

        if let Some(locked) = &self.locked {
            if let Some((si, li, score)) = best_line(&locked.song, &window_text) {
                if score >= self.threshold * 0.8 {
                    self.silence_counter = 0;
                    return Some(SongMatch {
                        song_id: locked.song.id,
                        section_index: si,
                        line_index: li,
                        confidence: score,
                    });
                }
            }
            self.silence_counter += 1;
            if self.silence_counter >= self.silence_limit {
                self.locked = None;
                self.silence_counter = 0;
            }
            return None;
        }

        // Not locked — try to find a candidate via FTS
        let candidates = self.db.list_songs(Some(&window_text)).ok().unwrap_or_default();
        if candidates.is_empty() {
            return None;
        }

        let mut scored: Vec<(Song, f32, usize, usize)> = candidates
            .into_iter()
            .filter_map(|song| best_line(&song, &window_text).map(|(si, li, s)| (song, s, si, li)))
            .collect();
        scored.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));

        if scored.is_empty() {
            return None;
        }
        let (song, score, si, li) = scored.remove(0);
        let second = scored.first().map(|x| x.1).unwrap_or(0.0);
        if score >= self.threshold && score - second >= self.margin {
            let m = SongMatch {
                song_id: song.id,
                section_index: si,
                line_index: li,
                confidence: score,
            };
            self.locked = Some(LockedSong { song });
            Some(m)
        } else {
            None
        }
    }
}

fn best_line(song: &Song, window: &str) -> Option<(usize, usize, f32)> {
    let mut best: Option<(usize, usize, f32)> = None;
    for (si, section) in song.sections.iter().enumerate() {
        for (li, line) in section.lines.iter().enumerate() {
            let score = line_similarity(&line.to_lowercase(), window);
            if best.map(|(_, _, b)| score > b).unwrap_or(true) {
                best = Some((si, li, score));
            }
        }
    }
    best
}

fn line_similarity(line: &str, window: &str) -> f32 {
    let line_words: Vec<&str> = line.split_whitespace().collect();
    if line_words.is_empty() {
        return 0.0;
    }
    let window_words: std::collections::HashSet<&str> = window.split_whitespace().collect();
    let hits = line_words.iter().filter(|w| window_words.contains(*w)).count();
    hits as f32 / line_words.len() as f32
}
