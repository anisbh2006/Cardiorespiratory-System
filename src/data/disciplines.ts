import type { Chapter, CourseMeta, Discipline, Lesson } from './types'
import { manifest } from './contentLoader'

export const lectureeMeta: CourseMeta = {
  code: 'UEI / VEI 01',
  titleEn: 'Cardiorespiratory System',
  subtitle: 'Cardiorespiratory System and Hematopoietic Organs — Medical Student Learning Platform',
}

/**
 * Chapters are derived from the generated content manifest, which in turn is
 * extracted verbatim from the supplied lecturee files. Chapter titles and section
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
        summary: m.kind === 'td' ? 'Tutorial session.' : undefined,
      }
      return {
        id: m.chapterId,
        number: Number.isFinite(number) ? number : 90,
        title: m.title,
        status: 'ready',
        kind: m.kind === 'td' ? 'td' : 'lecture',
        lessons: [lesson],
      }
    })
    .sort((a, b) => a.number - b.number || a.id.localeCompare(b.id))
}

/**
 * The six disciplines of UEI/VEI 01.
 *
 * Titles are exactly as supplied in the project specification.
 * Chapters and lessons are intentionally empty until the lecturee files are
 * provided — chapter names must come from the source material and must
 * never be invented (see project specification, "COURSE ARCHITECTURE").
 */
export const disciplines: Discipline[] = [
  {
    id: 'anatomie-cardiovasculaire',
    slug: 'anatomie-cardiovasculaire',
    titleFr: 'Cardiovascular Anatomy',
    titleEn: 'Cardiovascular Anatomy',
    icon: 'Heart',
    tagline:
      "Morphologie et structure du heart et des grands vaisseaux — à partir du contenu the lesson fourni.",
    chapters: chaptersFor('anatomie-cardiovasculaire'),
  },
  {
    id: 'anatomie-respiratoire',
    slug: 'anatomie-respiratoire',
    titleFr: 'Respiratory Anatomy',
    titleEn: 'Respiratory Anatomy',
    icon: 'Wind',
    tagline:
      "Lungs, trachea, bronchi, and thoracic cavity — à partir du contenu the lesson fourni.",
    chapters: chaptersFor('anatomie-respiratoire'),
  },
  {
    id: 'biophysique',
    slug: 'biophysique',
    titleFr: 'Biophysics',
    titleEn: 'Biophysics',
    icon: 'Atom',
    tagline:
      "Physical principles applied to cardiorespiratory systems — lesson equations and diagrams.",
    chapters: chaptersFor('biophysique'),
  },
  {
    id: 'histologie',
    slug: 'histologie',
    titleFr: 'Histology',
    titleEn: 'Histology',
    icon: 'Microscope',
    tagline:
      "Microscopic study of cardiorespiratory tissuees, with supplied histology images.",
    chapters: chaptersFor('histologie'),
  },
  {
    id: 'physiologie-cardiovasculaire',
    slug: 'physiologie-cardiovasculaire',
    titleFr: 'Cardiovascular Physiology',
    titleEn: 'Cardiovascular Physiology',
    icon: 'Activity',
    tagline:
      "Cycle cardiaque, hémodynamique et electrical activity — visualisations basées sur le lecture.",
    chapters: chaptersFor('physiologie-cardiovasculaire'),
  },
  {
    id: 'physiologie-respiratoire',
    slug: 'physiologie-respiratoire',
    titleFr: 'Respiratory Physiology',
    titleEn: 'Respiratory Physiology',
    icon: 'AirVent',
    tagline:
      "Ventilation, échanges gazeux et mécanique pulmonaire — visualisations basées sur le lecture.",
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
