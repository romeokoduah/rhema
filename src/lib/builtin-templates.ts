import type { NewTemplate, TemplateCategory } from "@/types/template"

function tpl(
  name: string,
  category: TemplateCategory,
  canvasJson: object,
  slots: { name: string; layer_id: string; type: "text" | "image" }[],
): NewTemplate {
  return {
    name,
    category,
    is_builtin: true,
    canvas_json: JSON.stringify(canvasJson),
    slots_json: JSON.stringify(slots),
    thumbnail_png: null,
  }
}

// ── Lower Thirds (5) ──────────────────────────────────────────────────────

const lowerThirdClassicBar = tpl("Classic Bar", "lower_third", {
  version: "6.0.0",
  objects: [
    { type: "Rect", id: "bg", left: 0, top: 820, width: 1920, height: 260, fill: "rgba(0,0,0,0.8)", selectable: false },
    { type: "Rect", id: "accent", left: 0, top: 820, width: 8, height: 260, fill: "#fbbf24", selectable: false },
    { type: "Textbox", id: "title", left: 40, top: 850, width: 900, text: "{{title}}", fontSize: 28, fontFamily: "Inter", fill: "#fbbf24", fontWeight: "bold", textAlign: "left" },
    { type: "Textbox", id: "body", left: 40, top: 900, width: 1840, text: "{{body}}", fontSize: 44, fontFamily: "Inter", fill: "#ffffff", fontWeight: "normal", textAlign: "left" },
  ],
}, [{ name: "title", layer_id: "title", type: "text" }, { name: "body", layer_id: "body", type: "text" }])

const lowerThirdModernGradient = tpl("Modern Gradient", "lower_third", {
  version: "6.0.0",
  objects: [
    { type: "Rect", id: "bg", left: 0, top: 800, width: 1920, height: 280, fill: { type: "linear", coords: { x1: 0, y1: 0, x2: 1920, y2: 0 }, colorStops: [{ offset: 0, color: "rgba(59,130,246,0.9)" }, { offset: 1, color: "rgba(147,51,234,0.9)" }] }, selectable: false },
    { type: "Textbox", id: "title", left: 80, top: 830, width: 800, text: "{{title}}", fontSize: 26, fontFamily: "Inter", fill: "#e0e7ff", fontWeight: "600", textAlign: "left" },
    { type: "Textbox", id: "body", left: 80, top: 880, width: 1760, text: "{{body}}", fontSize: 46, fontFamily: "Inter", fill: "#ffffff", fontWeight: "bold", textAlign: "left" },
  ],
}, [{ name: "title", layer_id: "title", type: "text" }, { name: "body", layer_id: "body", type: "text" }])

const lowerThirdMinimalLine = tpl("Minimal Line", "lower_third", {
  version: "6.0.0",
  objects: [
    { type: "Rect", id: "line", left: 80, top: 860, width: 200, height: 3, fill: "#ffffff", selectable: false },
    { type: "Rect", id: "bgOverlay", left: 0, top: 870, width: 1920, height: 210, fill: "rgba(0,0,0,0.5)", selectable: false },
    { type: "Textbox", id: "title", left: 80, top: 890, width: 600, text: "{{title}}", fontSize: 24, fontFamily: "Inter", fill: "#a3a3a3", fontWeight: "normal", letterSpacing: 3, textAlign: "left" },
    { type: "Textbox", id: "body", left: 80, top: 935, width: 1760, text: "{{body}}", fontSize: 38, fontFamily: "Inter", fill: "#ffffff", fontWeight: "300", textAlign: "left" },
  ],
}, [{ name: "title", layer_id: "title", type: "text" }, { name: "body", layer_id: "body", type: "text" }])

