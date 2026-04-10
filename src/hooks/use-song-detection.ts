import { useCallback } from "react"
import { invoke } from "@tauri-apps/api/core"
import { useSongsStore } from "@/stores/songs-store"
import { useTauriEvent } from "@/hooks/use-tauri-event"

interface SongMatchPayload {
  song_id: number
  section_index: number
  line_index: number
  confidence: number
}

export function useSongDetection() {
  const {
    songs,
    activeSong,
    setActive,
    setSectionIndex,
    setLineIndex,
    setAutoDetectConfidence,
    autoDetectEnabled,
    setAutoDetectEnabled,
  } = useSongsStore()

  useTauriEvent<SongMatchPayload>("song_match", (m) => {
    if (!autoDetectEnabled) return
    const song = songs.find((s) => s.id === m.song_id)
    if (!song) return
    if (!activeSong || activeSong.id !== song.id) {
      setActive(song)
    }
    setSectionIndex(m.section_index)
    setLineIndex(m.line_index)
    setAutoDetectConfidence(m.confidence)
  })

  const setEnabled = useCallback(
    async (enabled: boolean) => {
      await invoke("set_song_autodetect_enabled", { enabled })
      setAutoDetectEnabled(enabled)
    },
    [setAutoDetectEnabled],
  )

  const setSensitivity = useCallback(async (threshold: number) => {
    await invoke("set_song_autodetect_sensitivity", { threshold })
  }, [])

  return { setEnabled, setSensitivity, enabled: autoDetectEnabled }
}
