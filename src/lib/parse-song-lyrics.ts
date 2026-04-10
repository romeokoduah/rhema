import type { SongSection, SongSectionKind } from "@/types/song"

const SECTION_HEADER_RE = /^\[\s*([a-zA-Z \-]+?)\s*(\d*)\s*\]$/

function kindFromLabel(label: string): SongSectionKind {
  const lower = label.toLowerCase()
  if (lower.startsWith("verse")) return "verse"
  if (lower.startsWith("pre-chorus") || lower.startsWith("pre chorus")) return "pre-chorus"
  if (lower.startsWith("chorus")) return "chorus"
  if (lower.startsWith("bridge")) return "bridge"
  if (lower.startsWith("intro")) return "intro"
  if (lower.startsWith("outro") || lower.startsWith("ending")) return "outro"
  if (lower.startsWith("tag")) return "tag"
  return "verse"
}

export function parseSongLyrics(raw: string): SongSection[] {
  const lines = raw.replace(/\r\n/g, "\n").split("\n")
  const sections: SongSection[] = []
  let current: SongSection | null = null
  let autoVerseCount = 0

  for (const rawLine of lines) {
    const line = rawLine.trimEnd()
    const match = line.trim().match(SECTION_HEADER_RE)
    if (match) {
      if (current && current.lines.length > 0) sections.push(current)
      const name = match[1].trim()
      const number = match[2]
      const label = number ? `${name} ${number}` : name
      current = { type: kindFromLabel(name), label, lines: [] }
      continue
    }
    if (!current) {
      autoVerseCount += 1
      current = { type: "verse", label: `Verse ${autoVerseCount}`, lines: [] }
    }
    if (line.trim().length === 0) {
      if (current.lines.length > 0) {
        sections.push(current)
        current = null
      }
      continue
    }
    current.lines.push(line)
  }
  if (current && current.lines.length > 0) sections.push(current)
  return sections
}
