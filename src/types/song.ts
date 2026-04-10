export type SongSectionKind = "verse" | "chorus" | "bridge" | "intro" | "outro" | "tag" | "pre-chorus"

export interface SongSection {
  type: SongSectionKind
  label: string
  lines: string[]
}

export interface Song {
  id: number
  title: string
  artist: string | null
  ccli_number: string | null
  sections: SongSection[]
  created_at: number
  updated_at: number
}

export interface NewSong {
  title: string
  artist: string | null
  ccli_number: string | null
  sections: SongSection[]
}
