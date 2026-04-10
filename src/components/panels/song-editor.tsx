import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { parseSongLyrics } from "@/lib/parse-song-lyrics"
import type { NewSong, Song } from "@/types/song"

interface Props {
  initial?: Song | null
  onSave: (song: NewSong) => Promise<void>
  onCancel: () => void
}

function sectionsToRaw(sections: Song["sections"]): string {
  return sections.map((s) => `[${s.label}]\n${s.lines.join("\n")}`).join("\n\n")
}

export function SongEditor({ initial, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "")
  const [artist, setArtist] = useState(initial?.artist ?? "")
  const [ccli, setCcli] = useState(initial?.ccli_number ?? "")
  const [raw, setRaw] = useState(initial ? sectionsToRaw(initial.sections) : "")
  const [saving, setSaving] = useState(false)

  const sections = useMemo(() => parseSongLyrics(raw), [raw])
  const canSave = title.trim().length > 0 && sections.length > 0 && !saving

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave({
        title: title.trim(),
        artist: artist.trim() || null,
        ccli_number: ccli.trim() || null,
        sections,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid h-full grid-cols-2 gap-3 overflow-hidden p-3">
      <div className="flex flex-col gap-2 overflow-y-auto">
        <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input placeholder="Artist" value={artist ?? ""} onChange={(e) => setArtist(e.target.value)} />
        <Input placeholder="CCLI number (optional)" value={ccli ?? ""} onChange={(e) => setCcli(e.target.value)} />
        <Textarea
          placeholder={`[Verse 1]\nAmazing grace...\n\n[Chorus]\nI once was lost...`}
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          className="min-h-[300px] font-mono text-sm"
        />
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={!canSave}>{initial ? "Update" : "Create"}</Button>
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
      <div className="overflow-y-auto rounded border bg-muted/30 p-3">
        <h4 className="mb-2 text-sm font-semibold">Preview</h4>
        {sections.map((s, i) => (
          <div key={i} className="mb-3">
            <div className="text-xs uppercase text-muted-foreground">{s.label}</div>
            {s.lines.map((line, j) => (
              <div key={j} className="text-sm">{line}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
