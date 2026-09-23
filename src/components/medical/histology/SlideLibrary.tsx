import * as React from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { groupByChapter, slideMatches, SLIDES } from './slides'
import type { HistologySlide } from './types'

interface SlideLibraryProps {
  activeId: string
  onSelect: (slide: HistologySlide) => void
  className?: string
}

/**
 * Browsable library of every supplied micrograph, grouped by chapter with a
 * live text filter over titles, captions, structure labels and slide text.
 * Purely data-driven: new images appear automatically once the extraction tool
 * regenerates `histologySlides.json`.
 */
export function SlideLibrary({ activeId, onSelect, className }: SlideLibraryProps) {
  const [query, setQuery] = React.useState('')
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({})

  const groups = React.useMemo(() => groupByChapter(SLIDES), [])
  const filtered = React.useMemo(() => SLIDES.filter((s) => slideMatches(s, query)), [query])
  const searching = query.trim().length > 0

  return (
    <div className={cn('flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-surface', className)}>
      <div className="border-b border-border p-2.5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une structure, un terme…"
            className="w-full rounded-lg border border-border bg-background py-1.5 pl-8 pr-7 text-xs text-foreground placeholder:text-faint focus:border-primary/50 focus:outline-none"
          />
          {searching && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-faint hover:text-foreground cursor-pointer"
              aria-label="Effacer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="mt-1.5 px-0.5 font-mono text-[10px] uppercase tracking-wider text-faint">
          {searching ? `${filtered.length} résultat(s)` : `${SLIDES.length} lames`}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {searching
          ? filtered.map((s) => <SlideRow key={s.id} slide={s} active={s.id === activeId} onSelect={onSelect} />)
          : groups.map((g) => {
              const isCollapsed = collapsed[g.chapterId]
              return (
                <div key={g.chapterId} className="mb-2">
                  <button
                    type="button"
                    onClick={() => setCollapsed((c) => ({ ...c, [g.chapterId]: !c[g.chapterId] }))}
                    className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-elevated cursor-pointer"
                  >
                    <span className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                      {g.chapterTitle}
                    </span>
                    <span className="shrink-0 rounded-full bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-faint">
                      {g.slides.length}
                    </span>
                  </button>
                  {!isCollapsed && (
                    <div className="mt-1 space-y-1">
                      {g.slides.map((s) => (
                        <SlideRow key={s.id} slide={s} active={s.id === activeId} onSelect={onSelect} />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

        {searching && filtered.length === 0 && (
          <p className="px-2 py-6 text-center text-xs text-faint">Aucune lame ne correspond.</p>
        )}
      </div>
    </div>
  )
}

function SlideRow({
  slide,
  active,
  onSelect,
}: {
  slide: HistologySlide
  active: boolean
  onSelect: (s: HistologySlide) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(slide)}
      className={cn(
        'flex w-full items-center gap-2 rounded-lg border p-1.5 text-left transition-colors cursor-pointer',
        active
          ? 'border-primary/50 bg-primary/10'
          : 'border-transparent hover:border-border hover:bg-elevated'
      )}
    >
      <span className="relative h-9 w-12 shrink-0 overflow-hidden rounded border border-border bg-background">
        <img src={slide.src} alt="" loading="lazy" className="h-full w-full object-cover" />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            'block truncate text-[11.5px] leading-tight',
            active ? 'text-primary' : 'text-muted'
          )}
        >
          {slide.slideTitle || slide.title}
        </span>
        <span className="mt-0.5 block truncate font-mono text-[9.5px] uppercase tracking-wider text-faint">
          {slide.page != null ? `diapo ${slide.page}` : slide.id}
          {slide.stain ? ` · ${slide.stain}` : ''}
        </span>
      </span>
    </button>
  )
}