const lowerThirdFrostedGlass = tpl("Frosted Glass", "lower_third", {
  version: "6.0.0",
  objects: [
    { type: "Rect", id: "bg", left: 60, top: 830, width: 1800, height: 220, rx: 16, ry: 16, fill: "rgba(255,255,255,0.15)", stroke: "rgba(255,255,255,0.3)", strokeWidth: 1, selectable: false },
    { type: "Textbox", id: "title", left: 100, top: 860, width: 700, text: "{{title}}", fontSize: 24, fontFamily: "Inter", fill: "#93c5fd", fontWeight: "600", textAlign: "left" },
    { type: "Textbox", id: "body", left: 100, top: 910, width: 1720, text: "{{body}}", fontSize: 40, fontFamily: "Inter", fill: "#ffffff", fontWeight: "normal", textAlign: "left" },
  ],
}, [{ name: "title", layer_id: "title", type: "text" }, { name: "body", layer_id: "body", type: "text" }])

const lowerThirdBoldSplit = tpl("Bold Split", "lower_third", {
  version: "6.0.0",
  objects: [
    { type: "Rect", id: "leftPanel", left: 0, top: 830, width: 500, height: 250, fill: "#dc2626", selectable: false },
    { type: "Rect", id: "rightPanel", left: 500, top: 830, width: 1420, height: 250, fill: "rgba(0,0,0,0.85)", selectable: false },
    { type: "Textbox", id: "title", left: 40, top: 900, width: 420, text: "{{title}}", fontSize: 30, fontFamily: "Inter", fill: "#ffffff", fontWeight: "bold", textAlign: "center" },
    { type: "Textbox", id: "body", left: 540, top: 900, width: 1340, text: "{{body}}", fontSize: 40, fontFamily: "Inter", fill: "#ffffff", fontWeight: "normal", textAlign: "left" },
  ],
}, [{ name: "title", layer_id: "title", type: "text" }, { name: "body", layer_id: "body", type: "text" }])

// ── Full-Screen Verse (4) ─────────────────────────────────────────────────

const verseCenteredElegant = tpl("Centered Elegant", "verse", {
  version: "6.0.0",
  objects: [
    { type: "Rect", id: "bg", left: 0, top: 0, width: 1920, height: 1080, fill: { type: "linear", coords: { x1: 960, y1: 0, x2: 960, y2: 1080 }, colorStops: [{ offset: 0, color: "#1e1b4b" }, { offset: 1, color: "#0f172a" }] }, selectable: false },
    { type: "Rect", id: "ornament", left: 860, top: 280, width: 200, height: 2, fill: "#a78bfa", selectable: false },
    { type: "Textbox", id: "reference", left: 160, top: 300, width: 1600, text: "{{reference}}", fontSize: 30, fontFamily: "Inter", fill: "#a78bfa", fontWeight: "600", textAlign: "center" },
    { type: "Textbox", id: "verse_text", left: 160, top: 380, width: 1600, text: "{{verse_text}}", fontSize: 52, fontFamily: "Georgia", fill: "#ffffff", fontWeight: "normal", fontStyle: "italic", textAlign: "center", lineHeight: 1.5 },
  ],
}, [{ name: "reference", layer_id: "reference", type: "text" }, { name: "verse_text", layer_id: "verse_text", type: "text" }])

const verseLeftAlignedStudy = tpl("Left-Aligned Study", "verse", {
  version: "6.0.0",
  objects: [
    { type: "Rect", id: "bg", left: 0, top: 0, width: 1920, height: 1080, fill: "#0c0a09", selectable: false },
    { type: "Rect", id: "sidebar", left: 0, top: 0, width: 12, height: 1080, fill: "#f59e0b", selectable: false },
    { type: "Textbox", id: "reference", left: 80, top: 200, width: 800, text: "{{reference}}", fontSize: 28, fontFamily: "Inter", fill: "#f59e0b", fontWeight: "bold", textAlign: "left", letterSpacing: 2 },
    { type: "Textbox", id: "verse_text", left: 80, top: 280, width: 1400, text: "{{verse_text}}", fontSize: 48, fontFamily: "Inter", fill: "#fafaf9", fontWeight: "300", textAlign: "left", lineHeight: 1.6 },
  ],
}, [{ name: "reference", layer_id: "reference", type: "text" }, { name: "verse_text", layer_id: "verse_text", type: "text" }])

