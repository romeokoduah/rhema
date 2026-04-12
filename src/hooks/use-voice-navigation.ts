import { useTauriEvent } from "@/hooks/use-tauri-event"
import { useBibleStore } from "@/stores/bible-store"

interface GoToVerse {
  kind: "GoToVerse"
  book: string
  chapter: number
  verse: number | null
}
interface NavCommand {
  kind: "NextChapter" | "PreviousChapter" | "NextVerse" | "PreviousVerse"
}
type VoiceCommand = GoToVerse | NavCommand

export function useVoiceNavigation() {
  const bible = useBibleStore()

  useTauriEvent<VoiceCommand>("voice_command", (cmd) => {
    switch (cmd.kind) {
      case "GoToVerse": {
        const book = bible.books.find(
          (b) =>
            b.name.toLowerCase().startsWith(cmd.book.toLowerCase()) ||
            b.abbreviation?.toLowerCase() === cmd.book.toLowerCase(),
        )
        if (book) {
          bible.selectVerse({
            id: 0,
            translation_id: bible.activeTranslationId,
            book_number: book.book_number,
            book_name: book.name,
            book_abbreviation: book.abbreviation ?? "",
            chapter: cmd.chapter,
            verse: cmd.verse ?? 1,
            text: "",
          })
        }
        break
      }
      case "NextChapter":
      case "PreviousChapter":
      case "NextVerse":
      case "PreviousVerse": {
        const current = bible.selectedVerse
        if (!current) break
        if (cmd.kind === "NextChapter") {
          bible.selectVerse({ ...current, chapter: current.chapter + 1, verse: 1 })
        } else if (cmd.kind === "PreviousChapter") {
          bible.selectVerse({
            ...current,
            chapter: Math.max(1, current.chapter - 1),
            verse: 1,
          })
        } else if (cmd.kind === "NextVerse") {
          bible.selectVerse({ ...current, verse: current.verse + 1 })
        } else if (cmd.kind === "PreviousVerse") {
          bible.selectVerse({ ...current, verse: Math.max(1, current.verse - 1) })
        }
        break
      }
    }
  })
}
