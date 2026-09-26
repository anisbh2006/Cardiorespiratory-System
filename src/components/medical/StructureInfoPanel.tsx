import { Link } from 'react-router-dom'
import { BookOpen, FileText, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useStructureContent } from '@/features/anatomy/useStructureContent'
import type { AnatomyStructure } from '@/data/types'
import { useLanguage } from '@/context/LanguageContext'

/**
 * Information panel for a selected anatomical structure.
 *
 * Every statement and image shown here is read verbatim from the supplied
 * lecturee content (see useStructureContent). No medical explanation is written
 * in this component; when the source yields no passage for a structure, the
 * panel says so explicitly instead of inventing one.
 */
export function StructureInfoPanel({ structure }: { structure: AnatomyStructure | null }) {
  const { t } = useLanguage()
  const content = useStructureContent(structure)

  if (!structure) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-xl border border-border bg-surface/60 p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary shadow-[0_0_0_4px_rgba(224,36,58,0.04)]">
          <BookOpen className="h-5 w-5" />
        </div>
        <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">
          {t('anatomy.lab')}
        </h3>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
          {t('anatomy.description')}
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto rounded-xl border border-border bg-surface/60">
      {/* Header */}
      <div className="border-b border-border p-5">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {structure.system === 'cardiovascular' ? t('anatomy.cardiac') : t('anatomy.respiratory')}
          </Badge>
          {content.loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-faint" />}
        </div>
        <h3 className="mt-3 font-serif text-2xl font-bold tracking-tight text-foreground">
          {structure.nameFr}
        </h3>
        {structure.nameEn && (
          <p className="mt-0.5 text-sm font-medium uppercase tracking-wider text-faint">
            {structure.nameEn}
          </p>
        )}
      </div>

      <div className="space-y-6 p-5">
        {/* Course excerpts */}
        <section>
          <h4 className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
            <FileText className="h-3 w-3" /> {t('anatomy.excerptLabel')}
            {content.chapterTitle ? ` — ${content.chapterTitle}` : ''}
          </h4>
          {content.loading ? (
            <div className="mt-3 space-y-2">
              <div className="shimmer h-4 w-full rounded bg-overlay" />
              <div className="shimmer h-4 w-11/12 rounded bg-overlay" />
              <div className="shimmer h-4 w-9/12 rounded bg-overlay" />
            </div>
          ) : content.excerpts.length > 0 ? (
            <div className="mt-3 space-y-3">
              {content.excerpts.map((ex, i) => (
                <blockquote
                  key={i}
                  className="border-l-2 border-primary/50 pl-3 text-[13px] leading-relaxed text-foreground/85"
                >
                  {ex.text}
                  <span className="mt-1 block font-mono text-[10px] text-faint">
                    {ex.chapterTitle ? `${ex.chapterTitle} · ` : ''}p. {ex.page}
                  </span>
                </blockquote>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-xs italic leading-relaxed text-faint">
              {t('anatomy.noExcerpt')}
            </p>
          )}
        </section>

        {/* Related lecturee images */}
        {content.images.length > 0 && (
          <section>
            <h4 className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
              <ImageIcon className="h-3 w-3" /> {t('anatomy.imagesLabel')}
            </h4>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {content.images.map((img, i) => (
                <figure key={i} className="overflow-hidden rounded-lg border border-border bg-black/40">
                  <img
                    src={img.src}
                    alt={img.caption || structure.nameFr}
                    loading="lazy"
                    className="aspect-square w-full object-cover"
                  />
                  {img.caption && (
                    <figcaption className="truncate px-2 py-1 text-[10px] text-faint">
                      {img.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* Lesson link */}
        {content.lessonPath && (
          <Link to={content.lessonPath} className="block">
            <Button variant="outline" size="sm" className="w-full gap-2">
              <BookOpen className="h-3.5 w-3.5" /> {t('anatomy.openFullLesson')}
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
