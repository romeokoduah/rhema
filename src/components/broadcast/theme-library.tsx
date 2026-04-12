import { useState, useMemo } from "react"
import { useBroadcastStore } from "@/stores"
import { CanvasVerse } from "@/components/ui/canvas-verse"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  PlusIcon,
  HeartIcon,
  MoreHorizontalIcon,
  SearchIcon,
  LockIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  type TemplateCategory,
} from "@/types/template"
import type { BroadcastTheme, VerseRenderData } from "@/types"

type FilterTab = "all" | TemplateCategory

const CATEGORIES: TemplateCategory[] = [
  "lower_third",
  "verse",
  "lyrics",
  "announcement",
  "countdown",
  "alert",
]

const THUMBNAIL_VERSE: VerseRenderData = {
  reference: "John 3:16 (KJV)",
  segments: [{ text: "Sample Verse" }],
}

function ThemeCard({
  theme,
  isActive,
  isEditing,
  onSelect,
}: {
  theme: BroadcastTheme
  isActive: boolean
  isEditing: boolean
  onSelect: () => void
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      className={cn(
        "group relative flex w-full flex-col gap-1.5 rounded-lg p-1.5 text-left transition-colors hover:bg-muted/50",
        isEditing && "ring-2 ring-primary"
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden rounded-lg">
        <CanvasVerse theme={theme} verse={THUMBNAIL_VERSE} className="w-full" />

        {/* Active badge */}
        {isActive && (
          <Badge className="absolute top-1.5 left-1.5 bg-emerald-600 text-[0.5rem] text-white hover:bg-emerald-600">
            Active
          </Badge>
        )}

        {/* Pin icon */}
        {theme.pinned && (
          <div className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-background/80">
            <HeartIcon className="size-3 text-primary" strokeWidth={2} />
          </div>
        )}

        {/* Lock icon for built-in */}
        {theme.builtin && (
          <div className="absolute right-1.5 bottom-1.5 flex size-5 items-center justify-center rounded-full bg-background/80">
            <LockIcon className="size-3 text-muted-foreground" strokeWidth={2} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex items-center gap-1.5 px-0.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-foreground">
            {theme.name}
          </p>
          {isActive && (
            <p className="text-[0.5rem] text-muted-foreground">Default</p>
          )}
        </div>

        {/* Tags */}
        <div className="flex shrink-0 items-center gap-1">
          {theme.builtin && (
            <Badge variant="outline" className="text-[0.5rem]">
              Built-in
            </Badge>
          )}
        </div>

        {/* More menu */}
        <Button
          variant="ghost"
          size="icon-xs"
          className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          <MoreHorizontalIcon className="size-3" />
        </Button>
      </div>
    </div>
  )
}

function CategoryNav({
  active,
  onSelect,
}: {
  active: FilterTab
  onSelect: (tab: FilterTab) => void
}) {
  return (
    <div className="flex flex-col gap-0.5 px-2 py-2">
      <button
        onClick={() => onSelect("all")}
        className={cn(
          "flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
          active === "all"
            ? "bg-primary/10 font-semibold text-primary"
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        )}
      >
        <span className="w-4 text-center text-sm">*</span>
        <span>All Categories</span>
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={cn(
            "flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
            active === cat
              ? "bg-primary/10 font-semibold text-primary"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          )}
        >
          <span className="w-4 text-center text-sm">{CATEGORY_ICONS[cat]}</span>
          <span>{CATEGORY_LABELS[cat]}</span>
        </button>
      ))}
    </div>
  )
}

export function ThemeLibrary() {
  const themes = useBroadcastStore((s) => s.themes)
  const activeThemeId = useBroadcastStore((s) => s.activeThemeId)
  const editingThemeId = useBroadcastStore((s) => s.editingThemeId)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<FilterTab>("all")

  const filteredThemes = useMemo(() => {
    let result = themes
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((t) => t.name.toLowerCase().includes(q))
    }
    // Category filtering is visual only — BroadcastTheme doesn't have category,
    // so we show all when a category is selected (categories apply to Template, not BroadcastTheme)
    return result
  }, [themes, search])

  const builtinThemes = filteredThemes.filter((t) => t.builtin)
  const customThemes = filteredThemes.filter((t) => !t.builtin)

  const handleNewTheme = () => {
    const firstTheme = themes[0]
    if (firstTheme) {
      useBroadcastStore.getState().duplicateTheme(firstTheme.id)
    }
  }

  return (
    <div className="flex h-full flex-col border-r border-border bg-card">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-border px-3">
        <span className="text-lg font-semibold text-foreground">Themes</span>
      </div>

      {/* Search */}
      <div className="px-3 pt-3 pb-2">
        <div className="relative">
          <SearchIcon className="absolute top-1/2 left-2 size-3 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search themes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-7"
          />
        </div>
      </div>

      {/* Category sidebar nav */}
      <div className="border-b border-border">
        <CategoryNav active={filter} onSelect={setFilter} />
      </div>

      {/* Theme list */}
      <ScrollArea className="min-h-0 flex-1">
        <div className="grid grid-cols-1 gap-1 px-2 pb-4">
          {/* Built-in section */}
          {builtinThemes.length > 0 && (
            <>
              <p className="px-1.5 pt-2 pb-1 text-[0.625rem] font-semibold tracking-widest text-muted-foreground uppercase">
                Built-in
              </p>
              {builtinThemes.map((theme) => (
                <ThemeCard
                  key={theme.id}
                  theme={theme}
                  isActive={theme.id === activeThemeId}
                  isEditing={theme.id === editingThemeId}
                  onSelect={() =>
                    useBroadcastStore.getState().startEditing(theme.id)
                  }
                />
              ))}
            </>
          )}

          {/* Custom section */}
          {customThemes.length > 0 && (
            <>
              <p className="px-1.5 pt-3 pb-1 text-[0.625rem] font-semibold tracking-widest text-muted-foreground uppercase">
                Custom
              </p>
              {customThemes.map((theme) => (
                <ThemeCard
                  key={theme.id}
                  theme={theme}
                  isActive={theme.id === activeThemeId}
                  isEditing={theme.id === editingThemeId}
                  onSelect={() =>
                    useBroadcastStore.getState().startEditing(theme.id)
                  }
                />
              ))}
            </>
          )}

          {filteredThemes.length === 0 && (
            <p className="p-4 text-center text-xs text-muted-foreground">
              No themes found
            </p>
          )}
        </div>
      </ScrollArea>

      {/* New Template button at bottom */}
      <div className="border-t border-border p-3">
        <Button onClick={handleNewTheme} className="w-full">
          <PlusIcon className="size-4" />
          New Template
        </Button>
      </div>
    </div>
  )
}
