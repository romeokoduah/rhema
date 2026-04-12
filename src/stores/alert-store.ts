import { create } from "zustand"

export interface AlertItem {
  id: string
  templateId: number | null
  title: string
  body: string
  icon: string
  timeoutSeconds: number
  createdAt: number
}

interface AlertState {
  queue: AlertItem[]
  currentAlert: AlertItem | null
  sendAlert: (alert: Omit<AlertItem, "id" | "createdAt">) => void
  dismissCurrent: () => void
  clearQueue: () => void
}

export const useAlertStore = create<AlertState>((set, get) => ({
  queue: [],
  currentAlert: null,
  sendAlert: (alert) => {
    const item: AlertItem = { ...alert, id: crypto.randomUUID(), createdAt: Date.now() }
    const state = get()
    if (!state.currentAlert) {
      set({ currentAlert: item })
      setTimeout(() => get().dismissCurrent(), item.timeoutSeconds * 1000)
    } else {
      set({ queue: [...state.queue, item] })
    }
  },
  dismissCurrent: () => {
    const state = get()
    const next = state.queue[0] ?? null
    set({ currentAlert: next, queue: state.queue.slice(1) })
    if (next) {
      setTimeout(() => get().dismissCurrent(), next.timeoutSeconds * 1000)
    }
  },
  clearQueue: () => set({ queue: [], currentAlert: null }),
}))
