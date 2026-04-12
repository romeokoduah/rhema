import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useSongsStore } from "@/stores/songs-store"
import { useBroadcastStore } from "@/stores/broadcast-store"
import { invoke } from "@tauri-apps/api/core"

export function SongLivePanel() {
  const {
    activeSong,
    currentSectionIndex,
    currentLineIndex,
    setSectionIndex,
    autoDetectEnabled,
    autoDetectConfidence,
  } = useSongsStore()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!activeSong) return
      if (e.code === "Space") {
        e.preventDefault()
        if (e.shiftKey) {
          setSectionIndex(Math.max(currentSectionIndex - 1, 0))
        } else {
          setSectionIndex(Math.min(currentSectionIndex + 1, activeSong.sections.length - 1))
        }
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [activeSong, currentSectionIndex, setSectionIndex])

  if (!activeSong) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border bg-card p-4 text-center text-xs text-muted-foreground">
        Select a song from the library to see live lyrics here.
      </div>
    )
  }

  const sendToBroadcast = async () => {
    const section = activeSong.sections[currentSectionIndex]
    await invoke("broadcast_song_section", {
      title: activeSong.title,
      label: section.label,
      lines: section.lines,
    })

    // Also send through the template system
    useBroadcastStore.getState().sendTemplateContent({
      kind: "song",
      templateId: null,
      slotValues: {
        section_label: section.label,
        lyrics: section.lines.join("\n"),
        title: activeSong.title,
      },
    })
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border bg-card">
      <header className="flex items-center justify-between gap-2 border-b px-3 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="truncate text-sm font-semibold">{activeSong.title}</h3>
          {activeSong.artist && <span className="truncate text-xs text-muted-foreground">{activeSong.artist}</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs ${autoDetectEnabled ? "text-green-500" : "text-muted-foreground"}`}>
            {autoDetectEnabled ? `Auto (${Math.round(autoDetectConfidence * 100)}%)` : "Manual"}
          </span>
          <Button size="sm" onClick={sendToBroadcast}>Send</Button>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-3">
        {activeSong.sections.map((section, si) => (
          <div key={si} className={`mb-4 ${si === currentSectionIndex ? "opacity-100" : "opacity-40"}`}>
            <div className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">{section.label}</div>
            {section.lines.map((line, li) => (
              <div key={li} className={`text-lg ${si === currentSectionIndex && li === currentLineIndex ? "font-semibold underline" : ""}`}>
                {line}
              </div>
            ))}
          </div>
        ))}
      </div>
      <footer className="flex items-center justify-between border-t px-3 py-2">
        <Button size="sm" variant="ghost" onClick={() => setSectionIndex(Math.max(currentSectionIndex - 1, 0))}>← Prev</Button>
        <span className="text-xs text-muted-foreground">{currentSectionIndex + 1} / {activeSong.sections.length}</span>
        <Button size="sm" variant="ghost" onClick={() => setSectionIndex(Math.min(currentSectionIndex + 1, activeSong.sections.length - 1))}>Next →</Button>
      </footer>
    </div>
  )
}
