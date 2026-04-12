use rhema_detection::voice_command::{parse_voice_command, VoiceCommand};

#[test]
fn go_to_verse() {
    let cmd = parse_voice_command("go to John 3:16").unwrap();
    match cmd {
        VoiceCommand::GoToVerse { book, chapter, verse } => {
            assert_eq!(book, "John");
            assert_eq!(chapter, 3);
            assert_eq!(verse, Some(16));
        }
        _ => panic!("expected GoToVerse"),
    }
}

#[test]
fn turn_to_chapter() {
    let cmd = parse_voice_command("turn to Romans chapter 8").unwrap();
    match cmd {
        VoiceCommand::GoToVerse { book, chapter, verse } => {
            assert_eq!(book, "Romans");
            assert_eq!(chapter, 8);
            assert_eq!(verse, None);
        }
        _ => panic!("expected GoToVerse"),
    }
}

#[test]
fn numbered_book() {
    let cmd = parse_voice_command("go to first Corinthians 13:4").unwrap();
    match cmd {
        VoiceCommand::GoToVerse { book, chapter, verse } => {
            assert_eq!(book, "1 Corinthians");
            assert_eq!(chapter, 13);
            assert_eq!(verse, Some(4));
        }
        _ => panic!("expected GoToVerse"),
    }
}

#[test]
fn next_chapter() {
    assert!(matches!(parse_voice_command("next chapter"), Some(VoiceCommand::NextChapter)));
}

#[test]
fn previous_verse() {
    assert!(matches!(parse_voice_command("previous verse"), Some(VoiceCommand::PreviousVerse)));
}

#[test]
fn unrelated_text() {
    assert!(parse_voice_command("today we'll talk about love").is_none());
}
