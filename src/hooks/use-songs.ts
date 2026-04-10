import { useCallback, useEffect } from "react"
import { invoke } from "@tauri-apps/api/core"
import { useSongsStore } from "@/stores/songs-store"
import type { NewSong, Song } from "@/types/song"

export function useSongs() {
  const store = useSongsStore()

  const refresh = useCallback(async (query?: string) => {
    const songs = (await invoke("list_songs", { query: query ?? null })) as Song[]
    store.setSongs(songs)
  }, [store])

  useEffect(() => {
    refresh().catch(console.error)
  }, [refresh])

  const create = useCallback(async (song: NewSong) => {
    const id = (await invoke("create_song", { song })) as number
    await refresh()
    return id
  }, [refresh])

  const update = useCallback(async (id: number, song: NewSong) => {
    await invoke("update_song", { id, song })
    await refresh()
  }, [refresh])

  const remove = useCallback(async (id: number) => {
    await invoke("delete_song", { id })
    await refresh()
  }, [refresh])

  return { ...store, refresh, create, update, remove }
}
