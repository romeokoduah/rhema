export type TranslationLanguage = "French" | "Spanish" | "Portuguese" | "German"

export interface TranslationChunk {
  source_text: string
  target_text: string
  target_lang: string
  source_sentence_id: string
  timestamp_ms: number
  failed: boolean
}
