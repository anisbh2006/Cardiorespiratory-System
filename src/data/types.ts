/**
 * Content schema for the UEI/VEI 01 course.
 *
 * Hierarchy: Course → Discipline → Chapter → Lesson → Topic → Subtopic
 *
 * All medical content must originate from the supplied course files.
 * Any entity whose source material has not yet been integrated carries
 * `status: 'awaiting-source'` and MUST NOT be filled with invented content.
 */

export type ContentStatus = 'ready' | 'awaiting-source'

export type ContentBlock =
  | { type: 'heading'; level: 2 | 3 | 4; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'definition'; term: string; text: string }
  | {
      type: 'note'
      variant: 'important' | 'clinical' | 'key-point'
      title?: string
      text: string
    }
  | { type: 'list'; ordered?: boolean; items: string[] }
  | { type: 'table'; caption?: string; headers: string[]; rows: string[][] }
  | { type: 'image'; src: string; caption: string; credit?: string }
  | {
      type: 'equation'
      /** Plain-text form of the equation (source of truth from course files). */
      text: string
      variables?: { symbol: string; meaning: string }[]
    }
  | { type: 'model3d'; modelId: string; caption?: string }
  | { type: 'expandable'; title: string; blocks: ContentBlock[] }

export interface Topic {
  id: string
  title: string
  blocks?: ContentBlock[]
  subtopics?: Topic[]
}

export interface Lesson {
  id: string
  title: string
  summary?: string
  status: ContentStatus
  topics?: Topic[]
  /** IDs of related lessons across disciplines. */
  relatedLessonIds?: string[]
  /** Optional 3D structure ids relevant to this lesson (opens viewer in right rail). */
  relatedStructureIds?: string[]
}

export interface Chapter {
  id: string
  number: number
  title: string
  summary?: string
  status: ContentStatus
  /** 'td' marks a travaux-dirigés session; defaults to a lecture ('cours'). */
  kind?: 'cours' | 'td'
  lessons: Lesson[]
}

export type DisciplineId =
  | 'anatomie-cardiovasculaire'
  | 'anatomie-respiratoire'
  | 'biophysique'
  | 'histologie'
  | 'physiologie-cardiovasculaire'
  | 'physiologie-respiratoire'

export interface Discipline {
  id: DisciplineId
  slug: string
  /** French title — exactly as supplied by the course. */
  titleFr: string
  titleEn: string
  /** Lucide icon name, resolved via the icon registry. */
  icon: string
  tagline: string
  chapters: Chapter[]
}

/* ------------------------------------------------------------------ */
/* Anatomy structures (names supplied in the project specification)    */
/* ------------------------------------------------------------------ */

export type StructureSystem = 'cardiovascular' | 'respiratory'

export interface AnatomyStructure {
  id: string
  system: StructureSystem
  nameFr: string
  nameEn?: string
  /** Filled exclusively from supplied course content. */
  definition?: string
  location?: string
  relations?: string
  function?: string
  /** Path to a supplied image, when available. */
  imageSrc?: string
  imageCaption?: string
  /** Link back to the course section describing this structure. */
  lessonId?: string
  /**
   * Additional course sections (same discipline) that describe this structure.
   * Used to aggregate verbatim excerpts/images in the anatomy info panel.
   */
  relatedLessonIds?: string[]
  /**
   * Verbatim source-language search keys (FR/EN) used to locate this
   * structure's passages inside the supplied course content. Search keys only
   * — never medical explanations.
   */
  searchTerms?: string[]
  status: ContentStatus
  /** GLTF model slot — set when a 3D model becomes available. */
  modelSrc?: string
}

export interface CourseMeta {
  code: string
  titleEn: string
  subtitle: string
}