const verseSplitReference = tpl("Split Reference", "verse", {
  version: "6.0.0",
  objects: [
    { type: "Rect", id: "bg", left: 0, top: 0, width: 1920, height: 1080, fill: "#111827", selectable: false },
    { type: "Rect", id: "refPanel", left: 0, top: 0, width: 480, height: 1080, fill: { type: "linear", coords: { x1: 0, y1: 0, x2: 0, y2: 1080 }, colorStops: [{ offset: 0, color: "#7c3aed" }, { offset: 1, color: "#4f46e5" }] }, selectable: false },
    { type: "Textbox", id: "reference", left: 40, top: 440, width: 400, text: "{{reference}}", fontSize: 36, fontFamily: "Inter", fill: "#ffffff", fontWeight: "bold", textAlign: "center", lineHeight: 1.4 },
    { type: "Textbox", id: "verse_text", left: 560, top: 240, width: 1280, text: "{{verse_text}}", fontSize: 46, fontFamily: "Georgia", fill: "#e5e7eb", fontWeight: "normal", textAlign: "left", lineHeight: 1.6 },
  ],
}, [{ name: "reference", layer_id: "reference", type: "text" }, { name: "verse_text", layer_id: "verse_text", type: "text" }])

const verseOverlayBackdrop = tpl("Overlay on Backdrop", "verse", {
  version: "6.0.0",
  objects: [
    { type: "Rect", id: "bg", left: 0, top: 0, width: 1920, height: 1080, fill: { type: "linear", coords: { x1: 0, y1: 0, x2: 1920, y2: 1080 }, colorStops: [{ offset: 0, color: "#1a2a3a" }, { offset: 0.5, color: "#0d1b2a" }, { offset: 1, color: "#1b2838" }] }, selectable: false },
    { type: "Rect", id: "overlay", left: 120, top: 180, width: 1680, height: 720, rx: 12, ry: 12, fill: "rgba(0,0,0,0.6)", selectable: false },
    { type: "Textbox", id: "verse_text", left: 200, top: 280, width: 1520, text: "{{verse_text}}", fontSize: 50, fontFamily: "Georgia", fill: "#ffffff", fontWeight: "normal", fontStyle: "italic", textAlign: "center", lineHeight: 1.5 },
    { type: "Textbox", id: "reference", left: 200, top: 750, width: 1520, text: "{{reference}}", fontSize: 28, fontFamily: "Inter", fill: "#94a3b8", fontWeight: "600", textAlign: "right" },
  ],
}, [{ name: "reference", layer_id: "reference", type: "text" }, { name: "verse_text", layer_id: "verse_text", type: "text" }])

// ── Full-Screen Lyrics (4) ────────────────────────────────────────────────

const lyricsCenteredWorship = tpl("Centered Worship", "lyrics", {
  version: "6.0.0",
  objects: [
    { type: "Rect", id: "bg", left: 0, top: 0, width: 1920, height: 1080, fill: { type: "radial", coords: { x1: 960, y1: 540, x2: 960, y2: 540, r1: 0, r2: 960 }, colorStops: [{ offset: 0, color: "#1e293b" }, { offset: 1, color: "#020617" }] }, selectable: false },
    { type: "Textbox", id: "section_label", left: 160, top: 160, width: 1600, text: "{{section_label}}", fontSize: 22, fontFamily: "Inter", fill: "#60a5fa", fontWeight: "600", textAlign: "center", letterSpacing: 4 },
    { type: "Textbox", id: "lyrics", left: 160, top: 260, width: 1600, text: "{{lyrics}}", fontSize: 56, fontFamily: "Inter", fill: "#ffffff", fontWeight: "bold", textAlign: "center", lineHeight: 1.6 },
  ],
}, [{ name: "section_label", layer_id: "section_label", type: "text" }, { name: "lyrics", layer_id: "lyrics", type: "text" }])

