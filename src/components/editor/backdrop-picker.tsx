import { useState, useRef, useMemo } from "react"
import { useBroadcastStore } from "@/stores/broadcast-store"
import { useTemplates } from "@/hooks/use-templates"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UploadIcon, TrashIcon } from "lucide-react"

// --- Church-friendly preset swatches ---
const PRESET_SOLID_COLORS = [
  { name: "Black", color: "#000000" },
  { name: "Dark Navy", color: "#0a1628" },
  { name: "Deep Purple", color: "#2d1b4e" },
  { name: "Burgundy", color: "#4a0e1e" },
  { name: "Forest Green", color: "#14352a" },
  { name: "Warm Brown", color: "#3e2723" },
  { name: "Charcoal", color: "#1c1c1c" },
  { name: "Dark Teal", color: "#004d4d" },
  { name: "Midnight Blue", color: "#191970" },
  { name: "Dark Slate", color: "#2f4f4f" },
]

function parseColorOpacity(color: string): { hex: string; opacity: number } {
  if (color.length === 9 && color.startsWith("#")) {
    const alphaHex = color.slice(7, 9)
    const alpha = parseInt(alphaHex, 16) / 255
    return { hex: color.slice(0, 7), opacity: Math.round(alpha * 100) }
  }
  if (color.length === 7 && color.startsWith("#")) {
    return { hex: color, opacity: 100 }
  }
  return { hex: color || "#000000", opacity: 100 }
}

function buildColorWithOpacity(hex: string, opacity: number): string {
  if (opacity >= 100) return hex
  const alphaHex = Math.round((opacity / 100) * 255)
    .toString(16)
    .padStart(2, "0")
  return `${hex}${alphaHex}`
}

