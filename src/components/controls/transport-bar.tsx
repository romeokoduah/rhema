import { useState } from "react"
import { LevelMeter } from "@/components/ui/level-meter"
import { LiveIndicator } from "@/components/ui/live-indicator"
import { SessionTimer } from "@/components/ui/session-timer"
import { Badge } from "@/components/ui/badge"
import { MicIcon, PaletteIcon, CastIcon, SunIcon, MoonIcon, MonitorIcon } from "lucide-react"
import { AlertSendButton } from "@/components/broadcast/alert-dialog"
import { Button } from "@/components/ui/button"
import { SettingsDialog } from "@/components/settings-dialog"
import { ThemeDesigner } from "@/components/broadcast/theme-designer"
import { BroadcastSettings } from "@/components/broadcast/broadcast-settings"
import { useAudioStore, useTranscriptStore, useBroadcastStore } from "@/stores"
import { useTheme } from "@/components/theme-provider"

export function TransportBar() {
  const audioLevel = useAudioStore((s) => s.level)
  const isTranscribing = useTranscriptStore((s) => s.isTranscribing)
  const [broadcastOpen, setBroadcastOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  const cycleTheme = () => {
    const next = theme === "dark" ? "light" : theme === "light" ? "system" : "dark"
    setTheme(next)
  }

  const ThemeIcon = theme === "dark" ? MoonIcon : theme === "light" ? SunIcon : MonitorIcon
  const themeLabel = theme === "dark" ? "Dark" : theme === "light" ? "Light" : "System"

  return (
    <div
      data-slot="transport-bar"
      className="col-span-4 flex h-14 items-center justify-between border-b border-border  bg-card px-3"
    >
      {/* Left: Logo + Plan Badge */}
      <div className="flex items-center gap-2.5">
        <span className="text-sm font-semibold tracking-tight text-foreground">
          Rhema
        </span>
        <Badge variant="outline" className="text-[0.5625rem] uppercase">
          Free
        </Badge>
      </div>

      {/* Center: Session Timer */}
      <SessionTimer seconds={0} />

      {/* Right: Audio + Status + Settings */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <MicIcon className="size-3.5 text-muted-foreground" />
          <LevelMeter level={audioLevel.rms} bars={4} />
        </div>
        <LiveIndicator active={isTranscribing} />
        <AlertSendButton />
        <Button
          variant="ghost"
          size="icon-sm"
          title="Broadcast Settings"
          onClick={() => setBroadcastOpen(true)}
        >
          <CastIcon className="size-3.5" />
        </Button>
        <BroadcastSettings open={broadcastOpen} onOpenChange={setBroadcastOpen} />
        <Button
          variant="ghost"
          size="icon-sm"
          title="Theme Designer"
          onClick={() => useBroadcastStore.getState().setDesignerOpen(true)}
        >
          <PaletteIcon className="size-3.5" />
        </Button>
        <ThemeDesigner />
        <Button
          variant="ghost"
          size="icon-sm"
          title={`Theme: ${themeLabel}`}
          onClick={cycleTheme}
        >
          <ThemeIcon className="size-3.5" />
        </Button>
        <SettingsDialog />
      </div>
    </div>
  )
}
