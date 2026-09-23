import * as React from 'react'
import { loadChapter, type RawBlock } from '@/data/contentLoader'
import { getDiscipline } from '@/data/disciplines'
import type { AnatomyStructure } from '@/data/types'

export interface StructureExcerpt {
  text: string
  page: number
  chapterTitle?: string
}

export interface StructureImage {
  src: string
  caption: string
}

export interface StructureContent {
  loading: boolean
  chapterTitle: string | null
  lessonPath: string | null
  excerpts: StructureExcerpt[]
  images: StructureImage[]
}

const EMPTY: StructureContent = {
  loading: false,
  chapterTitle: null,
  lessonPath: null,
  excerpts: [],
  images: [],
}

const MAX_EXCERPTS = 6
const MAX_IMAGES = 4
const EXCERPT_CHARS = 420

function blockText(b: RawBlock): string {
  switch (b.type) {
    case 'paragraph':
    case 'heading':
      return b.text ?? ''
    case 'list':
      return ((b.items as string[]) ?? []).join(' ')
    case 'table':
      return [...(b.headers ?? []), ...((b.rows as string[][]) ?? []).flat()].join(' ')
    default:
      return ''
  }
}

/**
 * Pulls the supplied course passages that describe a structure.
 *
 * The structure's chapter JSON is loaded on demand and scanned for paragraphs
 * containing any of the structure's verbatim source-language search keys. The
 * matching paragraphs (and the images on those same source pages) are returned
 * EXACTLY as extracted — nothing is paraphrased, summarized or invented.
 */
export function useStructureContent(structure: AnatomyStructure | null): StructureContent {
  const [content, setContent] = React.useState<StructureContent>(EMPTY)

  const lessonId = structure?.lessonId
  const relatedKey = (structure?.relatedLessonIds ?? []).join(',')
  const system = structure?.system
  const termsKey = (structure?.searchTerms ?? []).join('|')

  React.useEffect(() => {
    if (!lessonId || !system) {
      setContent(EMPTY)
      return
    }
    const slug = system === 'cardiovascular' ? 'anatomie-cardiovasculaire' : 'anatomie-respiratoire'
    const discipline = getDiscipline(slug)
    const titleOf = (id: string) => discipline?.chapters.find((c) => c.id === id)?.title ?? null
    const lessonPath = `/discipline/${slug}/${lessonId}/${lessonId}`
    const chapterIds = [lessonId, ...relatedKey.split(',').filter(Boolean)]
    const terms = termsKey
      ? termsKey.split('|').map((t) => t.trim().toLowerCase()).filter(Boolean)
      : []

    let alive = true
    setContent((c) => ({ ...c, loading: true, chapterTitle: titleOf(lessonId), lessonPath }))

    Promise.all(
      chapterIds.map((id) =>
        loadChapter(slug, id)
          .then((raw) => ({ id, raw }))
          .catch(() => null)
      )
    ).then((results) => {
      if (!alive) return

      interface Candidate {
        text: string
        page: number
        chapterTitle?: string
        score: number
        images: StructureImage[]
      }
      const candidates: Candidate[] = []

      for (const res of results) {
        if (!res) continue
        const chapterTitle = titleOf(res.id)
        for (const page of res.raw.pages) {
          const pageImages: StructureImage[] = []
          for (const block of page.blocks) {
            if (block.type === 'image' && block.src) {
              pageImages.push({ src: block.src, caption: block.caption ?? '' })
            }
          }
          for (const block of page.blocks) {
            const text = blockText(block)
            if (!text || block.type !== 'paragraph') continue
            const lower = text.toLowerCase()
            let score = 0
            for (const t of terms) {
              let idx = lower.indexOf(t)
              while (idx !== -1) {
        score += 1
                idx = lower.indexOf(t, idx + t.length)
              }
            }
            if (score === 0) continue
            candidates.push({ text, page: page.n, chapterTitle: chapterTitle ?? undefined, score, images: pageImages })
          }
        }
      }

      // Structure-specific passages first (most term occurrences).
      candidates.sort((a, b) => b.score - a.score)
      const chosen = candidates.slice(0, MAX_EXCERPTS)

      const excerpts: StructureExcerpt[] = chosen.map((c) => ({
        text: c.text.length > EXCERPT_CHARS ? `${c.text.slice(0, EXCERPT_CHARS)}…` : c.text,
        page: c.page,
        chapterTitle: c.chapterTitle,
      }))
      const images: StructureImage[] = []
      for (const c of chosen) {
        for (const img of c.images) {
          if (images.length < MAX_IMAGES && !images.some((i) => i.src === img.src)) {
            images.push(img)
          }
        }
      }

      setContent({
        loading: false,
        chapterTitle: titleOf(lessonId),
        lessonPath,
        excerpts,
        images,
      })
    })

    return () => {
      alive = false
    }
  }, [lessonId, relatedKey, system, termsKey])

  return content
}
