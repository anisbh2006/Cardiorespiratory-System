import * as React from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, GraduationCap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TransportControls } from './TransportControls'
import { chapterTitle, lessonPath, type LessonRef, type SourceRef } from './provenance'
import type { PhysioClock } from './usePhysioClock'
import { cn } from '@/lib/utils'

interface VizFrameProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  system: 'cardiovascular' | 'respiratory'
  clock: PhysioClock
  cycleSeconds: number
  marks?: { at: number; label: string }[]
  /** Optional override for the transport time readout (non-second x-axes). */
  readout?: string
  legend?: { color: string; label: string }[]
  /** Chapters/pages this visualization is drawn from — always displayed. */
  sources: SourceRef[]
  lesson: LessonRef
  /** Honest framing line; defaults to a schematic disclaimer. */
  schematicNote?: string
  /** Optional right-hand column (key values, equations, callouts). */
  aside?: React.ReactNode
  children: React.ReactNode
  className?: string
}

/**
 * Card shell shared by every visualization: title + system badge, the animation
 * stage, transport controls, an optional aside, and — importantly — the lecturee
 * provenance (chapter + page) with a link to the full lesson.
 */
export function VizFrame({
  title,
  subtitle,
  icon,
  system,
  clock,
  cycleSeconds,
  marks,
  readout,
  legend,
  sources,
  lesson,
  schematicNote = 'Animated diagram à but pédagogique : la séquence et les valeurs affichées proviennent the lesson, elles ne sont pas inventées.',
  aside,
  children,
  className,
}: VizFrameProps) {
  const grouped = React.useMemo(() => {
    const byChapter = new Map<string, { title: string; pages: Set<number> }>()
    for (const s of sources) {
      const entry = byChapter.get(s.chapterId) ?? { title: chapterTitle(s.chapterId), pages: new Set<number>() }
      if (s.page != null) entry.pages.add(s.page)
      byChapter.set(s.chapterId, entry)
    }
    return [...byChapter.entries()].map(([id, e]) => ({
      id,
      title: e.title,
      pages: [...e.pages].sort((a, b) => a - b),
    }))
  }, [sources])

  return (
    <article
      className={cn(
        'overflow-hidden rounded-2xl border border-border bg-surface shadow-soft',
        className
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border bg-elevated/40 px-5 py-4">
        <div className="flex items-start gap-3">
          {icon && (
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
              {icon}
            </span>
          )}
          <div>
            <h2 className="font-serif text-xl font-semibold tracking-tight text-foreground">
              {title}
            </h2>
            {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
          </div>
        </div>
        <Badge variant="secondary">
          {system === 'cardiovascular' ? 'Cardiovascular' : 'Respiratory'}
        </Badge>
      </header>

      <div
        className={cn(
          'grid gap-5 p-5',
          aside ? 'lg:grid-cols-[minmax(0,1fr)_300px]' : 'grid-cols-1'
        )}
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-background/60 p-3">{children}</div>

          <TransportControls clock={clock} cycleSeconds={cycleSeconds} marks={marks} readout={readout} />

          {legend && legend.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              {legend.map((l) => (
                <span key={l.label} className="flex items-center gap-1.5 text-[11px] text-muted">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: l.color }} />
                  {l.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {aside && <div className="space-y-3">{aside}</div>}
      </div>

      <footer className="space-y-3 border-t border-border bg-elevated/30 px-5 py-4">
        {schematicNote && <p className="text-[11px] italic leading-relaxed text-faint">{schematicNote}</p>}

        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
            <BookOpen className="h-3 w-3 text-primary" /> Source the lesson
          </span>
          {grouped.map((g) => (
            <span
              key={g.id}
              className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] text-muted"
            >
              {g.title}
              {g.pages.length > 0 && (
                <span className="font-mono text-faint"> · p. {g.pages.join(', ')}</span>
              )}
            </span>
          ))}
        </div>

        <Link to={lessonPath(lesson)} className="block">
          <Button variant="outline" size="sm" className="w-full gap-2 sm:w-auto">
            <GraduationCap className="h-3.5 w-3.5" />
            Ouvrir la leçon — {chapterTitle(lesson.chapterId)}
          </Button>
        </Link>
      </footer>
    </article>
  )
}
