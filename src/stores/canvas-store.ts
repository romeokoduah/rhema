import { create } from "zustand"
import type * as fabric from "fabric"

interface CanvasState {
  canvas: fabric.Canvas | null
  setCanvas: (canvas: fabric.Canvas | null) => void
}

export const useCanvasStore = create<CanvasState>((set) => ({
  canvas: null,
  setCanvas: (canvas) => set({ canvas }),
}))
