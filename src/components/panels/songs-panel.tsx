import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useSongs } from "@/hooks/use-songs"
import { useSongsStore } from "@/stores/songs-store"
import { SongEditor } from "./song-editor"
import type { Song } from "@/types/song"

export function SongsPanel() {
  const { refresh, create, update, remove } = useSongs()
  const { songs, activeSong, setActive } = useSongsStore()
  const [query, setQuery] = useState("")
  const [editing, setEditing] = useState<Song | null>(null)
  const [creating, setCreating] = useState(false)

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border bg-card">
      <header className="flex items-center justify-between gap-2 border-b px-3 py-2">
        <h3 className="text-sm font-semibold">Songs</h3>
        <Button size="sm" onClick={() => setCreating(true)}>+ New</Button>
      </header>
      <div className="border-b px-3 py-2">
        <Input
          placeholder="Search songs..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            refresh(e.target.value || undefined).catch(console.error)
          }}
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {songs.length === 0 && (
          <p className="p-3 text-xs text-muted-foreground">No songs yet. Create one to get started.</p>
        )}
        {songs.map((song) => (
          <div
            key={song.id}
            className={`flex cursor-pointer items-center justify-between border-b px-3 py-2 text-sm hover:bg-muted/50 ${
              activeSong?.id === song.id ? "bg-muted" : ""
            }`}
            onClick={() => setActive(song)}
          >
            <div>
              <div className="font-medium">{song.title}</div>
              {song.artist && <div className="text-xs text-muted-foreground">{song.artist}</div>}
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setEditing(song) }}>Edit</Button>
              <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); remove(song.id).catch(console.error) }}>Del</Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={creating || editing !== null} onOpenChange={(open) => { if (!open) { setCreating(false); setEditing(null) } }}>
        <DialogContent className="h-[80vh] max-w-4xl">
          <DialogHeader><DialogTitle>{editing ? "Edit Song" : "New Song"}</DialogTitle></DialogHeader>
          <SongEditor
            initial={editing}
            onCancel={() => { setCreating(false); setEditing(null) }}
            onSave={async (song) => {
              if (editing) await update(editing.id, song)
              else await create(song)
              setCreating(false)
              setEditing(null)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
