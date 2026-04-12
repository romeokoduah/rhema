import { create } from "zustand"
import type { Template, Backdrop, TemplateCategory } from "@/types/template"

interface TemplateState {
  templates: Template[]
  backdrops: Backdrop[]
  activeCategory: TemplateCategory
  activeTemplateIds: Record<TemplateCategory, number | null>
  setTemplates: (templates: Template[]) => void
  setBackdrops: (backdrops: Backdrop[]) => void
  setActiveCategory: (category: TemplateCategory) => void
  setActiveTemplateId: (category: TemplateCategory, id: number | null) => void
  getActiveTemplate: (category: TemplateCategory) => Template | null
}

export const useTemplateStore = create<TemplateState>((set, get) => ({
  templates: [],
  backdrops: [],
  activeCategory: "lower_third",
  activeTemplateIds: {
    lower_third: null,
    verse: null,
    lyrics: null,
    announcement: null,
    countdown: null,
    alert: null,
  },
  setTemplates: (templates) => set({ templates }),
  setBackdrops: (backdrops) => set({ backdrops }),
  setActiveCategory: (category) => set({ activeCategory: category }),
  setActiveTemplateId: (category, id) =>
    set((state) => ({
      activeTemplateIds: { ...state.activeTemplateIds, [category]: id },
    })),
  getActiveTemplate: (category) => {
    const state = get()
    const activeId = state.activeTemplateIds[category]
    const categoryTemplates = state.templates.filter((t) => t.category === category)
    if (activeId != null) {
      const found = categoryTemplates.find((t) => t.id === activeId)
      if (found) return found
    }
    return categoryTemplates.length > 0 ? categoryTemplates[0] : null
  },
}))
