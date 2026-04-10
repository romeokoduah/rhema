import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/hooks/use-translation"
import { useSongDetection } from "@/hooks/use-song-detection"
import type { TranslationLanguage } from "@/types/translation"

export function ServiceFeaturesSettings() {
  const translation = useTranslation()
  const songDetect = useSongDetection()
  const [apiKey, setApiKey] = useState("")
  const [saved, setSaved] = useState(false)

  const handleSaveKey = async () => {
    await translation.setApiKey(apiKey)
    setApiKey("")
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-lg border p-4">
        <header className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Live Translation</h3>
          <Switch
            checked={translation.enabled}
            onCheckedChange={translation.setEnabled}
          />
        </header>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">Target language:</label>
          <Select
            value={translation.language}
            onValueChange={(v) => translation.setLanguage(v as TranslationLanguage)}
          >
            <SelectTrigger className="h-8 w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="French">French</SelectItem>
              <SelectItem value="Spanish">Spanish</SelectItem>
              <SelectItem value="Portuguese">Portuguese</SelectItem>
              <SelectItem value="German">German</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Input
            type="password"
            placeholder="OpenAI API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="text-xs"
          />
          <Button size="sm" onClick={handleSaveKey} disabled={!apiKey.trim()}>
            Save Key
          </Button>
          {saved && <span className="text-xs text-green-600">Saved</span>}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Translation uses OpenAI gpt-4o-mini. Get a key at platform.openai.com.
        </p>
      </section>

      <section className="rounded-lg border p-4">
        <header className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">
            Song Auto-Detect{" "}
            <span className="text-xs font-normal text-muted-foreground">
              (experimental)
            </span>
          </h3>
          <Switch
            checked={songDetect.enabled}
            onCheckedChange={songDetect.setEnabled}
          />
        </header>
        <div className="flex items-center gap-3">
          <label className="text-xs text-muted-foreground min-w-[72px]">
            Sensitivity:
          </label>
          <Slider
            min={0.5}
            max={0.9}
            step={0.05}
            defaultValue={[0.65]}
            onValueChange={(v) => songDetect.setSensitivity(v[0])}
            className="flex-1"
          />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Auto-detection matches transcribed audio against your song library. Works
          best with clear vocals close to a mic; expect inconsistent results with
          full-band worship.
        </p>
      </section>
    </div>
  )
}
