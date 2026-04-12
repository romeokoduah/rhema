import { useState, useEffect, useCallback, useRef } from "react"
import * as fabric from "fabric"
import { DragDropProvider } from "@dnd-kit/react"
import { useSortable } from "@dnd-kit/react/sortable"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  TypeIcon,
  SquareIcon,
  ImageIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  UnlockIcon,
  TrashIcon,
  GripVerticalIcon,
  LayersIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface LayerItem {
  id: string
  name: string
  type: "text" | "rect" | "circle" | "image" | "other"
  visible: boolean
  locked: boolean
  fabricObject: fabric.FabricObject
}

function getObjectType(obj: fabric.FabricObject): LayerItem["type"] {
  if (obj instanceof fabric.Textbox || obj instanceof fabric.FabricText || obj instanceof fabric.IText) return "text"
  if (obj instanceof fabric.Rect) return "rect"
  if (obj instanceof fabric.Circle) return "circle"
  if (obj instanceof fabric.FabricImage) return "image"
  return "other"
}

function getObjectName(obj: fabric.FabricObject, index: number): string {
  const custom = (obj as fabric.FabricObject & { name?: string }).name
  if (custom) return custom

  const type = getObjectType(obj)
  switch (type) {
    case "text": {
      const textObj = obj as fabric.Textbox
      const preview = textObj.text?.slice(0, 20) ?? ""
      return preview ? `"${preview}"` : `Text ${index + 1}`
    }
    case "rect":
      return `Rectangle ${index + 1}`
    case "circle":
      return `Circle ${index + 1}`
    case "image":
      return `Image ${index + 1}`
    default:
      return `Object ${index + 1}`
  }
}

function getTypeIcon(type: LayerItem["type"]) {
  switch (type) {
    case "text":
      return <TypeIcon className="size-3.5" />
    case "rect":
      return <SquareIcon className="size-3.5" />
    case "circle":
      return <SquareIcon className="size-3.5 rounded-full" />
    case "image":
      return <ImageIcon className="size-3.5" />
    default:
      return <SquareIcon className="size-3.5" />
  }
}

function LayerRow({
  layer,
  index,
  isSelected,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onDelete,
}: {
  layer: LayerItem
  index: number
  isSelected: boolean
  onSelect: () => void
  onToggleVisibility: () => void
  onToggleLock: () => void
  onDelete: () => void
}) {
  const { ref, isDragging } = useSortable({
    id: layer.id,
    index,
  })

  return (
    <div
      ref={ref}
      onClick={onSelect}
      className={cn(
        "group flex items-center gap-1 rounded-md px-1.5 py-1 text-xs transition-colors",
        isSelected
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted/50",
        isDragging && "opacity-50"
      )}
    >
      <GripVerticalIcon className="size-3 shrink-0 cursor-grab text-muted-foreground/50" />
      <span className="shrink-0">{getTypeIcon(layer.type)}</span>
      <span className="min-w-0 flex-1 truncate text-xs">{layer.name}</span>

      <Button
        variant="ghost"
        size="icon-xs"
        className="size-5 shrink-0 opacity-0 group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation()
          onToggleLock()
        }}
      >
        {layer.locked ? (
          <LockIcon className="size-2.5" />
        ) : (
          <UnlockIcon className="size-2.5" />
        )}
      </Button>

      <Button
        variant="ghost"
        size="icon-xs"
        className="size-5 shrink-0 opacity-0 group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation()
          onToggleVisibility()
        }}
      >
        {layer.visible ? (
          <EyeIcon className="size-2.5" />
        ) : (
          <EyeOffIcon className="size-2.5" />
        )}
      </Button>

      <Button
        variant="ghost"
        size="icon-xs"
        className="size-5 shrink-0 text-destructive opacity-0 group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
      >
        <TrashIcon className="size-2.5" />
      </Button>
    </div>
  )
}

interface LayerPanelProps {
  canvas: fabric.Canvas | null
}

