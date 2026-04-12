import type { TemplateSlot } from "@/types/template"

export interface SlotValues { [slotName: string]: string }

export function fillTemplateSlots(canvasJson: string, slotsJson: string | null, values: SlotValues): string {
  if (!slotsJson) return canvasJson
  const slots: TemplateSlot[] = JSON.parse(slotsJson)
  const canvas = JSON.parse(canvasJson)
  if (!canvas.objects || !Array.isArray(canvas.objects)) return canvasJson
  for (const slot of slots) {
    if (!(slot.name in values)) continue
    const obj = canvas.objects.find((o: any) => o.id === slot.layer_id || o.name === slot.layer_id)
    if (obj && slot.type === "text") obj.text = values[slot.name]
  }
  return JSON.stringify(canvas)
}
