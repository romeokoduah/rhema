use rhema_translate::OpenAiTranslator;
use serde_json::json;
use wiremock::matchers::{method, path, header};
use wiremock::{Mock, MockServer, ResponseTemplate};

#[tokio::test]
async fn translate_success_parses_choice() {
    let server = MockServer::start().await;
    Mock::given(method("POST"))
        .and(path("/v1/chat/completions"))
        .and(header("authorization", "Bearer test-key"))
        .respond_with(ResponseTemplate::new(200).set_body_json(json!({
            "choices": [{ "message": { "content": "Dieu est amour." } }]
        })))
        .mount(&server)
        .await;

    let translator = OpenAiTranslator::with_endpoint(
        "test-key".into(),
        format!("{}/v1/chat/completions", server.uri()),
    );
    let chunk = translator.translate("God is love.", "French", "s1".into()).await;

    assert!(!chunk.failed);
    assert_eq!(chunk.target_text, "Dieu est amour.");
    assert_eq!(chunk.target_lang, "French");
}

#[tokio::test]
async fn translate_401_marks_failed() {
    let server = MockServer::start().await;
    Mock::given(method("POST"))
        .and(path("/v1/chat/completions"))
        .respond_with(ResponseTemplate::new(401).set_body_string("bad key"))
        .mount(&server)
        .await;

    let translator = OpenAiTranslator::with_endpoint(
        "bad".into(),
        format!("{}/v1/chat/completions", server.uri()),
    );
    let chunk = translator.translate("Hello.", "French", "s2".into()).await;

    assert!(chunk.failed);
    assert_eq!(chunk.target_text, "Hello.");
}

#[tokio::test]
async fn translate_empty_content_marks_failed() {
    let server = MockServer::start().await;
    Mock::given(method("POST"))
        .and(path("/v1/chat/completions"))
        .respond_with(ResponseTemplate::new(200).set_body_json(json!({
            "choices": [{ "message": { "content": "   " } }]
        })))
        .mount(&server)
        .await;

    let translator = OpenAiTranslator::with_endpoint(
        "test-key".into(),
        format!("{}/v1/chat/completions", server.uri()),
    );
    let chunk = translator.translate("Hello.", "French", "s3".into()).await;

    assert!(chunk.failed);
    assert_eq!(chunk.target_text, "Hello.");
}
