import type { Chapter, CourseMeta, Discipline, Lesson } from './types'
import { manifest } from './contentLoader'

export const courseMeta: CourseMeta = {
  code: 'UEI / VEI 01',
  titleEn: 'Cardiorespiratory System',
  subtitle: 'Cardiorespiratory System and Hematopoietic Organs — Medical Student Learning Platform',
}

/**
 * Chapters are derived from the generated content manifest, which in turn is
 * extracted verbatim from the supplied course files. Chapter titles and section
 * names therefore always originate from the source material — nothing is
 * invented here (specification: "Do not invent chapter names if they are not
 * present in the source material").
 *
 * Each source file maps to one Chapter holding a single Lesson (the lecture or
 * TD itself); the lesson's topics are built on demand from the chapter JSON.
 */
function chaptersFor(disciplineId: string): Chapter[] {
  return manifest
    .filter((m) => m.discipline === disciplineId)
    .map<Chapter>((m) => {
      const number = Number.parseInt(m.number, 10)
      const lesson: Lesson = {
        id: m.chapterId,
        title: m.title,
        status: 'ready',
        summary: m.kind === 'td' ? 'Séance de travaux dirigés.' : undefined,
      }
      return {
        id: m.chapterId,
        number: Number.isFinite(number) ? number : 90,
        title: m.title,
        status: 'ready',
        kind: m.kind === 'td' ? 'td' : 'cours',
        lessons: [lesson],
      }
    })
    .sort((a, b) => a.number - b.number || a.id.localeCompare(b.id))
}

/**
 * The six disciplines of UEI/VEI 01.
 *
 * Titles are exactly as supplied in the project specification.
 * Chapters and lessons are intentionally empty until the course files are
 * provided — chapter names must come from the source material and must
 * never be invented (see project specification, "COURSE ARCHITECTURE").
 */
export const disciplines: Discipline[] = [
  {
    id: 'anatomie-cardiovasculaire',
    slug: 'anatomie-cardiovasculaire',
    titleFr: 'Anatomie cardiovasculaire',
    titleEn: 'Cardiovascular Anatomy',
    icon: 'Heart',
    tagline:
      "Morphologie et structure du cœur et des grands vaisseaux — à partir du contenu du cours fourni.",
    chapters: chaptersFor('anatomie-cardiovasculaire'),
  },
  {
    id: 'anatomie-respiratoire',
    slug: 'anatomie-respiratoire',
    titleFr: 'Anatomie respiratoire',
    titleEn: 'Respiratory Anatomy',
    icon: 'Wind',
    tagline:
      "Poumons, trachée, bronches et cavité thoracique — à partir du contenu du cours fourni.",
    chapters: chaptersFor('anatomie-respiratoire'),
  },
  {
    id: 'biophysique',
    slug: 'biophysique',
    titleFr: 'Biophysique',
    titleEn: 'Biophysics',
    icon: 'Atom',
    tagline:
      "Principes physiques appliqués aux systèmes cardiorespiratoires — équations et diagrammes du cours.",
    chapters: chaptersFor('biophysique'),
  },
  {
    id: 'histologie',
    slug: 'histologie',
    titleFr: 'Histologie',
    titleEn: 'Histology',
    icon: 'Microscope',
    tagline:
      "Étude microscopique des tissus cardiorespiratoires — imagerie histologique fournie.",
    chapters: chaptersFor('histologie'),
  },
  {
    id: 'physiologie-cardiovasculaire',
    slug: 'physiologie-cardiovasculaire',
    titleFr: 'Physiologie cardiovasculaire',
    titleEn: 'Cardiovascular Physiology',
    icon: 'Activity',
    tagline:
      "Cycle cardiaque, hémodynamique et activité électrique — visualisations basées sur le cours.",
    chapters: chaptersFor('physiologie-cardiovasculaire'),
  },
  {
    id: 'physiologie-respiratoire',
    slug: 'physiologie-respiratoire',
    titleFr: 'Physiologie respiratoire',
    titleEn: 'Respiratory Physiology',
    icon: 'AirVent',
    tagline:
      "Ventilation, échanges gazeux et mécanique pulmonaire — visualisations basées sur le cours.",
    chapters: chaptersFor('physiologie-respiratoire'),
  },
]

export function getDiscipline(slug: string): Discipline | undefined {
  return disciplines.find((d) => d.slug === slug)
}

export function countLessons(discipline: Discipline): number {
  return discipline.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0)
}

export function getAllLessons(discipline: Discipline) {
  return discipline.chapters.flatMap((ch) =>
    ch.lessons.map((lesson) => ({ discipline, chapter: ch, lesson }))
  )
}
