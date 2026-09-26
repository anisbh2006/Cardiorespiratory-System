/**
 * Bridge between the generated lecturee content (src/content/**) and the
 * typed data layer consumed by the UI.
 *
 * The chapter manifest is imported statically (it is small: titles + section
 * headings) and drives navigation, chapter lists and search. The heavy
 * per-chapter JSON (paragraph blocks, tables, image references) is loaded
 * lazily through `import.meta.glob`, so each chapter becomes its own code-split
 * chunk fetched only when a lesson is opened.
 *
 * All content originates verbatim from the supplied lecturee files — this module
 * only reshapes it, it never rewrites or invents medical information.
 */
import type { ContentBlock, Topic } from './types'
import type { Language } from '@/i18n'
import manifestJson from '@/content/manifest.json'
import frenchManifestJson from '@/content/manifest.fr.json'

export interface ManifestEntry {
  discipline: string
  chapterId: string
  number: string
  kind: 'lecture' | 'td' | string
  title: string
  file: string
  pages: number
  images: number
  topics: string[]
}

export const manifest = manifestJson as ManifestEntry[]
const frenchManifest = frenchManifestJson as { chapterId: string; title: string; topics: string[] }[]

/**
 * chapterId → discipline slug, for every chapter in the manifest.
 *
 * Chapter ids are globally unique, and each chapter holds exactly one lesson
 * whose id equals the chapter id. This map therefore lets any feature resolve a
 * lesson id back to its discipline and build a deep link without threading the
 * slug through every call site (search, recents, bookmarks, anatomy panel).
 */
export const disciplineByChapterId: Record<string, string> = Object.fromEntries(
  manifest.map((m) => [m.chapterId, m.discipline])
)

/** Chapter title lookup by id (source-derived, never invented). */
export const chapterTitleById: Record<string, string> = Object.fromEntries(
  manifest.map((m) => [m.chapterId, m.title])
)

const frenchChapterById = Object.fromEntries(frenchManifest.map((entry) => [entry.chapterId, entry]))

export function getChapterTitle(chapterId: string, language: Language = 'en'): string {
  return language === 'fr'
    ? frenchChapterById[chapterId]?.title ?? chapterTitleById[chapterId] ?? chapterId
    : chapterTitleById[chapterId] ?? chapterId
}

/**
 * Build the canonical deep link for a lesson/chapter id:
 * `/discipline/:slug/:chapterId/:lessonId` (chapterId === lessonId by design).
 * Returns null when the id is not present in the manifest, so callers can fall
 * back to a discipline link instead of producing a dead route.
 */
export function lessonRoute(lessonId: string, fallbackSlug?: string): string | null {
  const slug = disciplineByChapterId[lessonId] ?? fallbackSlug
  if (!slug) return null
  return `/discipline/${slug}/${lessonId}/${lessonId}`
}

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

export function loadChapter(
  discipline: string,
  chapterId: string,
  language: Language = 'en'
): Promise<RawChapter> {
  const localizedKey = `../content/${discipline}/${chapterId}.${language}.json`
  const defaultKey = `../content/${discipline}/${chapterId}.json`
  const key = language === 'fr' && chapterModules[localizedKey] ? localizedKey : defaultKey
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
    return dedupeImages(
      topics.length ? topics : [{ id: 't-0', title: 'Contenu the lesson', blocks: [] }]
    )
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
  return dedupeImages(topics)
}

/**
 * Collapse exact duplicate image blocks (same src AND same caption) within a
 * lesson, keeping the first occurrence.
 *
 * The extractor can emit the same embedded figure once per source page, so a
 * single lesson would otherwise render an identical image (often with an empty
 * caption) many times. Distinct references — the same file with a different
 * caption — are preserved, and no content is invented or rewritten.
 */
function dedupeImages(topics: Topic[]): Topic[] {
  const seen = new Set<string>()
  return topics.map((topic) => {
    if (!topic.blocks) return topic
    const blocks = topic.blocks.filter((b) => {
      if (b.type !== 'image') return true
      const key = `${b.src}::${b.caption ?? ''}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    return { ...topic, blocks }
  })
}
