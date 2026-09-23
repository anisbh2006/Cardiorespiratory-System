import { disciplines, getAllLessons } from '@/data/disciplines'
import { anatomyStructures } from '@/data/anatomy'
import { manifest } from '@/data/contentLoader'
import type { ContentBlock, Topic } from '@/data/types'

/** Section headings per chapter, straight from the generated manifest. */
const topicsByChapter = new Map<string, string[]>(
  manifest.map((m) => [m.chapterId, m.topics])
)

export interface SearchEntry {
  id: string
  type: 'discipline' | 'chapter' | 'lesson' | 'topic' | 'structure' | 'term'
  title: string
  disciplineSlug: string
  disciplineTitle: string
  chapterTitle?: string
  lessonId?: string
  preview: string
  /** Lowercased haystack for matching. */
  haystack: string
}

function blocksToText(blocks: ContentBlock[] | undefined): string {
  if (!blocks) return ''
  return blocks
    .map((b) => {
      switch (b.type) {
        case 'heading':
        case 'paragraph':
        case 'definition':
        case 'note':
          return b.type === 'definition' ? `${b.term} ${b.text}` : b.text
        case 'list':
          return b.items.join(' ')
        case 'table':
          return [...b.headers, ...b.rows.flat()].join(' ')
        case 'equation':
          return [b.text, ...(b.variables?.map((v) => `${v.symbol} ${v.meaning}`) ?? [])].join(' ')
        case 'expandable':
          return `${b.title} ${blocksToText(b.blocks)}`
        default:
          return ''
      }
    })
    .join(' ')
}

function topicsToList(topics: Topic[] | undefined): Topic[] {
  if (!topics) return []
  return topics.flatMap((t) => [t, ...topicsToList(t.subtopics)])
}

function excerpt(text: string, max = 140): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  return clean.length > max ? `${clean.slice(0, max)}…` : clean
}

/** Index built once from the course data layer. */
export const searchIndex: SearchEntry[] = (() => {
  const entries: SearchEntry[] = []

  for (const d of disciplines) {
    entries.push({
      id: `d-${d.id}`,
      type: 'discipline',
      title: d.titleFr,
      disciplineSlug: d.slug,
      disciplineTitle: d.titleFr,
      preview: d.tagline,
      haystack: `${d.titleFr} ${d.titleEn} ${d.tagline}`.toLowerCase(),
    })

    for (const ch of d.chapters) {
      entries.push({
        id: `ch-${ch.id}`,
        type: 'chapter',
        title: `Chapitre ${String(ch.number).padStart(2, '0')} — ${ch.title}`,
        disciplineSlug: d.slug,
        disciplineTitle: d.titleFr,
        preview: ch.summary ?? '',
        haystack: `${ch.title} ${ch.summary ?? ''}`.toLowerCase(),
      })
    }

    for (const { chapter, lesson } of getAllLessons(d)) {
      entries.push({
        id: `l-${lesson.id}`,
        type: 'lesson',
        title: lesson.title,
        disciplineSlug: d.slug,
        disciplineTitle: d.titleFr,
        chapterTitle: chapter.title,
        lessonId: lesson.id,
        preview: lesson.summary ?? '',
        haystack: `${lesson.title} ${lesson.summary ?? ''}`.toLowerCase(),
      })

      for (const topic of topicsToList(lesson.topics)) {
        const text = blocksToText(topic.blocks)
        entries.push({
          id: `t-${topic.id}`,
          type: 'topic',
          title: topic.title,
          disciplineSlug: d.slug,
          disciplineTitle: d.titleFr,
          chapterTitle: chapter.title,
          lessonId: lesson.id,
          preview: excerpt(text),
          haystack: `${topic.title} ${text}`.toLowerCase(),
        })
      }

      // Section headings extracted from the source files (manifest), so search
      // reaches real course concepts without loading every chapter's blocks.
      const headings = topicsByChapter.get(lesson.id) ?? []
      headings.forEach((heading, i) => {
        entries.push({
          id: `h-${lesson.id}-${i}`,
          type: 'topic',
          title: heading,
          disciplineSlug: d.slug,
          disciplineTitle: d.titleFr,
          chapterTitle: chapter.title,
          lessonId: lesson.id,
          preview: `${chapter.title} — ${excerpt(heading, 80)}`,
          haystack: `${heading} ${chapter.title}`.toLowerCase(),
        })
      })
    }
  }

  for (const s of anatomyStructures) {
    entries.push({
      id: `s-${s.id}`,
      type: 'structure',
      title: s.nameFr,
      disciplineSlug: s.system === 'cardiovascular' ? 'anatomie-cardiovasculaire' : 'anatomie-respiratoire',
      disciplineTitle: s.system === 'cardiovascular' ? 'Anatomie cardiovasculaire' : 'Anatomie respiratoire',
      preview: s.nameEn ? `${s.nameEn}${s.definition ? ` — ${excerpt(s.definition)}` : ''}` : (s.definition ? excerpt(s.definition) : ''),
      haystack: `${s.nameFr} ${s.nameEn ?? ''} ${s.definition ?? ''} ${s.function ?? ''}`.toLowerCase(),
    })
  }

  return entries
})()

export function search(query: string): SearchEntry[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const terms = q.split(/\s+/)

  const scored = searchIndex
    .map((entry) => {
      let score = 0
      for (const term of terms) {
        if (!entry.haystack.includes(term)) {
          score = -1
          break
        }
        if (entry.title.toLowerCase().includes(term)) score += 10
        else score += 1
      }
      return { entry, score }
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)

  return scored.slice(0, 30).map((r) => r.entry)
}
