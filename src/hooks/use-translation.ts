import { useCallback, useEffect } from "react"
import { invoke } from "@tauri-apps/api/core"
import { load } from "@tauri-apps/plugin-store"
import { useTranslationStore } from "@/stores/translation-store"
import { useTauriEvent } from "@/hooks/use-tauri-event"
import type { TranslationChunk, TranslationLanguage } from "@/types/translation"

const STORE_FILE = "settings.json"
const KEY_OPENAI_API_KEY = "openai_api_key"
const KEY_TRANSLATION_ENABLED = "translation_enabled"
const KEY_TRANSLATION_LANGUAGE = "translation_language"

export function useTranslation() {
  const store = useTranslationStore()

  // Restore persisted settings on mount
  useEffect(() => {
    ;(async () => {
      const s = await load(STORE_FILE)

      const savedKey = await s.get<string>(KEY_OPENAI_API_KEY)
      if (savedKey) {
        await invoke("set_openai_api_key", { apiKey: savedKey })
      }

      const savedEnabled = await s.get<boolean>(KEY_TRANSLATION_ENABLED)
      if (savedEnabled != null) {
        await invoke("set_translation_enabled", { enabled: savedEnabled })
        store.setEnabled(savedEnabled)
      }

      const savedLang = await s.get<TranslationLanguage>(KEY_TRANSLATION_LANGUAGE)
      if (savedLang) {
        await invoke("set_translation_language", { lang: savedLang })
        store.setLanguage(savedLang)
      }
    })().catch(console.error)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useTauriEvent<TranslationChunk>("translation_chunk", (payload) => {
    store.addChunk(payload)
  })

  const setEnabled = useCallback(
    async (enabled: boolean) => {
      await invoke("set_translation_enabled", { enabled })
      store.setEnabled(enabled)
      const s = await load(STORE_FILE)
      await s.set(KEY_TRANSLATION_ENABLED, enabled)
      await s.save()
    },
    [store],
  )

  const setLanguage = useCallback(
    async (lang: TranslationLanguage) => {
      await invoke("set_translation_language", { lang })
      store.setLanguage(lang)
      const s = await load(STORE_FILE)
      await s.set(KEY_TRANSLATION_LANGUAGE, lang)
      await s.save()
    },
    [store],
  )

  const setApiKey = useCallback(async (apiKey: string) => {
    await invoke("set_openai_api_key", { apiKey })
    const s = await load(STORE_FILE)
    await s.set(KEY_OPENAI_API_KEY, apiKey)
    await s.save()
  }, [])

  return {
    ...store,
    setEnabled,
    setLanguage,
    setApiKey,
  }
}