function SolidTab() {
  const draftTheme = useBroadcastStore((s) => s.draftTheme)
  const update = useBroadcastStore((s) => s.updateDraftNested)

  if (!draftTheme) return null

  const handleSelectPreset = (color: string) => {
    update("background.type", "solid")
    update("background.color", color)
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Hex input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={draftTheme.background.color}
            onChange={(e) => {
              update("background.type", "solid")
              update("background.color", e.target.value)
            }}
            className="h-7 w-8 cursor-pointer rounded border border-input bg-transparent p-0.5"
          />
          <Input
            value={draftTheme.background.color}
            onChange={(e) => {
              const v = e.target.value
              if (/^#[0-9a-fA-F]{6}$/.test(v)) {
                update("background.type", "solid")
                update("background.color", v)
              }
            }}
            className="w-24 font-mono"
          />
        </div>
      </div>

      {/* Preset swatches */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Presets</label>
        <div className="grid grid-cols-5 gap-1.5">
          {PRESET_SOLID_COLORS.map((swatch) => (
            <button
              key={swatch.color}
              title={swatch.name}
              onClick={() => handleSelectPreset(swatch.color)}
              className="aspect-square rounded-md border border-border transition-transform hover:scale-110 focus:ring-2 focus:ring-primary focus:outline-none"
              style={{ backgroundColor: swatch.color }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function GradientTab() {
  const draftTheme = useBroadcastStore((s) => s.draftTheme)
  const update = useBroadcastStore((s) => s.updateDraftNested)

  if (!draftTheme) return null

  const gradient = draftTheme.background.gradient ?? {
    type: "linear" as const,
    angle: 180,
    stops: [
      { color: "#000000", position: 0 },
      { color: "#ffffff", position: 100 },
    ],
  }

  const stop0 = gradient.stops[0] ?? { color: "#000000", position: 0 }
  const stop1 = gradient.stops[1] ?? { color: "#ffffff", position: 100 }

  const ensureGradientType = () => {
    if (draftTheme.background.type !== "gradient") {
      update("background.type", "gradient")
    }
    if (!draftTheme.background.gradient) {
      update("background.gradient", {
        type: "linear",
        angle: 180,
        stops: [
          { color: "#000000", position: 0 },
          { color: "#ffffff", position: 100 },
        ],
      })
    }
  }

  // Live preview CSS
  const gradientCss = useMemo(() => {
    if (gradient.type === "radial") {
      return `radial-gradient(circle, ${stop0.color} ${stop0.position}%, ${stop1.color} ${stop1.position}%)`
    }
    return `linear-gradient(${gradient.angle}deg, ${stop0.color} ${stop0.position}%, ${stop1.color} ${stop1.position}%)`
  }, [gradient.type, gradient.angle, stop0.color, stop0.position, stop1.color, stop1.position])

  return (
    <div className="flex flex-col gap-3">
      {/* Live preview */}
      <div
        className="aspect-video w-full rounded-md border border-border"
        style={{ background: gradientCss }}
      />

      {/* Linear / Radial toggle */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Type</label>
        <Select
          value={gradient.type}
          onValueChange={(v) => {
            ensureGradientType()
            update("background.gradient.type", v)
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="linear">Linear</SelectItem>
            <SelectItem value="radial">Radial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Angle slider (linear only) */}
      {gradient.type === "linear" && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">Angle</label>
            <span className="text-xs tabular-nums text-muted-foreground">{gradient.angle}&deg;</span>
          </div>
          <Slider
            min={0}
            max={360}
            step={1}
            value={[gradient.angle]}
            onValueChange={([v]) => {
              ensureGradientType()
              update("background.gradient.angle", v)
            }}
          />
        </div>
      )}

      {/* Color Stop 1 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Color 1</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={stop0.color}
            onChange={(e) => {
              ensureGradientType()
              update("background.gradient.stops.0.color", e.target.value)
            }}
            className="h-7 w-8 cursor-pointer rounded border border-input bg-transparent p-0.5"
          />
          <Input
            value={stop0.color}
            onChange={(e) => {
              const v = e.target.value
              if (/^#[0-9a-fA-F]{6}$/.test(v)) {
                ensureGradientType()
                update("background.gradient.stops.0.color", v)
              }
            }}
            className="w-20 font-mono"
          />
        </div>
      </div>

      {/* Color Stop 2 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Color 2</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={stop1.color}
            onChange={(e) => {
              ensureGradientType()
              update("background.gradient.stops.1.color", e.target.value)
            }}
            className="h-7 w-8 cursor-pointer rounded border border-input bg-transparent p-0.5"
          />
          <Input
            value={stop1.color}
            onChange={(e) => {
              const v = e.target.value
              if (/^#[0-9a-fA-F]{6}$/.test(v)) {
                ensureGradientType()
                update("background.gradient.stops.1.color", v)
              }
            }}
            className="w-20 font-mono"
          />
        </div>
      </div>
    </div>
  )
}

function ImageTab() {
  const draftTheme = useBroadcastStore((s) => s.draftTheme)
  const update = useBroadcastStore((s) => s.updateDraftNested)
  const { backdrops, createBackdrop, removeBackdrop } = useTemplates()
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!draftTheme) return null

  const image = draftTheme.background.image
  const tint = image?.tint ? parseColorOpacity(image.tint) : { hex: "#000000", opacity: 50 }

  const handleUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const url = URL.createObjectURL(file)

    // Save as backdrop in store
    try {
      await createBackdrop({
        name: file.name.replace(/\.[^/.]+$/, ""),
        type: "image",
        data_json: JSON.stringify({ url }),
        thumbnail_png: null,
        is_builtin: false,
      })
    } catch {
      // Silently ignore if Tauri backend isn't available
    }

    // Apply to current theme
    update("background.type", "image")
    update("background.image", {
      url,
      fit: "cover",
      blur: 0,
      brightness: 100,
      tint: null,
    })

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSelectBackdrop = (dataJson: string) => {
    try {
      const data = JSON.parse(dataJson) as { url?: string }
      if (data.url) {
        update("background.type", "image")
        update("background.image", {
          url: data.url,
          fit: "cover",
          blur: 0,
          brightness: 100,
          tint: null,
        })
      }
    } catch {
      // ignore parse errors
    }
  }

  const imageBackdrops = backdrops.filter((b) => b.type === "image")

  return (
    <div className="flex flex-col gap-3">
      {/* Backdrop grid */}
      {imageBackdrops.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Saved Backdrops</label>
          <div className="grid grid-cols-3 gap-1.5">
            {imageBackdrops.map((bd) => {
              let url = ""
              try {
                const data = JSON.parse(bd.data_json) as { url?: string }
                url = data.url ?? ""
              } catch {
                // ignore
              }
              return (
                <div key={bd.id} className="group relative">
                  <button
                    onClick={() => handleSelectBackdrop(bd.data_json)}
                    className="aspect-video w-full overflow-hidden rounded-md border border-border bg-muted transition-transform hover:scale-105"
                  >
                    {url && (
                      <img
                        src={url}
                        alt={bd.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </button>
                  {!bd.is_builtin && (
                    <button
                      onClick={() => void removeBackdrop(bd.id)}
                      className="absolute top-0.5 right-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <TrashIcon className="size-2.5" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Upload button */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void handleFileChange(e)}
      />
      <Button variant="outline" size="sm" className="w-full" onClick={handleUpload}>
        <UploadIcon className="size-3" />
        Upload Image
      </Button>

      {/* Image controls (when image bg is active) */}
      {image && draftTheme.background.type === "image" && (
        <div className="flex flex-col gap-3 border-t pt-3">
          {/* Fit Mode */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Fit Mode</label>
            <Select
              value={image.fit}
              onValueChange={(v) => update("background.image.fit", v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cover">Cover</SelectItem>
                <SelectItem value="contain">Contain</SelectItem>
                <SelectItem value="stretch">Stretch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Blur */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Blur</label>
              <span className="text-xs tabular-nums text-muted-foreground">{image.blur}px</span>
            </div>
            <Slider
              min={0}
              max={50}
              step={1}
              value={[image.blur]}
              onValueChange={([v]) => update("background.image.blur", v)}
            />
          </div>

          {/* Brightness */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Brightness</label>
              <span className="text-xs tabular-nums text-muted-foreground">{image.brightness}%</span>
            </div>
            <Slider
              min={0}
              max={200}
              step={1}
              value={[image.brightness]}
              onValueChange={([v]) => update("background.image.brightness", v)}
            />
          </div>

          {/* Color Overlay */}
          <div className="flex flex-col gap-3 border-t pt-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold">Color Overlay</h4>
              <input
                type="checkbox"
                checked={image.tint !== null}
                onChange={(e) => {
                  if (e.target.checked) {
                    update("background.image.tint", buildColorWithOpacity("#000000", 50))
                  } else {
                    update("background.image.tint", null)
                  }
                }}
                className="h-4 w-4 rounded border-input accent-primary"
              />
            </div>

            {image.tint !== null && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={tint.hex}
                    onChange={(e) =>
                      update("background.image.tint", buildColorWithOpacity(e.target.value, tint.opacity))
                    }
                    className="h-7 w-8 cursor-pointer rounded border border-input bg-transparent p-0.5"
                  />
                  <Input
                    value={tint.hex}
                    onChange={(e) => {
                      const v = e.target.value
                      if (/^#[0-9a-fA-F]{6}$/.test(v)) {
                        update("background.image.tint", buildColorWithOpacity(v, tint.opacity))
                      }
                    }}
                    className="w-20 font-mono"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">Opacity</label>
                  <span className="text-xs tabular-nums text-muted-foreground">{tint.opacity}%</span>
                </div>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[tint.opacity]}
                  onValueChange={([v]) =>
                    update("background.image.tint", buildColorWithOpacity(tint.hex, v))
                  }
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function BackdropPicker() {
  const draftTheme = useBroadcastStore((s) => s.draftTheme)
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (!draftTheme) return "solid"
    return draftTheme.background.type === "gradient"
      ? "gradient"
      : draftTheme.background.type === "image"
        ? "image"
        : "solid"
  })

  if (!draftTheme) return null

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-2">
      <TabsList className="w-full">
        <TabsTrigger value="solid">Solid</TabsTrigger>
        <TabsTrigger value="gradient">Gradient</TabsTrigger>
        <TabsTrigger value="image">Image</TabsTrigger>
      </TabsList>

      <TabsContent value="solid" className="mt-0">
        <SolidTab />
      </TabsContent>
      <TabsContent value="gradient" className="mt-0">
        <GradientTab />
      </TabsContent>
      <TabsContent value="image" className="mt-0">
        <ImageTab />
      </TabsContent>
    </Tabs>
  )
}