const lyricsBottomAligned = tpl("Bottom Aligned", "lyrics", {
  version: "6.0.0",
  objects: [
    { type: "Rect", id: "bg", left: 0, top: 0, width: 1920, height: 1080, fill: "#000000", selectable: false },
    { type: "Rect", id: "gradientOverlay", left: 0, top: 540, width: 1920, height: 540, fill: { type: "linear", coords: { x1: 960, y1: 540, x2: 960, y2: 1080 }, colorStops: [{ offset: 0, color: "rgba(0,0,0,0)" }, { offset: 1, color: "rgba(0,0,0,0.9)" }] }, selectable: false },
    { type: "Textbox", id: "section_label", left: 80, top: 750, width: 400, text: "{{section_label}}", fontSize: 20, fontFamily: "Inter", fill: "#facc15", fontWeight: "600", textAlign: "left", letterSpacing: 2 },
    { type: "Textbox", id: "lyrics", left: 80, top: 800, width: 1760, text: "{{lyrics}}", fontSize: 50, fontFamily: "Inter", fill: "#ffffff", fontWeight: "normal", textAlign: "left", lineHeight: 1.5 },
  ],
}, [{ name: "section_label", layer_id: "section_label", type: "text" }, { name: "lyrics", layer_id: "lyrics", type: "text" }])

const lyricsTwoColumn = tpl("Two Column", "lyrics", {
  version: "6.0.0",
  objects: [
    { type: "Rect", id: "bg", left: 0, top: 0, width: 1920, height: 1080, fill: { type: "linear", coords: { x1: 0, y1: 0, x2: 0, y2: 1080 }, colorStops: [{ offset: 0, color: "#0f172a" }, { offset: 1, color: "#1e293b" }] }, selectable: false },
    { type: "Rect", id: "divider", left: 956, top: 100, width: 2, height: 880, fill: "rgba(255,255,255,0.15)", selectable: false },
    { type: "Textbox", id: "section_label", left: 80, top: 80, width: 1760, text: "{{section_label}}", fontSize: 22, fontFamily: "Inter", fill: "#818cf8", fontWeight: "600", textAlign: "center", letterSpacing: 3 },
    { type: "Textbox", id: "lyrics", left: 80, top: 160, width: 840, text: "{{lyrics}}", fontSize: 42, fontFamily: "Inter", fill: "#ffffff", fontWeight: "normal", textAlign: "left", lineHeight: 1.6 },
  ],
}, [{ name: "section_label", layer_id: "section_label", type: "text" }, { name: "lyrics", layer_id: "lyrics", type: "text" }])

const lyricsKaraokeHighlight = tpl("Karaoke Highlight", "lyrics", {
  version: "6.0.0",
  objects: [
    { type: "Rect", id: "bg", left: 0, top: 0, width: 1920, height: 1080, fill: "#000000", selectable: false },
    { type: "Rect", id: "accentBar", left: 0, top: 1040, width: 1920, height: 40, fill: { type: "linear", coords: { x1: 0, y1: 0, x2: 1920, y2: 0 }, colorStops: [{ offset: 0, color: "#ec4899" }, { offset: 1, color: "#8b5cf6" }] }, selectable: false },
    { type: "Textbox", id: "section_label", left: 160, top: 200, width: 1600, text: "{{section_label}}", fontSize: 24, fontFamily: "Inter", fill: "#f472b6", fontWeight: "bold", textAlign: "center" },
    { type: "Textbox", id: "lyrics", left: 120, top: 320, width: 1680, text: "{{lyrics}}", fontSize: 60, fontFamily: "Inter", fill: "#ffffff", fontWeight: "bold", textAlign: "center", lineHeight: 1.5 },
  ],
}, [{ name: "section_label", layer_id: "section_label", type: "text" }, { name: "lyrics", layer_id: "lyrics", type: "text" }])

// ── Announcements (4) ─────────────────────────────────────────────────────

