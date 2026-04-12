import { useEffect, useRef } from "react"
import { load } from "@tauri-apps/plugin-store"
import { useSettingsStore } from "@/stores/settings-store"
import { useTemplateStore } from "@/stores/template-store"
import { useSongsStore } from "@/stores/songs-store"
import type { TemplateCategory } from "@/types/template"

const STORE_FILE = "settings.json"

// Keys for settings-store
const KEY_DEEPGRAM_API_KEY = "deepgram_api_key"
const KEY_AUDIO_DEVICE_ID = "audio_device_id"
const KEY_GAIN = "gain"
const KEY_STT_BACKEND = "stt_backend"

// Keys for template-store
const KEY_ACTIVE_TEMPLATE_IDS = "active_template_ids"

// Keys for songs-store
const KEY_AUTO_DETECT_ENABLED = "song_auto_detect_enabled"

/**
 * Hook that restores persisted settings on mount and subscribes to store
 * changes to persist them automatically. Call once in the root component.
 */
export function useSettingsPersistence() {
  const initialized = useRef(false)

  // ── Restore on mount ──
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    ;(async () => {
      const s = await load(STORE_FILE)

      // settings-store
      const savedDeepgramKey = await s.get<string>(KEY_DEEPGRAM_API_KEY)
      if (savedDeepgramKey != null) {
        useSettingsStore.getState().setDeepgramApiKey(savedDeepgramKey)
      }

      const savedDeviceId = await s.get<string | null>(KEY_AUDIO_DEVICE_ID)
      if (savedDeviceId !== undefined && savedDeviceId !== null) {
        useSettingsStore.getState().setAudioDeviceId(savedDeviceId)
      }

      const savedGain = await s.get<number>(KEY_GAIN)
      if (savedGain != null) {
        useSettingsStore.getState().setGain(savedGain)
      }

      const savedBackend = await s.get<"cloud" | "local">(KEY_STT_BACKEND)
      if (savedBackend) {
        useSettingsStore.getState().setSttBackend(savedBackend)
      }

      // template-store
      const savedTemplateIds = await s.get<Record<TemplateCategory, number | null>>(KEY_ACTIVE_TEMPLATE_IDS)
      if (savedTemplateIds) {
        for (const [category, id] of Object.entries(savedTemplateIds)) {
          useTemplateStore.getState().setActiveTemplateId(category as TemplateCategory, id as number | null)
        }
      }

      // songs-store
      const savedAutoDetect = await s.get<boolean>(KEY_AUTO_DETECT_ENABLED)
      if (savedAutoDetect != null) {
        useSongsStore.getState().setAutoDetectEnabled(savedAutoDetect)
      }
    })().catch(console.error)
  }, [])

  // ── Subscribe to changes and persist ──
  useEffect(() => {
    const unsubs: (() => void)[] = []

    // settings-store: persist on any relevant change
    unsubs.push(
      useSettingsStore.subscribe(async (state, prev) => {
        const s = await load(STORE_FILE)
        if (state.deepgramApiKey !== prev.deepgramApiKey) {
          await s.set(KEY_DEEPGRAM_API_KEY, state.deepgramApiKey)
          await s.save()
        }
        if (state.audioDeviceId !== prev.audioDeviceId) {
          await s.set(KEY_AUDIO_DEVICE_ID, state.audioDeviceId)
          await s.save()
        }
        if (state.gain !== prev.gain) {
          await s.set(KEY_GAIN, state.gain)
          await s.save()
        }
        if (state.sttBackend !== prev.sttBackend) {
          await s.set(KEY_STT_BACKEND, state.sttBackend)
          await s.save()
        }
      }),
    )

    // template-store: persist activeTemplateIds
    unsubs.push(
      useTemplateStore.subscribe(async (state, prev) => {
        if (state.activeTemplateIds !== prev.activeTemplateIds) {
          const s = await load(STORE_FILE)
          await s.set(KEY_ACTIVE_TEMPLATE_IDS, state.activeTemplateIds)
          await s.save()
        }
      }),
    )

    // songs-store: persist autoDetectEnabled
    unsubs.push(
      useSongsStore.subscribe(async (state, prev) => {
        if (state.autoDetectEnabled !== prev.autoDetectEnabled) {
          const s = await load(STORE_FILE)
          await s.set(KEY_AUTO_DETECT_ENABLED, state.autoDetectEnabled)
          await s.save()
        }
      }),
    )

    return () => unsubs.forEach((fn) => fn())
  }, [])
}
