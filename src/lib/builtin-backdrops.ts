import type { NewBackdrop } from "@/types/template"

export const BUILTIN_BACKDROPS: NewBackdrop[] = [
  { name: "Deep Navy", type: "solid", data_json: '{"color":"#0f172a"}', thumbnail_png: null, is_builtin: true },
  { name: "Warm Black", type: "solid", data_json: '{"color":"#1c1917"}', thumbnail_png: null, is_builtin: true },
  { name: "Pure Black", type: "solid", data_json: '{"color":"#000000"}', thumbnail_png: null, is_builtin: true },
  { name: "Ocean Gradient", type: "gradient", data_json: '{"type":"linear","angle":135,"stops":[{"offset":0,"color":"#1e3a5f"},{"offset":1,"color":"#0f172a"}]}', thumbnail_png: null, is_builtin: true },
  { name: "Purple Haze", type: "gradient", data_json: '{"type":"linear","angle":135,"stops":[{"offset":0,"color":"#312e81"},{"offset":1,"color":"#1e1b4b"}]}', thumbnail_png: null, is_builtin: true },
  { name: "Sunset Warm", type: "gradient", data_json: '{"type":"linear","angle":180,"stops":[{"offset":0,"color":"#78350f"},{"offset":1,"color":"#1c1917"}]}', thumbnail_png: null, is_builtin: true },
  { name: "Forest", type: "gradient", data_json: '{"type":"linear","angle":135,"stops":[{"offset":0,"color":"#064e3b"},{"offset":1,"color":"#0f172a"}]}', thumbnail_png: null, is_builtin: true },
  { name: "Royal Blue", type: "gradient", data_json: '{"type":"radial","stops":[{"offset":0,"color":"#1e40af"},{"offset":1,"color":"#0f172a"}]}', thumbnail_png: null, is_builtin: true },
  { name: "Crimson", type: "gradient", data_json: '{"type":"linear","angle":135,"stops":[{"offset":0,"color":"#7f1d1d"},{"offset":1,"color":"#0f172a"}]}', thumbnail_png: null, is_builtin: true },
  { name: "Soft White", type: "solid", data_json: '{"color":"#f8fafc"}', thumbnail_png: null, is_builtin: true },
]