const announcementCardImage = tpl("Card with Image", "announcement", {
  version: "6.0.0",
  objects: [
    { type: "Rect", id: "bg", left: 0, top: 0, width: 1920, height: 1080, fill: "#0f172a", selectable: false },
    { type: "Rect", id: "card", left: 360, top: 140, width: 1200, height: 800, rx: 20, ry: 20, fill: "#1e293b", stroke: "rgba(255,255,255,0.1)", strokeWidth: 1, selectable: false },
    { type: "Textbox", id: "title", left: 440, top: 200, width: 1040, text: "{{title}}", fontSize: 48, fontFamily: "Inter", fill: "#ffffff", fontWeight: "bold", textAlign: "center" },
    { type: "Rect", id: "divider", left: 810, top: 280, width: 300, height: 3, fill: "#3b82f6", selectable: false },
    { type: "Textbox", id: "body", left: 440, top: 320, width: 1040, text: "{{body}}", fontSize: 32, fontFamily: "Inter", fill: "#cbd5e1", fontWeight: "normal", textAlign: "center", lineHeight: 1.6 },
    { type: "Textbox", id: "date", left: 440, top: 760, width: 1040, text: "{{date}}", fontSize: 24, fontFamily: "Inter", fill: "#60a5fa", fontWeight: "600", textAlign: "center" },
  ],
}, [{ name: "title", layer_id: "title", type: "text" }, { name: "body", layer_id: "body", type: "text" }, { name: "date", layer_id: "date", type: "text" }])

const announcementSplitPanel = tpl("Split Panel", "announcement", {
  version: "6.0.0",
  objects: [
    { type: "Rect", id: "leftBg", left: 0, top: 0, width: 720, height: 1080, fill: { type: "linear", coords: { x1: 0, y1: 0, x2: 0, y2: 1080 }, colorStops: [{ offset: 0, color: "#7c3aed" }, { offset: 1, color: "#4f46e5" }] }, selectable: false },
    { type: "Rect", id: "rightBg", left: 720, top: 0, width: 1200, height: 1080, fill: "#ffffff", selectable: false },
    { type: "Textbox", id: "title", left: 60, top: 400, width: 600, text: "{{title}}", fontSize: 44, fontFamily: "Inter", fill: "#ffffff", fontWeight: "bold", textAlign: "center", lineHeight: 1.3 },
    { type: "Textbox", id: "body", left: 800, top: 280, width: 1000, text: "{{body}}", fontSize: 34, fontFamily: "Inter", fill: "#1e293b", fontWeight: "normal", textAlign: "left", lineHeight: 1.6 },
    { type: "Textbox", id: "date", left: 800, top: 700, width: 1000, text: "{{date}}", fontSize: 26, fontFamily: "Inter", fill: "#7c3aed", fontWeight: "600", textAlign: "left" },
  ],
}, [{ name: "title", layer_id: "title", type: "text" }, { name: "body", layer_id: "body", type: "text" }, { name: "date", layer_id: "date", type: "text" }])

const announcementMinimalText = tpl("Minimal Text", "announcement", {
  version: "6.0.0",
  objects: [
    { type: "Rect", id: "bg", left: 0, top: 0, width: 1920, height: 1080, fill: "#fafaf9", selectable: false },
    { type: "Rect", id: "accent", left: 160, top: 420, width: 60, height: 4, fill: "#0f172a", selectable: false },
    { type: "Textbox", id: "title", left: 160, top: 450, width: 1600, text: "{{title}}", fontSize: 64, fontFamily: "Inter", fill: "#0f172a", fontWeight: "bold", textAlign: "left" },
    { type: "Textbox", id: "body", left: 160, top: 560, width: 1200, text: "{{body}}", fontSize: 30, fontFamily: "Inter", fill: "#64748b", fontWeight: "normal", textAlign: "left", lineHeight: 1.7 },
  ],
}, [{ name: "title", layer_id: "title", type: "text" }, { name: "body", layer_id: "body", type: "text" }])

