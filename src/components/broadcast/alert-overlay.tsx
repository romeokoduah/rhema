import { useAlertStore } from "@/stores/alert-store"
import { useTemplateStore } from "@/stores/template-store"
import { fillTemplateSlots } from "@/lib/fill-template-slots"
import { useBroadcastStore } from "@/stores"
import { XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useRef, useState } from "react"

export function AlertOverlay() {
  const currentAlert = useAlertStore((s) => s.currentAlert)
  const dismissCurrent = useAlertStore((s) => s.dismissCurrent)
  const [visible, setVisible] = useState(false)
  const prevAlertId = useRef<string | null>(null)

  useEffect(() => {
    if (currentAlert) {
      // Small delay to trigger CSS transition
      const raf = requestAnimationFrame(() => setVisible(true))
      return () => cancelAnimationFrame(raf)
    } else {
      setVisible(false)
    }
  }, [currentAlert?.id])

  // Broadcast the alert through the template system
  useEffect(() => {
    if (!currentAlert) return
    if (prevAlertId.current === currentAlert.id) return
    prevAlertId.current = currentAlert.id

    const templateStore = useTemplateStore.getState()
    const template = currentAlert.templateId != null
      ? templateStore.templates.find((t) => t.id === currentAlert.templateId) ?? null
      : templateStore.getActiveTemplate("alert")

    if (template) {
      const filledJson = fillTemplateSlots(template.canvas_json, template.slots_json, {
        icon: currentAlert.icon,
        title: currentAlert.title,
        body: currentAlert.body,
      })
      useBroadcastStore.getState().sendTemplateContent({
        kind: "alert",
        templateId: currentAlert.templateId,
        slotValues: {
          icon: currentAlert.icon,
          title: currentAlert.title,
          body: currentAlert.body,
        },
      })
    }
  }, [currentAlert?.id])

  if (!currentAlert) return null

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-14 z-50 flex justify-center px-4"
    >
      <div
        className="pointer-events-auto flex max-w-lg items-center gap-3 rounded-lg border border-border bg-destructive/90 px-4 py-3 text-destructive-foreground shadow-lg backdrop-blur-sm"
        style={{
          transform: visible ? "translateY(0)" : "translateY(-100%)",
          opacity: visible ? 1 : 0,
          transition: "transform 300ms ease-out, opacity 300ms ease-out",
        }}
      >
        {currentAlert.icon && (
          <span className="text-xl shrink-0">{currentAlert.icon}</span>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold leading-tight">{currentAlert.title}</div>
          {currentAlert.body && (
            <div className="mt-0.5 text-xs opacity-90 leading-snug">{currentAlert.body}</div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          className="shrink-0 text-destructive-foreground hover:bg-destructive-foreground/20"
          onClick={dismissCurrent}
        >
          <XIcon className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}
