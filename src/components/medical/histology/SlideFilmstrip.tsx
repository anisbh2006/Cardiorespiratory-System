import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SlideThumb } from './SlideThumb'
import type { HistologySlide } from './types'

interface SlideFilmstripProps {
  slides: HistologySlide[]
  activeId: string
  onSelect: (index: number) => void
  onPrev: () => void
  onNext: () => void
}

/**
 * Horizontal thumbnail navigator. Auto-scrolls the active slide into view and
 * exposes prev/next for keyboard-free navigation through a chapter.
 */
export function SlideFilmstrip({ slides, activeId, onSelect, onPrev, onNext }: SlideFilmstripProps) {
  const activeIndex = slides.findIndex((s) => s.id === activeId)
  const scrollerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const el = scrollerRef.current?.querySelector<HTMLElement>(`[data-idx="${activeIndex}"]`)
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [activeIndex])

  const NavBtn = ({ dir, onClick, disabled }: { dir: 'l' | 'r'; onClick: () => void; disabled: boolean }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === 'l' ? 'Previous' : 'Next'}
      className={cn(
        'flex h-10 w-8 shrink-0 items-center justify-center rounded-md border border-border text-muted transition-colors',
        disabled ? 'opacity-30' : 'hover:bg-elevated hover:text-foreground cursor-pointer'
      )}
    >
      {dir === 'l' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
    </button>
  )

  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-surface p-2">
      <NavBtn dir="l" onClick={onPrev} disabled={activeIndex <= 0} />
      <div ref={scrollerRef} className="flex min-w-0 flex-1 gap-2 overflow-x-auto scroll-smooth [scrollbar-width:thin]">
        {slides.map((s, i) => (
          <button
            key={s.id}
            data-idx={i}
            type="button"
            onClick={() => onSelect(i)}
            title={s.slideTitle || s.title}
            className={cn(
              'group relative h-12 w-16 shrink-0 overflow-hidden rounded-md border transition-all cursor-pointer',
              i === activeIndex
                ? 'border-primary ring-1 ring-primary/50'
                : 'border-border opacity-60 hover:opacity-100'
            )}
          >
            <SlideThumb src={s.src} alt="" />
            <span className="absolute bottom-0 right-0 bg-black/70 px-1 font-mono text-[8px] text-white/80">
              {s.page ?? i + 1}
            </span>
          </button>
        ))}
      </div>
      <NavBtn dir="r" onClick={onNext} disabled={activeIndex >= slides.length - 1} />
      <span className="ml-1 shrink-0 font-mono text-[10px] text-faint">
        {activeIndex + 1}/{slides.length}
      </span>
    </div>
  )
}
