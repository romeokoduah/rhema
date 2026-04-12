import { useState, useEffect, useCallback } from "react"
import { invoke } from "@tauri-apps/api/core"
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
import { useSettingsStore } from "@/stores"
import type { TranslationLanguage } from "@/types/translation"
import { DownloadIcon, CheckCircleIcon, LoaderIcon } from "lucide-react"

export function ServiceFeaturesSettings() {
  const translation = useTranslation()
  const songDetect = useSongDetection()
  const [apiKey, setApiKey] = useState("")
  const [saved, setSaved] = useState(false)
  const { sttBackend, setSttBackend } = useSettingsStore()
  const [modelDownloaded, setModelDownloaded] = useState<boolean | null>(null)
  const [modelBundled, setModelBundled] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const checkModel = useCallback(async () => {
    try {
      const [exists, bundled] = await Promise.all([
        invoke<boolean>("whisper_model_exists"),
        invoke<boolean>("whisper_model_is_bundled"),
      ])
      setModelDownloaded(exists)
      setModelBundled(bundled)
    } catch {
      setModelDownloaded(false)
      setModelBundled(false)
    }
  }, [])

  useEffect(() => {
    if (sttBackend === "local") {
      checkModel()
    }
  }, [sttBackend, checkModel])

  const handleDownloadModel = async () => {
    setDownloading(true)
    try {
      await invoke<string>("download_whisper_model")
      setModelDownloaded(true)
    } catch (e) {
      console.error("Failed to download Whisper model:", e)
      alert(String(e))
    } finally {
      setDownloading(false)
    }
  }

  const handleSaveKey = async () => {
    await translation.setApiKey(apiKey)
    setApiKey("")
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Speech-to-Text backend */}
      <section className="rounded-lg border p-4">
        <header className="mb-3">
          <h3 className="text-sm font-semibold">Speech-to-Text</h3>
        </header>
        <div className="flex items-center gap-2 mb-3">
          <label className="text-xs text-muted-foreground">Backend:</label>
          <Select
            value={sttBackend}
            onValueChange={(v) => setSttBackend(v as "cloud" | "local")}
          >
            <SelectTrigger className="h-8 w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent portal={false}>
              <SelectItem value="cloud">Cloud (Deepgram)</SelectItem>
              <SelectItem value="local">Local (Whisper)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {sttBackend === "local" && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              {modelDownloaded === true && modelBundled && (
                <span className="flex items-center gap-1 text-xs text-green-600">
                  <CheckCircleIcon className="size-3.5" />
                  Model: Bundled (no download needed)
                </span>
              )}
              {modelDownloaded === true && !modelBundled && (
                <span className="flex items-center gap-1 text-xs text-green-600">
                  <CheckCircleIcon className="size-3.5" />
                  Model downloaded
                </span>
              )}
              {modelDownloaded === false && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownloadModel}
                  disabled={downloading}
                >
                  {downloading ? (
                    <>
                      <LoaderIcon className="size-3.5 animate-spin mr-1" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <DownloadIcon className="size-3.5 mr-1" />
                      Download Model (~1.6GB)
                    </>
                  )}
                </Button>
              )}
              {modelDownloaded === null && (
                <span className="text-xs text-muted-foreground">Checking model...</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {modelBundled
                ? "Model is bundled with the app. No internet or API key required."
                : "No internet or API key required after model download."}{" "}
              Uses whisper.cpp for on-device transcription.
            </p>
          </div>
        )}
        {sttBackend === "cloud" && (
          <p className="text-xs text-muted-foreground">
            Uses Deepgram Nova-3 for real-time transcription. Requires an API key
            (configure in API Keys tab).
          </p>
        )}
      </section>

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
            <SelectContent portal={false}>
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
