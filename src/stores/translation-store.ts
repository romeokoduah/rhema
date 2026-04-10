import { create } from "zustand"
import type { TranslationChunk, TranslationLanguage } from "@/types/translation"

interface TranslationState {
  enabled: boolean
  language: TranslationLanguage
  chunks: TranslationChunk[]
  setEnabled: (v: boolean) => void
  setLanguage: (lang: TranslationLanguage) => void
  addChunk: (chunk: TranslationChunk) => void
  clear: () => void
}

const MAX_CHUNKS = 500

export const useTranslationStore = create<TranslationState>((set) => ({
  enabled: false,
  language: "French",
  chunks: [],
  setEnabled: (v) => set({ enabled: v }),
  setLanguage: (lang) => set({ language: lang }),
  addChunk: (chunk) =>
    set((state) => {
      const next = [...state.chunks, chunk]
      if (next.length > MAX_CHUNKS) next.splice(0, next.length - MAX_CHUNKS)
      return { chunks: next }
    }),
  clear: () => set({ chunks: [] }),
}))
