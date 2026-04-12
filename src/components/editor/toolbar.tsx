import { useCallback, useEffect, useRef, useState } from "react"
import * as fabric from "fabric"
import { useCanvasStore } from "@/stores/canvas-store"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  TypeIcon,
  SquareIcon,
  CircleIcon,
  ImageIcon,
  AlignLeftIcon,
  AlignCenterHorizontalIcon,
  AlignCenterVerticalIcon,
  AlignRightIcon,
  AlignStartVerticalIcon,
  AlignEndVerticalIcon,
  CopyIcon,
  TrashIcon,
  Undo2Icon,
  Redo2Icon,
  ChevronDownIcon,
  ShapesIcon,
} from "lucide-react"

const WS_WIDTH = 1920
const WS_HEIGHT = 1080
const MAX_HISTORY = 50

export function EditorToolbar() {
  const canvas = useCanvasStore((s) => s.canvas)
  const historyRef = useRef<string[]>([])
  const redoStackRef = useRef<string[]>([])
  const isRestoringRef = useRef(false)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  // --- History management ---
  const pushHistory = useCallback(() => {
    if (!canvas || isRestoringRef.current) return
    const json = JSON.stringify(canvas.toJSON())
    historyRef.current.push(json)
    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current.shift()
    }
    redoStackRef.current = []
    setCanUndo(historyRef.current.length > 1)
    setCanRedo(false)
  }, [canvas])

  useEffect(() => {
    if (!canvas) return

    // Save initial state
    const initialJson = JSON.stringify(canvas.toJSON())
    historyRef.current = [initialJson]
    redoStackRef.current = []
    setCanUndo(false)
    setCanRedo(false)

    const handler = () => pushHistory()
    canvas.on("object:added", handler)
    canvas.on("object:removed", handler)
    canvas.on("object:modified", handler)

    return () => {
      canvas.off("object:added", handler)
      canvas.off("object:removed", handler)
      canvas.off("object:modified", handler)
    }
  }, [canvas, pushHistory])

  const handleUndo = useCallback(() => {
    if (!canvas || historyRef.current.length <= 1) return
    isRestoringRef.current = true
    const current = historyRef.current.pop()!
    redoStackRef.current.push(current)
    const prev = historyRef.current[historyRef.current.length - 1]
    canvas.loadFromJSON(prev).then(() => {
      canvas.requestRenderAll()
      isRestoringRef.current = false
      setCanUndo(historyRef.current.length > 1)
      setCanRedo(redoStackRef.current.length > 0)
    })
  }, [canvas])

  const handleRedo = useCallback(() => {
    if (!canvas || redoStackRef.current.length === 0) return
    isRestoringRef.current = true
    const next = redoStackRef.current.pop()!
    historyRef.current.push(next)
    canvas.loadFromJSON(next).then(() => {
      canvas.requestRenderAll()
      isRestoringRef.current = false
      setCanUndo(historyRef.current.length > 1)
      setCanRedo(redoStackRef.current.length > 0)
    })
  }, [canvas])

  // --- Add objects ---
  const handleAddText = useCallback(() => {
    if (!canvas) return
    const obj = new fabric.Textbox("New Text", {
      left: 960,
      top: 540,
      width: 400,
      fontSize: 48,
      fontFamily: "Inter Variable",
      fill: "#ffffff",
      originX: "center",
      originY: "center",
    })
    // Attach a unique id
    ;(obj as fabric.FabricObject & { id: string }).id = crypto.randomUUID()
    canvas.add(obj)
    canvas.setActiveObject(obj)
    canvas.requestRenderAll()
  }, [canvas])

  const handleAddRect = useCallback(() => {
    if (!canvas) return
    const obj = new fabric.Rect({
      left: 960,
      top: 540,
      width: 300,
      height: 200,
      fill: "#ffffff33",
      stroke: "#ffffff",
      strokeWidth: 2,
      originX: "center",
      originY: "center",
    })
    ;(obj as fabric.FabricObject & { id: string }).id = crypto.randomUUID()
    canvas.add(obj)
    canvas.setActiveObject(obj)
    canvas.requestRenderAll()
  }, [canvas])

  const handleAddCircle = useCallback(() => {
    if (!canvas) return
    const obj = new fabric.Circle({
      left: 960,
      top: 540,
      radius: 100,
      fill: "#ffffff33",
      stroke: "#ffffff",
      strokeWidth: 2,
      originX: "center",
      originY: "center",
    })
    ;(obj as fabric.FabricObject & { id: string }).id = crypto.randomUUID()
    canvas.add(obj)
    canvas.setActiveObject(obj)
    canvas.requestRenderAll()
  }, [canvas])

  const handleAddImage = useCallback(() => {
    if (!canvas) return
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        fabric.FabricImage.fromURL(dataUrl).then((img) => {
          img.set({
            left: 960,
            top: 540,
            originX: "center",
            originY: "center",
          })
          // Scale down if too large
          const maxDim = Math.max(img.width ?? 1, img.height ?? 1)
          if (maxDim > 600) {
            img.scale(600 / maxDim)
          }
          ;(img as fabric.FabricObject & { id: string }).id = crypto.randomUUID()
          canvas.add(img)
          canvas.setActiveObject(img)
          canvas.requestRenderAll()
        })
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }, [canvas])

  // --- Alignment ---
  const alignActive = useCallback(
    (prop: "left" | "top", value: number) => {
      if (!canvas) return
      const obj = canvas.getActiveObject()
      if (!obj) return
      obj.set(prop, value)
      obj.setCoords()
      canvas.requestRenderAll()
    },
    [canvas]
  )

  const handleAlignLeft = useCallback(() => alignActive("left", 0), [alignActive])
  const handleAlignCenterH = useCallback(() => {
    if (!canvas) return
    const obj = canvas.getActiveObject()
    if (!obj) return
    obj.set("left", WS_WIDTH / 2 - (obj.getScaledWidth() / 2))
    obj.setCoords()
    canvas.requestRenderAll()
  }, [canvas])
  const handleAlignRight = useCallback(() => {
    if (!canvas) return
    const obj = canvas.getActiveObject()
    if (!obj) return
    obj.set("left", WS_WIDTH - obj.getScaledWidth())
    obj.setCoords()
    canvas.requestRenderAll()
  }, [canvas])
  const handleAlignTop = useCallback(() => alignActive("top", 0), [alignActive])
  const handleAlignMiddle = useCallback(() => {
    if (!canvas) return
    const obj = canvas.getActiveObject()
    if (!obj) return
    obj.set("top", WS_HEIGHT / 2 - (obj.getScaledHeight() / 2))
    obj.setCoords()
    canvas.requestRenderAll()
  }, [canvas])
  const handleAlignBottom = useCallback(() => {
    if (!canvas) return
    const obj = canvas.getActiveObject()
    if (!obj) return
    obj.set("top", WS_HEIGHT - obj.getScaledHeight())
    obj.setCoords()
    canvas.requestRenderAll()
  }, [canvas])

  // --- Duplicate & Delete ---
  const handleDuplicate = useCallback(() => {
    if (!canvas) return
    const obj = canvas.getActiveObject()
    if (!obj) return
    obj.clone().then((cloned: fabric.FabricObject) => {
      cloned.set({
        left: (obj.left ?? 0) + 20,
        top: (obj.top ?? 0) + 20,
      })
      ;(cloned as fabric.FabricObject & { id: string }).id = crypto.randomUUID()
      canvas.add(cloned)
      canvas.setActiveObject(cloned)
      canvas.requestRenderAll()
    })
  }, [canvas])

  const handleDelete = useCallback(() => {
    if (!canvas) return
    const obj = canvas.getActiveObject()
    if (!obj) return
    canvas.remove(obj)
    canvas.discardActiveObject()
    canvas.requestRenderAll()
  }, [canvas])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!canvas) return
      const isMeta = e.metaKey || e.ctrlKey
      if (isMeta && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        handleUndo()
      } else if (isMeta && e.key === "z" && e.shiftKey) {
        e.preventDefault()
        handleRedo()
      } else if (e.key === "Delete" || e.key === "Backspace") {
        // Only delete if not editing text
        const active = canvas.getActiveObject()
        if (active && !(active instanceof fabric.IText && (active as fabric.IText).isEditing)) {
          e.preventDefault()
          handleDelete()
        }
      } else if (isMeta && e.key === "d") {
        e.preventDefault()
        handleDuplicate()
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [canvas, handleUndo, handleRedo, handleDelete, handleDuplicate])

  return (
    <div className="flex h-10 shrink-0 items-center gap-1 border-b border-border/40 px-2" style={{ background: "#1e1e22" }}>
      {/* Add objects */}
      <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground" onClick={handleAddText}>
        <TypeIcon className="size-3.5" />
        Text
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground">
            <ShapesIcon className="size-3.5" />
            Shape
            <ChevronDownIcon className="size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={handleAddRect}>
            <SquareIcon className="size-3.5" />
            Rectangle
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleAddCircle}>
            <CircleIcon className="size-3.5" />
            Circle
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground" onClick={handleAddImage}>
        <ImageIcon className="size-3.5" />
        Image
      </Button>

      <Separator orientation="vertical" className="mx-1 h-5" />

      {/* Alignment */}
      <Button variant="ghost" size="icon-xs" className="text-muted-foreground hover:text-foreground" onClick={handleAlignLeft} title="Align Left">
        <AlignLeftIcon className="size-3.5" />
      </Button>
      <Button variant="ghost" size="icon-xs" className="text-muted-foreground hover:text-foreground" onClick={handleAlignCenterH} title="Align Center Horizontal">
        <AlignCenterHorizontalIcon className="size-3.5" />
      </Button>
      <Button variant="ghost" size="icon-xs" className="text-muted-foreground hover:text-foreground" onClick={handleAlignRight} title="Align Right">
        <AlignRightIcon className="size-3.5" />
      </Button>
      <Button variant="ghost" size="icon-xs" className="text-muted-foreground hover:text-foreground" onClick={handleAlignTop} title="Align Top">
        <AlignStartVerticalIcon className="size-3.5" />
      </Button>
      <Button variant="ghost" size="icon-xs" className="text-muted-foreground hover:text-foreground" onClick={handleAlignMiddle} title="Align Middle">
        <AlignCenterVerticalIcon className="size-3.5" />
      </Button>
      <Button variant="ghost" size="icon-xs" className="text-muted-foreground hover:text-foreground" onClick={handleAlignBottom} title="Align Bottom">
        <AlignEndVerticalIcon className="size-3.5" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-5" />

      {/* Duplicate & Delete */}
      <Button variant="ghost" size="icon-xs" className="text-muted-foreground hover:text-foreground" onClick={handleDuplicate} title="Duplicate (Cmd+D)">
        <CopyIcon className="size-3.5" />
      </Button>
      <Button variant="ghost" size="icon-xs" className="text-muted-foreground hover:text-foreground" onClick={handleDelete} title="Delete">
        <TrashIcon className="size-3.5" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-5" />

      {/* Undo / Redo */}
      <Button
        variant="ghost"
        size="icon-xs"
        className="text-muted-foreground hover:text-foreground"
        onClick={handleUndo}
        disabled={!canUndo}
        title="Undo (Cmd+Z)"
      >
        <Undo2Icon className="size-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon-xs"
        className="text-muted-foreground hover:text-foreground"
        onClick={handleRedo}
        disabled={!canRedo}
        title="Redo (Cmd+Shift+Z)"
      >
        <Redo2Icon className="size-3.5" />
      </Button>
    </div>
  )
}
