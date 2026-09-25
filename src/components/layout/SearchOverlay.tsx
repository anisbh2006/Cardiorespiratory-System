import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowUpRight,
  BookOpen,
  CornerDownLeft,
  Heart,
  Layers,
  Search,
  Wind,
  X,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { search, type SearchEntry } from '@/features/search/searchIndex'
import { lessonRoute } from '@/data/contentLoader'
import { useStudy } from '@/features/study/StudyContext'
import { cn } from '@/lib/utils'

const typeIcons = {
  discipline: Layers,
  chapter: BookOpen,
  lesson: BookOpen,
  topic: ArrowUpRight,
  structure: Heart,
  term: Search,
} as const

const typeLabels = {
  discipline: 'Discipline',
  chapter: 'Chapitre',
  lesson: 'Lesson',
  topic: 'Section',
  structure: 'Structure',
  term: 'Terme',
} as const

function entryRoute(entry: SearchEntry): string {
  if (entry.type === 'discipline') return `/discipline/${entry.disciplineSlug}`
  if (entry.type === 'structure') {
    return entry.disciplineSlug === 'anatomie-respiratoire'
      ? '/anatomy?system=respiratory'
      : '/anatomy'
  }
  // Chapters, lessons and topics open the actual lesson page.
  if (entry.lessonId) {
    return lessonRoute(entry.lessonId, entry.disciplineSlug) ?? `/discipline/${entry.disciplineSlug}`
  }
  return `/discipline/${entry.disciplineSlug}`
}

export function SearchOverlay() {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [activeIndex, setActiveIndex] = React.useState(0)
  const navigate = useNavigate()
  const { searchHistory, recordSearch } = useStudy()
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      } else if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  React.useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  const results = React.useMemo(() => search(query), [query])

  const openEntry = React.useCallback(
    (entry: SearchEntry) => {
      recordSearch(query)
      setOpen(false)
      navigate(entryRoute(entry))
    },
    [navigate, query, recordSearch]
  )

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[activeIndex]) {
      e.preventDefault()
      openEntry(results[activeIndex])
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group flex h-9 items-center gap-2 rounded-md border border-border bg-elevated px-3 text-sm text-faint transition-colors hover:border-border-strong hover:text-muted cursor-pointer"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="ml-4 hidden rounded border border-border-strong bg-overlay px-1.5 py-0.5 font-mono text-[10px] text-muted md:inline">
          ⌘K
        </kbd>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 pt-[12vh] backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Global medical search"
              initial={{ opacity: 0, scale: 0.97, y: -12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -12 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="w-full max-w-xl overflow-hidden rounded-xl border border-border-strong bg-surface shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 border-b border-border px-4">
                <Search className="h-4 w-4 shrink-0 text-primary" />
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setActiveIndex(0)
                  }}
                  onKeyDown={onKeyDown}
                  placeholder="Search for a term, structure, chapter, or lesson..."
                  className="h-12 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:border-0"
                />
                <button
                  onClick={() => setOpen(false)}
                  className="shrink-0 text-faint hover:text-foreground transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-[50vh] overflow-y-auto p-2">
                {!query && searchHistory.length > 0 && (
                  <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-faint">
                    Recent searches
                  </div>
                )}
                {!query &&
                  searchHistory.map((h) => (
                    <button
                      key={h}
                      onClick={() => setQuery(h)}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted transition-colors hover:bg-elevated hover:text-foreground cursor-pointer"
                    >
                      <Search className="h-3.5 w-3.5 text-faint" />
                      {h}
                    </button>
                  ))}

                {query && results.length === 0 && (
                  <div className="px-3 py-8 text-center text-sm text-muted">
                    Aucun résultat pour « {query} ».
                    <br />
                    <span className="text-xs text-faint">
                      Les résultats apparaîtront au fur et à mesure de l'intégration du contenu
                      source.
                    </span>
                  </div>
                )}

                {results.map((entry, i) => {
                  const Icon = typeIcons[entry.type]
                  return (
                    <button
                      key={entry.id}
                      onClick={() => openEntry(entry)}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={cn(
                        'flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors cursor-pointer',
                        i === activeIndex ? 'bg-elevated' : 'bg-transparent'
                      )}
                    >
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border border-border bg-overlay">
                        <Icon className="h-3 w-3 text-primary" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-foreground">
                            {entry.title}
                          </span>
                          <span className="shrink-0 rounded-full bg-overlay px-1.5 py-px text-[10px] text-muted">
                            {typeLabels[entry.type]}
                          </span>
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-muted">
                          {entry.disciplineTitle}
                          {entry.chapterTitle && ` · ${entry.chapterTitle}`}
                          {entry.preview && ` — ${entry.preview}`}
                        </span>
                      </span>
                      {i === activeIndex && (
                        <CornerDownLeft className="mt-1 h-3.5 w-3.5 shrink-0 text-faint" />
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="flex items-center justify-between border-t border-border bg-background/50 px-4 py-2 text-[10px] text-faint">
                <span className="flex items-center gap-1.5">
                  <Wind className="h-3 w-3" /> UEI/VEI 01 · Global medical search
                </span>
                <span>↑↓ naviguer · ⏎ ouvrir · esc fermer</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