const announcementEventPoster = tpl("Event Poster", "announcement", {
  version: "6.0.0",
  objects: [
    { type: "Rect", id: "bg", left: 0, top: 0, width: 1920, height: 1080, fill: { type: "linear", coords: { x1: 0, y1: 0, x2: 1920, y2: 1080 }, colorStops: [{ offset: 0, color: "#be123c" }, { offset: 0.5, color: "#9f1239" }, { offset: 1, color: "#881337" }] }, selectable: false },
    { type: "Rect", id: "frame", left: 80, top: 80, width: 1760, height: 920, rx: 0, ry: 0, fill: "transparent", stroke: "rgba(255,255,255,0.4)", strokeWidth: 2, selectable: false },
    { type: "Textbox", id: "date", left: 160, top: 180, width: 1600, text: "{{date}}", fontSize: 24, fontFamily: "Inter", fill: "#fecdd3", fontWeight: "600", textAlign: "center", letterSpacing: 6 },
    { type: "Textbox", id: "title", left: 160, top: 340, width: 1600, text: "{{title}}", fontSize: 72, fontFamily: "Inter", fill: "#ffffff", fontWeight: "bold", textAlign: "center", lineHeight: 1.2 },
    { type: "Textbox", id: "body", left: 240, top: 560, width: 1440, text: "{{body}}", fontSize: 30, fontFamily: "Inter", fill: "#fecdd3", fontWeight: "normal", textAlign: "center", lineHeight: 1.6 },
  ],
}, [{ name: "title", layer_id: "title", type: "text" }, { name: "body", layer_id: "body", type: "text" }, { name: "date", layer_id: "date", type: "text" }])

// ── Countdown (4) ─────────────────────────────────────────────────────────

const countdownMinimalClock = tpl("Minimal Clock", "countdown", {
  version: "6.0.0",
  objects: [
    { type: "Rect", id: "bg", left: 0, top: 0, width: 1920, height: 1080, fill: "#000000", selectable: false },
    { type: "Textbox", id: "time", left: 160, top: 320, width: 1600, text: "{{time}}", fontSize: 180, fontFamily: "Inter", fill: "#ffffff", fontWeight: "200", textAlign: "center" },
    { type: "Textbox", id: "label", left: 160, top: 600, width: 1600, text: "{{label}}", fontSize: 28, fontFamily: "Inter", fill: "#64748b", fontWeight: "normal", textAlign: "center", letterSpacing: 6 },
  ],
}, [{ name: "time", layer_id: "time", type: "text" }, { name: "label", layer_id: "label", type: "text" }])

const countdownCircleProgress = tpl("Circle Progress", "countdown", {
  version: "6.0.0",
  objects: [
    { type: "Rect", id: "bg", left: 0, top: 0, width: 1920, height: 1080, fill: { type: "radial", coords: { x1: 960, y1: 540, x2: 960, y2: 540, r1: 0, r2: 800 }, colorStops: [{ offset: 0, color: "#1e293b" }, { offset: 1, color: "#020617" }] }, selectable: false },
    { type: "Circle", id: "ring", left: 660, top: 190, radius: 300, fill: "transparent", stroke: "rgba(255,255,255,0.1)", strokeWidth: 6, selectable: false },
    { type: "Circle", id: "ringAccent", left: 660, top: 190, radius: 300, fill: "transparent", stroke: "#3b82f6", strokeWidth: 6, selectable: false },
    { type: "Textbox", id: "time", left: 560, top: 400, width: 800, text: "{{time}}", fontSize: 120, fontFamily: "Inter", fill: "#ffffff", fontWeight: "bold", textAlign: "center" },
    { type: "Textbox", id: "label", left: 560, top: 580, width: 800, text: "{{label}}", fontSize: 26, fontFamily: "Inter", fill: "#94a3b8", fontWeight: "normal", textAlign: "center", letterSpacing: 4 },
  ],
}, [{ name: "time", layer_id: "time", type: "text" }, { name: "label", layer_id: "label", type: "text" }])

const countdownFullScreenDigits = tpl("Full-Screen Digits", "countdown", {
  version: "6.0.0",
  objects: [
    { type: "Rect", id: "bg", left: 0, top: 0, width: 1920, height: 1080, fill: { type: "linear", coords: { x1: 0, y1: 0, x2: 1920, y2: 1080 }, colorStops: [{ offset: 0, color: "#312e81" }, { offset: 1, color: "#0f172a" }] }, selectable: false },
    { type: "Textbox", id: "time", left: 0, top: 200, width: 1920, text: "{{time}}", fontSize: 280, fontFamily: "Inter", fill: "rgba(255,255,255,0.9)", fontWeight: "bold", textAlign: "center" },
    { type: "Textbox", id: "label", left: 160, top: 700, width: 1600, text: "{{label}}", fontSize: 36, fontFamily: "Inter", fill: "#a5b4fc", fontWeight: "600", textAlign: "center", letterSpacing: 8 },
  ],
}, [{ name: "time", layer_id: "time", type: "text" }, { name: "label", layer_id: "label", type: "text" }])

