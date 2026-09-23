import * as React from 'react'
import { Microscope } from 'lucide-react'
import { AwaitingContent } from '@/components/medical/AwaitingContent'
import { MicroscopeViewer } from '@/components/medical/histology/MicroscopeViewer'
import { SlideInfoPanel } from '@/components/medical/histology/SlideInfoPanel'
import { SlideLibrary } from '@/components/medical/histology/SlideLibrary'
import { SlideFilmstrip } from '@/components/medical/histology/SlideFilmstrip'
import { SLIDES } from '@/components/medical/histology/slides'
import type { HistologySlide } from '@/components/medical/histology/types'

/**
 * Microscopy workbench. Distinct from the text lessons: a dark stage with a
 * high-resolution viewer (zoom/pan/fullscreen), a slide library, a filmstrip and
 * a source-derived information panel. All content comes from the supplied
 * histology images and their slide text — nothing is generated or fabricated.
 */
export default function HistologyPage() {
  const [activeId, setActiveId] = React.useState<string>(SLIDES[0]?.id ?? '')
  const [activeLabel, setActiveLabel] = React.useState<string | null>(null)

  const active = React.useMemo(
    () => SLIDES.find((s) => s.id === activeId) ?? SLIDES[0],
    [activeId]
  )

  // Navigation is scoped to the active slide's chapter.
  const chapterSlides = React.useMemo(
    () => (active ? SLIDES.filter((s) => s.chapterId === active.chapterId) : []),
    [active]
  )

  const goTo = React.useCallback((delta: number) => {
    setActiveId((id) => {
      const cur = SLIDES.find((s) => s.id === id) ?? SLIDES[0]
      const list = SLIDES.filter((s) => s.chapterId === cur.chapterId)
      const i = list.findIndex((s) => s.id === id)
      const next = list[Math.min(list.length - 1, Math.max(0, i + delta))]
      return next?.id ?? id
    })
  }, [])

  const selectSlide = React.useCallback((s: HistologySlide) => setActiveId(s.id), [])
  const selectIndex = React.useCallback(
    (i: number) => setActiveId(chapterSlides[i]?.id ?? activeId),
    [chapterSlides, activeId]
  )

  // Global arrow-key navigation (ignored while typing in a field).
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        goTo(1)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goTo(-1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goTo])

  if (!active) {
    return (
      <div className="pt-14">
        <AwaitingContent
          title="Lames histologiques en attente d'intégration"
          description="Les images histologiques fournies (avec leurs colorations, légendes et annotations éventuelles) seront affichées ici dans le visualiseur haute résolution. Aucune structure histologique n'est générée artificiellement."
          className="py-20"
        />
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col pt-14">
      {/* Compact workbench header */}
      <header className="shrink-0 border-b border-border bg-surface/60">
        <div className="flex items-center justify-between gap-4 px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 text-primary">
              <Microscope className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate font-serif text-base font-bold tracking-tight text-foreground">
                Station de microscopie
              </h1>
              <p className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
                {active.chapterTitle}
              </p>
            </div>
          </div>
          <p className="hidden shrink-0 items-center gap-2 text-[11px] text-faint md:flex">
            <kbd className="rounded border border-border bg-elevated px-1.5 py-0.5 font-mono">←</kbd>
            <kbd className="rounded border border-border bg-elevated px-1.5 py-0.5 font-mono">→</kbd>
            naviguer · molette zoom · double-clic agrandir · F plein écran
          </p>
        </div>
      </header>

      {/* Workbench */}
      <main className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-y-auto p-3 lg:grid-cols-[264px_minmax(0,1fr)_336px] lg:overflow-hidden">
        <SlideLibrary
          activeId={active.id}
          onSelect={selectSlide}
          className="order-2 min-h-0 lg:order-1 lg:h-full"
        />

        <div className="order-1 flex min-h-0 flex-col gap-3 lg:order-2 lg:h-full">
          <MicroscopeViewer slide={active} className="h-[52vh] min-h-[340px] lg:h-auto lg:min-h-0 lg:flex-1" />
          <SlideFilmstrip
            slides={chapterSlides}
            activeId={active.id}
            onSelect={selectIndex}
            onPrev={() => goTo(-1)}
            onNext={() => goTo(1)}
          />
        </div>

        <div className="order-3 min-h-0 lg:h-full">
          <SlideInfoPanel
            slide={active}
            activeLabel={activeLabel}
            onActiveLabelChange={setActiveLabel}
          />
        </div>
      </main>
    </div>
  )
}
