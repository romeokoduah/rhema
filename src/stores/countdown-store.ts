import { create } from "zustand"

interface CountdownState {
  targetTime: number | null
  remainingSeconds: number
  isRunning: boolean
  templateId: number | null
  label: string
  start: (durationSeconds: number, label?: string) => void
  pause: () => void
  resume: () => void
  reset: () => void
  tick: () => void
  setTemplateId: (id: number | null) => void
}

export const useCountdownStore = create<CountdownState>((set, get) => ({
  targetTime: null,
  remainingSeconds: 0,
  isRunning: false,
  templateId: null,
  label: "Service begins in",
  start: (durationSeconds, label) => {
    const target = Date.now() + durationSeconds * 1000
    set({
      targetTime: target,
      remainingSeconds: durationSeconds,
      isRunning: true,
      label: label ?? "Service begins in",
    })
  },
  pause: () => {
    const state = get()
    if (!state.isRunning || !state.targetTime) return
    // Store remaining time so we can resume later
    const remaining = Math.max(0, Math.floor((state.targetTime - Date.now()) / 1000))
    set({ isRunning: false, remainingSeconds: remaining })
  },
  resume: () => {
    const state = get()
    if (state.isRunning || state.remainingSeconds <= 0) return
    const target = Date.now() + state.remainingSeconds * 1000
    set({ isRunning: true, targetTime: target })
  },
  reset: () => set({ targetTime: null, remainingSeconds: 0, isRunning: false }),
  tick: () => {
    const state = get()
    if (!state.isRunning || !state.targetTime) return
    const remaining = Math.max(0, Math.floor((state.targetTime - Date.now()) / 1000))
    set({ remainingSeconds: remaining })
    if (remaining <= 0) set({ isRunning: false })
  },
  setTemplateId: (id) => set({ templateId: id }),
}))
