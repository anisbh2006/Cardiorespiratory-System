import { manifest } from '@/data/contentLoader'

/**
 * Provenance plumbing for the physiology visualizations.
 *
 * Every visualization declares the exact chapters/pages its content comes from
 * so the UI can cite the source and link to the full lesson. Nothing shown in a
 * visualization may exist without a corresponding entry here — this is how the
 * "never invent medical content" rule is enforced structurally.
 */
export interface SourceRef {
  chapterId: string
  /** Page number within the chapter the fact/diagram is drawn from. */
  page?: number
  /** Optional short verbatim quote supporting what is drawn. */
  quote?: string
}

export interface LessonRef {
  slug: string
  chapterId: string
}

export function chapterTitle(chapterId: string): string {
  return manifest.find((m) => m.chapterId === chapterId)?.title ?? chapterId
}

export function lessonPath(ref: LessonRef): string {
  return `/discipline/${ref.slug}/${ref.chapterId}/${ref.chapterId}`
}
