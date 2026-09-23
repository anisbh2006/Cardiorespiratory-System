/**
 * Bridge between the generated course content (src/content/**) and the
 * typed data layer consumed by the UI.
 *
 * The chapter manifest is imported statically (it is small: titles + section
 * headings) and drives navigation, chapter lists and search. The heavy
 * per-chapter JSON (paragraph blocks, tables, image references) is loaded
 * lazily through `import.meta.glob`, so each chapter becomes its own code-split
 * chunk fetched only when a lesson is opened.
 *
 * All content originates verbatim from the supplied course files — this module
 * only reshapes it, it never rewrites or invents medical information.
 */
import type { ContentBlock, Topic } from './types'
import manifestJson from '@/content/manifest.json'

export interface ManifestEntry {
  discipline: string
  chapterId: string
  number: string
  kind: 'cours' | 'td' | string
  title: string
  file: string
  pages: number
  images: number
  topics: string[]
}

export const manifest = manifestJson as ManifestEntry[]

export interface RawBlock {
  type: string
  level?: number
  text?: string
  headers?: string[]
  rows?: string[][]
  src?: string
  caption?: string
  [key: string]: unknown
}

export interface RawPage {
  n: number
  title: string
  blocks: RawBlock[]
}

export interface RawChapter {
  file: string
  chapterId: string
  title: string
  kind: string
  pages: RawPage[]
}

/** Lazy chunk map: one dynamic import per generated chapter JSON. */
const chapterModules = import.meta.glob('../content/*/*.json')

export function hasChapterContent(discipline: string, chapterId: string): boolean {
  return `../content/${discipline}/${chapterId}.json` in chapterModules
}

export function loadChapter(discipline: string, chapterId: string): Promise<RawChapter> {
  const key = `../content/${discipline}/${chapterId}.json`
  const mod = chapterModules[key]
  if (!mod) return Promise.reject(new Error(`No generated content for ${key}`))
  return mod().then((m) => {
    const anyMod = m as { default?: RawChapter }
    return (anyMod.default ?? (m as unknown as RawChapter)) as RawChapter
  })
}

/**
 * Convert a chapter's source-ordered pages into a flat Topic list suitable for
 * the lesson renderer + table of contents.
 *
 *  - When the chapter has section headings, each heading opens a new Topic and
 *    the paragraphs/tables/images that follow belong to it.
 *  - Plate atlases with no detected headings (e.g. pure anatomy figures) fall
 *    back to one Topic per page, titled with the page's own caption.
 */
export function buildTopics(pages: RawPage[]): Topic[] {
  const topics: Topic[] = []
  let idx = 0

  const hasHeading = pages.some((p) => p.blocks.some((b) => b.type === 'heading'))

  if (!hasHeading) {
    for (const p of pages) {
      const blocks = p.blocks.filter((b) => b.type !== 'heading') as unknown as ContentBlock[]
      if (!blocks.length) continue
      const title = (p.title || '').trim() || `Planche ${p.n}`
      topics.push({ id: `t-${idx++}`, title, blocks })
    }
    return topics.length ? topics : [{ id: 't-0', title: 'Contenu du cours', blocks: [] }]
  }

  let current: Topic | null = null
  for (const p of pages) {
    for (const b of p.blocks) {
      if (b.type === 'heading') {
        current = { id: `t-${idx++}`, title: b.text || 'Section', blocks: [] }
        topics.push(current)
      } else {
        if (!current) {
          current = { id: `t-${idx++}`, title: 'Introduction', blocks: [] }
          topics.push(current)
        }
        current.blocks!.push(b as unknown as ContentBlock)
      }
    }
  }
  return topics
}
