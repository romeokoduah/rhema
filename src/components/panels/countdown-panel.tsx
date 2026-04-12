import { useState, useEffect } from "react"
import { TimerIcon, PlayIcon, PauseIcon, SquareIcon, CastIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PanelHeader } from "@/components/ui/panel-header"
import { useCountdownStore } from "@/stores/countdown-store"
import { useBroadcastStore } from "@/stores"

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function CountdownPanel() {
  const {
    remainingSeconds,
    isRunning,
    label,
    templateId,
    start,
    pause,
    resume,
    reset,
    tick,
  } = useCountdownStore()
  const [minutes, setMinutes] = useState("5")
  const [customLabel, setCustomLabel] = useState("Service begins in")

  // Tick interval
  useEffect(() => {
    if (!isRunning) return
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [isRunning, tick])

  const handleStart = () => {
    const mins = Math.max(0, parseInt(minutes) || 0)
    if (mins <= 0) return
    start(mins * 60, customLabel)
  }

  const handleBroadcast = () => {
    useBroadcastStore.getState().sendTemplateContent({
      kind: "countdown",
      templateId,
      slotValues: {
        time: formatTime(remainingSeconds),
        label,
      },
    })
  }

  const hasStarted = remainingSeconds > 0 || isRunning

  return (
    <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-card">
      <PanelHeader
        title="Countdown"
        icon={<TimerIcon className="size-3.5" />}
      />
      <div className="flex flex-1 flex-col gap-2 p-3">
        {!hasStarted ? (
          <>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Minutes</Label>
                <Input
                  type="number"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  min={1}
                  max={999}
                  className="h-8 text-sm"
                />
              </div>
              <div className="flex-[2]">
                <Label className="text-xs text-muted-foreground">Label</Label>
                <Input
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder="Service begins in"
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <Button size="sm" className="h-8" onClick={handleStart}>
              <PlayIcon className="mr-1.5 size-3" />
              Start
            </Button>
          </>
        ) : (
          <>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">{label}</div>
              <div className="font-mono text-3xl font-bold tabular-nums text-foreground">
                {formatTime(remainingSeconds)}
              </div>
            </div>
            <div className="flex gap-1.5">
              {isRunning ? (
                <Button size="sm" variant="outline" className="h-7 flex-1" onClick={pause}>
                  <PauseIcon className="mr-1 size-3" />
                  Pause
                </Button>
              ) : (
                <Button size="sm" variant="outline" className="h-7 flex-1" onClick={resume}>
                  <PlayIcon className="mr-1 size-3" />
                  Resume
                </Button>
              )}
              <Button size="sm" variant="outline" className="h-7" onClick={reset}>
                <SquareIcon className="size-3" />
              </Button>
              <Button size="sm" className="h-7" onClick={handleBroadcast} title="Send to Broadcast">
                <CastIcon className="size-3" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
