import { useCallback } from "react"
import { invoke } from "@tauri-apps/api/core"
import { useTranslationStore } from "@/stores/translation-store"
import { useTauriEvent } from "@/hooks/use-tauri-event"
import type { TranslationChunk, TranslationLanguage } from "@/types/translation"

export function useTranslation() {
  const store = useTranslationStore()

  useTauriEvent<TranslationChunk>("translation_chunk", (payload) => {
    store.addChunk(payload)
  })

  const setEnabled = useCallback(
    async (enabled: boolean) => {
      await invoke("set_translation_enabled", { enabled })
      store.setEnabled(enabled)
    },
    [store],
  )

  const setLanguage = useCallback(
    async (lang: TranslationLanguage) => {
      await invoke("set_translation_language", { lang })
      store.setLanguage(lang)
    },
    [store],
  )

  const setApiKey = useCallback(async (apiKey: string) => {
    await invoke("set_openai_api_key", { apiKey })
  }, [])

  return {
    ...store,
    setEnabled,
    setLanguage,
    setApiKey,
  }
}
