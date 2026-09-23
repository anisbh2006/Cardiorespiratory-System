import * as React from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, FlaskConical, Info, Layers, Tag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { lessonPath } from '@/features/physiology/provenance'
import type { HistologySlide } from './types'

interface SlideInfoPanelProps {
  slide: HistologySlide
  /** Label currently highlighted in the viewer (hover sync), if any. */
  activeLabel?: string | null
  onActiveLabelChange?: (label: string | null) => void
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="border-t border-border px-4 py-3.5 first:border-t-0">
      <h4 className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
        {icon}
        {title}
      </h4>
      {children}
    </section>
  )
}

/**
 * Side information panel for the active micrograph. Every field is source-derived:
 * the caption, the structure call-outs (`labels`) and the explanatory sentences
 * (`text`) all come verbatim from the slide the image was extracted from. When a
 * slide supplies none of these, the panel says so honestly instead of inventing
 * a description. The footer links to the full chapter lesson.
 */
export function SlideInfoPanel({ slide, activeLabel, onActiveLabelChange }: SlideInfoPanelProps) {
  const labels = slide.labels ?? []
  const text = slide.text ?? []
  const shared = (slide.pageImageCount ?? 1) > 1
  const hasContent = labels.length > 0 || text.length > 0 || !!slide.slideTitle

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-surface">
      {/* Header */}
      <div className="border-b border-border px-4 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="default">{slide.chapterTitle}</Badge>
          {slide.stain && <Badge variant="secondary">{slide.stain}</Badge>}
        </div>
        {slide.slideTitle && (
          <h3 className="mt-2 font-serif text-base font-semibold leading-snug text-foreground">
            {slide.slideTitle}
          </h3>
        )}
        <div className="mt-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-faint">
          {slide.page != null && <span>Diapositive {slide.page}</span>}
          <span>·</span>
          <span>{slide.id}</span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Caption */}
        {slide.caption && slide.caption !== slide.chapterTitle && (
          <Section icon={<Info className="h-3 w-3" />} title="Légende">
            <p className="text-[13px] leading-relaxed text-muted">{slide.caption}</p>
          </Section>
        )}

        {/* Structure identification */}
        {labels.length > 0 && (
          <Section icon={<Tag className="h-3 w-3" />} title="Structures identifiées">
            {shared && (
              <p className="mb-2 text-[11px] italic text-faint">
                Termes de la diapositive (partagés entre {slide.pageImageCount} images).
              </p>
            )}
            <ul className="flex flex-wrap gap-1.5">
              {labels.map((l) => (
                <li key={l}>
                  <button
                    type="button"
                    onMouseEnter={() => onActiveLabelChange?.(l)}
                    onMouseLeave={() => onActiveLabelChange?.(null)}
                    onFocus={() => onActiveLabelChange?.(l)}
                    onBlur={() => onActiveLabelChange?.(null)}
                    className={`rounded-md border px-2 py-1 text-[11px] transition-colors cursor-pointer ${
                      activeLabel === l
                        ? 'border-warning/60 bg-warning/15 text-warning'
                        : 'border-border bg-elevated text-muted hover:border-border-strong hover:text-foreground'
                    }`}
                  >
                    {l}
                  </button>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Explanation */}
        {text.length > 0 && (
          <Section icon={<Layers className="h-3 w-3" />} title="Texte de la diapositive">
            <div className="space-y-1.5">
              {text.map((p, i) => (
                <p key={i} className="text-[12.5px] leading-relaxed text-muted">
                  {p}
                </p>
              ))}
            </div>
          </Section>
        )}

        {/* Honest empty state */}
        {!hasContent && (
          <Section icon={<Info className="h-3 w-3" />} title="À propos">
            <p className="text-[12.5px] leading-relaxed text-faint">
              Cette diapositive ne fournit ni légende ni annotations textuelles dans le matériel
              du cours. Aucune description n'est inventée — seule l'image source est affichée.
            </p>
          </Section>
        )}

        {/* Provenance note */}
        <Section icon={<FlaskConical className="h-3 w-3" />} title="Provenance">
          <p className="text-[11.5px] leading-relaxed text-faint">
            Image, légende et termes proviennent de la diapositive {slide.page ?? '—'} du chapitre «{' '}
            {slide.chapterTitle} ». Les légendes ne sont pas repositionnées sur l'image faute de
            coordonnées fournies ; elles sont listées ici telles qu'elles figurent au cours.
          </p>
        </Section>
      </div>

      {/* Related lesson navigation */}
      <div className="border-t border-border p-3">
        <Link
          to={lessonPath({ slug: 'histologie', chapterId: slide.chapterId })}
          className="flex items-center justify-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
        >
          <BookOpen className="h-3.5 w-3.5" />
          Ouvrir la leçon — {slide.chapterTitle}
        </Link>
      </div>
    </aside>
  )
}