const countdownBackdropTimer = tpl("Backdrop Timer", "countdown", {
  version: "6.0.0",
  objects: [
    { type: "Rect", id: "bg", left: 0, top: 0, width: 1920, height: 1080, fill: { type: "linear", coords: { x1: 0, y1: 0, x2: 0, y2: 1080 }, colorStops: [{ offset: 0, color: "#064e3b" }, { offset: 1, color: "#022c22" }] }, selectable: false },
    { type: "Rect", id: "timerBox", left: 560, top: 300, width: 800, height: 400, rx: 16, ry: 16, fill: "rgba(0,0,0,0.5)", stroke: "#10b981", strokeWidth: 2, selectable: false },
    { type: "Textbox", id: "time", left: 560, top: 380, width: 800, text: "{{time}}", fontSize: 140, fontFamily: "Inter", fill: "#ecfdf5", fontWeight: "bold", textAlign: "center" },
    { type: "Textbox", id: "label", left: 560, top: 580, width: 800, text: "{{label}}", fontSize: 28, fontFamily: "Inter", fill: "#6ee7b7", fontWeight: "600", textAlign: "center" },
  ],
}, [{ name: "time", layer_id: "time", type: "text" }, { name: "label", layer_id: "label", type: "text" }])

// ── Alerts (4) ────────────────────────────────────────────────────────────

const alertTopSlideIn = tpl("Top Slide-In", "alert", {
  version: "6.0.0",
  objects: [
    { type: "Rect", id: "bar", left: 0, top: 0, width: 1920, height: 120, fill: { type: "linear", coords: { x1: 0, y1: 0, x2: 1920, y2: 0 }, colorStops: [{ offset: 0, color: "#dc2626" }, { offset: 1, color: "#b91c1c" }] }, selectable: false },
    { type: "Textbox", id: "icon", left: 40, top: 30, width: 80, text: "{{icon}}", fontSize: 48, fontFamily: "Inter", fill: "#ffffff", textAlign: "center" },
    { type: "Textbox", id: "title", left: 140, top: 20, width: 400, text: "{{title}}", fontSize: 24, fontFamily: "Inter", fill: "#fecaca", fontWeight: "bold", textAlign: "left" },
    { type: "Textbox", id: "body", left: 140, top: 58, width: 1700, text: "{{body}}", fontSize: 32, fontFamily: "Inter", fill: "#ffffff", fontWeight: "normal", textAlign: "left" },
  ],
}, [{ name: "icon", layer_id: "icon", type: "text" }, { name: "title", layer_id: "title", type: "text" }, { name: "body", layer_id: "body", type: "text" }])

const alertBottomSlideIn = tpl("Bottom Slide-In", "alert", {
  version: "6.0.0",
  objects: [
    { type: "Rect", id: "bar", left: 0, top: 960, width: 1920, height: 120, fill: "rgba(0,0,0,0.9)", selectable: false },
    { type: "Rect", id: "accentLine", left: 0, top: 960, width: 1920, height: 4, fill: "#f59e0b", selectable: false },
    { type: "Textbox", id: "icon", left: 60, top: 990, width: 80, text: "{{icon}}", fontSize: 44, fontFamily: "Inter", fill: "#f59e0b", textAlign: "center" },
    { type: "Textbox", id: "title", left: 160, top: 980, width: 500, text: "{{title}}", fontSize: 22, fontFamily: "Inter", fill: "#fbbf24", fontWeight: "bold", textAlign: "left" },
    { type: "Textbox", id: "body", left: 160, top: 1016, width: 1700, text: "{{body}}", fontSize: 30, fontFamily: "Inter", fill: "#ffffff", fontWeight: "normal", textAlign: "left" },
  ],
}, [{ name: "icon", layer_id: "icon", type: "text" }, { name: "title", layer_id: "title", type: "text" }, { name: "body", layer_id: "body", type: "text" }])

