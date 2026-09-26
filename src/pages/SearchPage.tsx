import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowUpRight, BookOpen, Heart, Layers, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { search, type SearchEntry } from '@/features/search/searchIndex'
import { lessonRoute } from '@/data/contentLoader'
import { useStudy } from '@/features/study/StudyContext'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '@/context/LanguageContext'

const typeIcons = {
  discipline: Layers,
  chapter: BookOpen,
  lesson: BookOpen,
  topic: ArrowUpRight,
  structure: Heart,
  term: Search,
} as const

const typeLabels = {
  discipline: 'search.resultType.discipline',
  chapter: 'search.resultType.chapter',
  lesson: 'search.resultType.lesson',
  topic: 'search.resultType.topic',
  structure: 'search.resultType.structure',
  term: 'search.resultType.term',
} as const

function resultLink(entry: SearchEntry): string {
  if (entry.type === 'structure') {
    return entry.disciplineSlug === 'anatomie-respiratoire'
      ? '/anatomy?system=respiratory'
      : '/anatomy'
  }
  // Lessons, chapters and topics deep-link to the actual lesson page so a
  // student lands on the found concept instead of the discipline overview.
  if (entry.lessonId) {
    return lessonRoute(entry.lessonId, entry.disciplineSlug) ?? `/discipline/${entry.disciplineSlug}`
  }
  return `/discipline/${entry.disciplineSlug}`
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const navigate = useNavigate()
  const { recordSearch } = useStudy()
  const { t } = useLanguage()
  const results = React.useMemo(() => search(query), [query])
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    recordSearch(query)
  }

  return (
    <div className="pt-14">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
          {t('search.title')}
        </h1>
        <p className="mt-2 text-sm text-muted">{t('search.subtitle')}</p>

        <form onSubmit={submit} className="mt-6 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setSearchParams(e.target.value ? { q: e.target.value } : {})}
              placeholder={t('search.placeholder')}
              className="h-11 pl-9"
            />
          </div>
        </form>

        <div className="mt-8 space-y-2">
          {!query && (
            <p className="py-10 text-center text-sm text-faint">{t('search.emptyHint')}</p>
          )}

          {query && results.length === 0 && (
            <p className="py-10 text-center text-sm text-muted">{t('search.emptyMessage', { query })}</p>
          )}

          {results.map((entry) => {
            const Icon = typeIcons[entry.type]
            return (
              <Link
                key={entry.id}
                to={resultLink(entry)}
                className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-primary/40"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-overlay">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{entry.title}</span>
                    <span className="rounded-full bg-overlay px-2 py-px text-[10px] text-muted">
                      {t(typeLabels[entry.type])}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {entry.disciplineTitle}
                    {entry.chapterTitle && ` · ${entry.chapterTitle}`}
                  </span>
                  {entry.preview && (
                    <span className="mt-1 block truncate text-xs text-faint">{entry.preview}</span>
                  )}
                </span>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    recordSearch(query)
                    navigate(resultLink(entry))
                  }}
                  className="shrink-0 self-center rounded-md border border-border px-2.5 py-1 text-[11px] font-medium text-muted transition-colors hover:border-primary/50 hover:text-primary cursor-pointer"
                >
                  {t('common.open')}
                </button>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
