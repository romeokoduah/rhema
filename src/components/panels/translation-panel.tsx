import { useEffect, useRef } from "react"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/hooks/use-translation"
import type { TranslationLanguage } from "@/types/translation"

const LANGUAGES: TranslationLanguage[] = [
  "French",
  "Spanish",
  "Portuguese",
  "German",
]

export function TranslationPanel() {
  const { enabled, language, chunks, setEnabled, setLanguage, clear } =
    useTranslation()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [chunks.length])

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border bg-card">
      <header className="flex items-center justify-between gap-2 border-b px-3 py-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">Live Translation</h3>
          <Switch
            checked={enabled}
            onCheckedChange={setEnabled}
            aria-label="Toggle translation"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={language}
            onValueChange={(v) => setLanguage(v as TranslationLanguage)}
          >
            <SelectTrigger className="h-7 w-28 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="ghost" onClick={clear}>
            Clear
          </Button>
        </div>
      </header>

      {enabled ? (
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2">
          {chunks.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Waiting for transcribed speech...
            </p>
          )}
          {chunks.map((c) => (
            <div
              key={c.source_sentence_id}
              className="mb-3 grid grid-cols-2 gap-3 text-sm"
            >
              <div className="text-muted-foreground">{c.source_text}</div>
              <div className={c.failed ? "text-red-500" : "text-foreground"}>
                {c.target_text}
                {c.failed && <span className="ml-1 text-xs">⚠ failed</span>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center p-4 text-center text-xs text-muted-foreground">
          Translation is off. Toggle it on to begin translating sermon speech.
        </div>
      )}
    </div>
  )
}
