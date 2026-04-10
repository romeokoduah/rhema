import { describe, it, expect } from "vitest"
import { parseSongLyrics } from "./parse-song-lyrics"

describe("parseSongLyrics", () => {
  it("parses [Verse 1] and [Chorus] markers", () => {
    const raw = `[Verse 1]\nAmazing grace\nHow sweet the sound\n\n[Chorus]\nI once was lost\nBut now am found`
    const sections = parseSongLyrics(raw)
    expect(sections).toHaveLength(2)
    expect(sections[0].type).toBe("verse")
    expect(sections[0].label).toBe("Verse 1")
    expect(sections[0].lines).toEqual(["Amazing grace", "How sweet the sound"])
    expect(sections[1].type).toBe("chorus")
    expect(sections[1].lines).toEqual(["I once was lost", "But now am found"])
  })

  it("treats leading lines without a header as Verse 1", () => {
    const sections = parseSongLyrics("Line one\nLine two")
    expect(sections).toHaveLength(1)
    expect(sections[0].label).toBe("Verse 1")
    expect(sections[0].lines).toEqual(["Line one", "Line two"])
  })

  it("trims trailing whitespace and preserves line order", () => {
    const sections = parseSongLyrics("[Verse 1]\n  Line a  \n  Line b  \n")
    expect(sections).toHaveLength(1)
    expect(sections[0].lines[0]).toMatch(/Line a/)
    expect(sections[0].lines[1]).toMatch(/Line b/)
  })
})