export function LayerPanel({ canvas }: LayerPanelProps) {
  const [layers, setLayers] = useState<LayerItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const layerIdMapRef = useRef<WeakMap<fabric.FabricObject, string>>(new WeakMap())

  const getOrCreateId = useCallback((obj: fabric.FabricObject): string => {
    let id = layerIdMapRef.current.get(obj)
    if (!id) {
      id = (obj as fabric.FabricObject & { id?: string }).id ?? crypto.randomUUID()
      layerIdMapRef.current.set(obj, id)
    }
    return id
  }, [])

  const syncLayers = useCallback(() => {
    if (!canvas) {
      setLayers([])
      return
    }

    const objects = canvas.getObjects()
    // Reverse so top-most layer is first
    const items: LayerItem[] = [...objects].reverse().map((obj, idx) => ({
      id: getOrCreateId(obj),
      name: getObjectName(obj, objects.length - 1 - idx),
      type: getObjectType(obj),
      visible: obj.visible !== false,
      locked: obj.selectable === false,
      fabricObject: obj,
    }))

    setLayers(items)

    // Sync selection
    const active = canvas.getActiveObject()
    if (active) {
      setSelectedId(getOrCreateId(active))
    } else {
      setSelectedId(null)
    }
  }, [canvas, getOrCreateId])

  useEffect(() => {
    if (!canvas) return

    syncLayers()

    const events = [
      "object:added",
      "object:removed",
      "object:modified",
      "selection:created",
      "selection:updated",
      "selection:cleared",
    ] as const

    const handler = () => syncLayers()

    for (const event of events) {
      canvas.on(event, handler)
    }

    return () => {
      for (const event of events) {
        canvas.off(event, handler)
      }
    }
  }, [canvas, syncLayers])

  const handleSelect = useCallback(
    (layer: LayerItem) => {
      if (!canvas) return
      canvas.setActiveObject(layer.fabricObject)
      canvas.requestRenderAll()
      setSelectedId(layer.id)
    },
    [canvas]
  )

  const handleToggleVisibility = useCallback(
    (layer: LayerItem) => {
      if (!canvas) return
      layer.fabricObject.set("visible", !layer.fabricObject.visible)
      canvas.requestRenderAll()
      syncLayers()
    },
    [canvas, syncLayers]
  )

  const handleToggleLock = useCallback(
    (layer: LayerItem) => {
      if (!canvas) return
      const isLocked = layer.fabricObject.selectable === false
      layer.fabricObject.set({
        selectable: isLocked,
        evented: isLocked,
      })
      canvas.requestRenderAll()
      syncLayers()
    },
    [canvas, syncLayers]
  )

  const handleDelete = useCallback(
    (layer: LayerItem) => {
      if (!canvas) return
      canvas.remove(layer.fabricObject)
      canvas.requestRenderAll()
    },
    [canvas]
  )

  const handleDragEnd = useCallback(
    (event: { operation: { source?: { id: unknown } | null; target?: { id: unknown } | null } | null }) => {
      if (!canvas || !event.operation) return

      const { source, target } = event.operation
      if (!source || !target || source.id === target.id) return

      const sourceIdx = layers.findIndex((l) => l.id === source.id)
      const targetIdx = layers.findIndex((l) => l.id === target.id)
      if (sourceIdx === -1 || targetIdx === -1) return

      // layers array is reversed from canvas order
      // so we need to convert indices
      const objects = canvas.getObjects()
      const sourceCanvasIdx = objects.indexOf(layers[sourceIdx].fabricObject)
      const targetCanvasIdx = objects.indexOf(layers[targetIdx].fabricObject)

      if (sourceCanvasIdx === -1 || targetCanvasIdx === -1) return

      // Move the object to the target position
      const obj = layers[sourceIdx].fabricObject
      canvas.remove(obj)
      const insertIdx = targetCanvasIdx > sourceCanvasIdx ? targetCanvasIdx : targetCanvasIdx
      canvas.insertAt(insertIdx, obj)
      canvas.requestRenderAll()
      syncLayers()
    },
    [canvas, layers, syncLayers]
  )

  return (
    <div className="flex flex-col border-t border-border">
      <div className="flex items-center gap-1.5 px-4 py-2">
        <LayersIcon className="size-3.5 text-muted-foreground" />
        <h4 className="text-xs font-semibold">Layers</h4>
        <span className="text-[0.625rem] text-muted-foreground">({layers.length})</span>
      </div>

      <ScrollArea className="max-h-48">
        <DragDropProvider onDragEnd={handleDragEnd}>
          <div className="flex flex-col gap-0.5 px-2 pb-2">
            {layers.length === 0 ? (
              <p className="px-2 py-3 text-center text-xs text-muted-foreground">
                No layers
              </p>
            ) : (
              layers.map((layer, index) => (
                <LayerRow
                  key={layer.id}
                  layer={layer}
                  index={index}
                  isSelected={layer.id === selectedId}
                  onSelect={() => handleSelect(layer)}
                  onToggleVisibility={() => handleToggleVisibility(layer)}
                  onToggleLock={() => handleToggleLock(layer)}
                  onDelete={() => handleDelete(layer)}
                />
              ))
            )}
          </div>
        </DragDropProvider>
      </ScrollArea>
    </div>
  )
}