const alertFullWidthBar = tpl("Full-Width Bar", "alert", {
  version: "6.0.0",
  objects: [
    { type: "Rect", id: "bar", left: 0, top: 460, width: 1920, height: 160, fill: { type: "linear", coords: { x1: 0, y1: 0, x2: 1920, y2: 0 }, colorStops: [{ offset: 0, color: "rgba(59,130,246,0.95)" }, { offset: 1, color: "rgba(37,99,235,0.95)" }] }, selectable: false },
    { type: "Textbox", id: "icon", left: 80, top: 495, width: 80, text: "{{icon}}", fontSize: 52, fontFamily: "Inter", fill: "#ffffff", textAlign: "center" },
    { type: "Textbox", id: "title", left: 180, top: 480, width: 600, text: "{{title}}", fontSize: 22, fontFamily: "Inter", fill: "#bfdbfe", fontWeight: "bold", textAlign: "left" },
    { type: "Textbox", id: "body", left: 180, top: 518, width: 1660, text: "{{body}}", fontSize: 36, fontFamily: "Inter", fill: "#ffffff", fontWeight: "normal", textAlign: "left" },
  ],
}, [{ name: "icon", layer_id: "icon", type: "text" }, { name: "title", layer_id: "title", type: "text" }, { name: "body", layer_id: "body", type: "text" }])

const alertFloatingCard = tpl("Floating Card", "alert", {
  version: "6.0.0",
  objects: [
    { type: "Rect", id: "card", left: 1320, top: 60, width: 560, height: 200, rx: 16, ry: 16, fill: "rgba(15,23,42,0.95)", stroke: "rgba(255,255,255,0.15)", strokeWidth: 1, selectable: false },
    { type: "Rect", id: "cardAccent", left: 1320, top: 60, width: 560, height: 6, rx: 16, ry: 0, fill: "#10b981", selectable: false },
    { type: "Textbox", id: "icon", left: 1350, top: 90, width: 60, text: "{{icon}}", fontSize: 36, fontFamily: "Inter", fill: "#10b981", textAlign: "center" },
    { type: "Textbox", id: "title", left: 1430, top: 90, width: 420, text: "{{title}}", fontSize: 22, fontFamily: "Inter", fill: "#6ee7b7", fontWeight: "bold", textAlign: "left" },
    { type: "Textbox", id: "body", left: 1430, top: 126, width: 420, text: "{{body}}", fontSize: 28, fontFamily: "Inter", fill: "#ffffff", fontWeight: "normal", textAlign: "left", lineHeight: 1.4 },
  ],
}, [{ name: "icon", layer_id: "icon", type: "text" }, { name: "title", layer_id: "title", type: "text" }, { name: "body", layer_id: "body", type: "text" }])

// ── Export ─────────────────────────────────────────────────────────────────

export const BUILTIN_TEMPLATES: NewTemplate[] = [
  // Lower Thirds
  lowerThirdClassicBar,
  lowerThirdModernGradient,
  lowerThirdMinimalLine,
  lowerThirdFrostedGlass,
  lowerThirdBoldSplit,
  // Verse
  verseCenteredElegant,
  verseLeftAlignedStudy,
  verseSplitReference,
  verseOverlayBackdrop,
  // Lyrics
  lyricsCenteredWorship,
  lyricsBottomAligned,
  lyricsTwoColumn,
  lyricsKaraokeHighlight,
  // Announcements
  announcementCardImage,
  announcementSplitPanel,
  announcementMinimalText,
  announcementEventPoster,
  // Countdown
  countdownMinimalClock,
  countdownCircleProgress,
  countdownFullScreenDigits,
  countdownBackdropTimer,
  // Alerts
  alertTopSlideIn,
  alertBottomSlideIn,
  alertFullWidthBar,
  alertFloatingCard,
]
