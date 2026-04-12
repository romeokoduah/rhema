use std::path::{Path, PathBuf};

const MODEL_URL: &str =
    "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.en.bin";
const MODEL_FILENAME: &str = "ggml-tiny.en.bin";

pub fn model_dir(app_data_dir: &Path) -> PathBuf {
    app_data_dir.join("models")
}

pub fn model_path(app_data_dir: &Path) -> PathBuf {
    model_dir(app_data_dir).join(MODEL_FILENAME)
}

pub fn model_exists(app_data_dir: &Path) -> bool {
    model_path(app_data_dir).exists()
}

pub async fn download_model(app_data_dir: &Path) -> Result<PathBuf, String> {
    let dir = model_dir(app_data_dir);
    std::fs::create_dir_all(&dir).map_err(|e| format!("Failed to create model dir: {e}"))?;
    let path = dir.join(MODEL_FILENAME);

    if path.exists() {
        return Ok(path);
    }

    log::info!("Downloading Whisper model from {MODEL_URL}...");
    let response = reqwest::get(MODEL_URL)
        .await
        .map_err(|e| format!("Download failed: {e}"))?;
    if !response.status().is_success() {
        return Err(format!("Download failed: HTTP {}", response.status()));
    }
    let bytes = response
        .bytes()
        .await
        .map_err(|e| format!("Download failed: {e}"))?;
    std::fs::write(&path, &bytes).map_err(|e| format!("Failed to write model: {e}"))?;
    log::info!("Whisper model downloaded to {}", path.display());
    Ok(path)
}
