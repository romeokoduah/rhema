use crate::types::TranscriptEvent;
use crossbeam_channel::Receiver;
use std::path::Path;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use whisper_rs::{FullParams, SamplingStrategy, WhisperContext, WhisperContextParameters};

const CHUNK_DURATION_SECS: usize = 10;
const SAMPLE_RATE: usize = 16000;
const CHUNK_SAMPLES: usize = CHUNK_DURATION_SECS * SAMPLE_RATE;

pub struct WhisperClient;

impl WhisperClient {
    pub fn start(
        model_path: &Path,
        audio_rx: Receiver<Vec<i16>>,
        event_tx: tokio::sync::mpsc::Sender<TranscriptEvent>,
        active: Arc<AtomicBool>,
    ) -> Result<(), String> {
        let model_str = model_path.to_str().ok_or("Invalid model path")?.to_string();

        std::thread::Builder::new()
            .name("whisper-inference".into())
            .spawn(move || {
                let ctx = match WhisperContext::new_with_params(
                    &model_str,
                    WhisperContextParameters::default(),
                ) {
                    Ok(ctx) => ctx,
                    Err(e) => {
                        log::error!("Failed to load Whisper model: {e}");
                        let _ = event_tx.blocking_send(TranscriptEvent::Error(
                            format!("Failed to load Whisper model: {e}"),
                        ));
                        return;
                    }
                };

                // Signal connected (safe: we're on a std thread, not tokio)
                let _ = event_tx.blocking_send(TranscriptEvent::Connected);
                let mut buffer: Vec<f32> = Vec::with_capacity(CHUNK_SAMPLES * 2);

                while active.load(Ordering::SeqCst) {
                    match audio_rx.recv_timeout(std::time::Duration::from_millis(100)) {
                        Ok(samples) => {
                            // Convert i16 to f32 (whisper-rs expects f32 in [-1, 1])
                            for s in &samples {
                                buffer.push(*s as f32 / 32768.0);
                            }

                            if buffer.len() >= CHUNK_SAMPLES {
                                let chunk: Vec<f32> = buffer.drain(..CHUNK_SAMPLES).collect();
                                match transcribe(&ctx, &chunk) {
                                    Ok(text) => {
                                        let text = text.trim().to_string();
                                        if !text.is_empty()
                                            && !text.contains("[BLANK_AUDIO]")
                                            && !text.starts_with('[')
                                        {
                                            let _ = event_tx.blocking_send(
                                                TranscriptEvent::Final {
                                                    transcript: text,
                                                    confidence: 0.9,
                                                    words: vec![],
                                                    speech_final: true,
                                                },
                                            );
                                        }
                                    }
                                    Err(e) => {
                                        log::warn!("Whisper inference failed: {e}");
                                    }
                                }
                            }
                        }
                        Err(crossbeam_channel::RecvTimeoutError::Timeout) => continue,
                        Err(crossbeam_channel::RecvTimeoutError::Disconnected) => break,
                    }
                }

                let _ = event_tx.blocking_send(TranscriptEvent::Disconnected);
                log::info!("WhisperClient stopped");
            })
            .map_err(|e| format!("Failed to spawn whisper thread: {e}"))?;

        Ok(())
    }
}

fn transcribe(ctx: &WhisperContext, audio: &[f32]) -> Result<String, String> {
    let mut state = ctx.create_state().map_err(|e| format!("{e}"))?;
    let mut params = FullParams::new(SamplingStrategy::Greedy { best_of: 1 });
    params.set_language(Some("en"));
    params.set_print_special(false);
    params.set_print_progress(false);
    params.set_print_realtime(false);
    params.set_print_timestamps(false);
    params.set_suppress_blank(true);
    params.set_no_context(true);
    // Allow temperature fallback so the large model doesn't reject low-confidence chunks
    params.set_temperature_inc(0.2);
    // Use available cores for the larger model
    let n_threads = std::thread::available_parallelism()
        .map(|n| n.get().min(8))
        .unwrap_or(4) as i32;
    params.set_n_threads(n_threads);

    state.full(params, audio).map_err(|e| format!("{e}"))?;

    let num_segments = state.full_n_segments().map_err(|e| format!("{e}"))?;
    let mut text = String::new();
    for i in 0..num_segments {
        if let Ok(segment) = state.full_get_segment_text(i) {
            text.push_str(&segment);
            text.push(' ');
        }
    }
    Ok(text)
}
