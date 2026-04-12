export type TemplateCategory = "lower_third" | "verse" | "lyrics" | "announcement" | "countdown" | "alert"

export interface TemplateSlot {
  name: string
  layer_id: string
  type: "text" | "image"
}

export interface Template {
  id: number
  name: string
  category: TemplateCategory
  is_builtin: boolean
  canvas_json: string
  slots_json: string | null
  thumbnail_png: number[] | null
  created_at: number
  updated_at: number
}

export interface NewTemplate {
  name: string
  category: TemplateCategory
  is_builtin: boolean
  canvas_json: string
  slots_json: string | null
  thumbnail_png: number[] | null
}

export type BackdropType = "solid" | "gradient" | "image"

export interface Backdrop {
  id: number
  name: string
  type: BackdropType
  data_json: string
  thumbnail_png: number[] | null
  is_builtin: boolean
  created_at: number
  updated_at: number
}

export interface NewBackdrop {
  name: string
  type: BackdropType
  data_json: string
  thumbnail_png: number[] | null
  is_builtin: boolean
}

export const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  lower_third: "Lower Thirds",
  verse: "Scripture",
  lyrics: "Song Lyrics",
  announcement: "Announcements",
  countdown: "Countdown",
  alert: "Alerts",
}

export const CATEGORY_ICONS: Record<TemplateCategory, string> = {
  lower_third: "📋",
  verse: "📖",
  lyrics: "🎵",
  announcement: "📢",
  countdown: "⏱",
  alert: "🔔",
}
