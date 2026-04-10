import { create } from "zustand"
import type { Song } from "@/types/song"

interface SongsState {
  songs: Song[]
  activeSong: Song | null
  currentSectionIndex: number
  currentLineIndex: number
  autoDetectEnabled: boolean
  autoDetectConfidence: number
  setSongs: (songs: Song[]) => void
  setActive: (song: Song | null) => void
  setSectionIndex: (i: number) => void
  setLineIndex: (i: number) => void
  setAutoDetectEnabled: (v: boolean) => void
  setAutoDetectConfidence: (v: number) => void
}

export const useSongsStore = create<SongsState>((set) => ({
  songs: [],
  activeSong: null,
  currentSectionIndex: 0,
  currentLineIndex: 0,
  autoDetectEnabled: false,
  autoDetectConfidence: 0,
  setSongs: (songs) => set({ songs }),
  setActive: (song) => set({ activeSong: song, currentSectionIndex: 0, currentLineIndex: 0 }),
  setSectionIndex: (i) => set({ currentSectionIndex: i, currentLineIndex: 0 }),
  setLineIndex: (i) => set({ currentLineIndex: i }),
  setAutoDetectEnabled: (v) => set({ autoDetectEnabled: v }),
  setAutoDetectConfidence: (v) => set({ autoDetectConfidence: v }),
}))
