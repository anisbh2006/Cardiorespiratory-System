import type { Chapter, CourseMeta, Discipline, Lesson } from './types'
import { manifest } from './contentLoader'
import type { Language } from '@/i18n'

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
    titleFr: 'Anatomie cardiovasculaire',
    titleEn: 'Cardiovascular Anatomy',
    taglineFr: 'Morphologie et structure du cœur et des grands vaisseaux.',
    taglineEn: 'Morphology and structure of the heart and great vessels.',
    icon: 'Heart',
    chapters: chaptersFor('anatomie-cardiovasculaire'),
  },
  {
    id: 'anatomie-respiratoire',
    slug: 'anatomie-respiratoire',
    titleFr: 'Anatomie respiratoire',
    titleEn: 'Respiratory Anatomy',
    taglineFr: 'Anatomie des poumons, de la trachée, des bronches et de la cavité thoracique.',
    taglineEn: 'Anatomy of the lungs, trachea, bronchi, and thoracic cavity.',
    icon: 'Wind',
    chapters: chaptersFor('anatomie-respiratoire'),
  },
  {
    id: 'biophysique',
    slug: 'biophysique',
    titleFr: 'Biophysique',
    titleEn: 'Biophysics',
    taglineFr: 'Principes physiques appliqués aux systèmes cardiorespiratoires.',
    taglineEn: 'Physical principles applied to the cardiorespiratory systems.',
    icon: 'Atom',
    chapters: chaptersFor('biophysique'),
  },
  {
    id: 'histologie',
    slug: 'histologie',
    titleFr: 'Histologie',
    titleEn: 'Histology',
    taglineFr: 'Étude microscopique des tissus cardiorespiratoires à partir des images fournies.',
    taglineEn: 'Microscopic study of cardiorespiratory tissues using the supplied images.',
    icon: 'Microscope',
    chapters: chaptersFor('histologie'),
  },
  {
    id: 'physiologie-cardiovasculaire',
    slug: 'physiologie-cardiovasculaire',
    titleFr: 'Physiologie cardiovasculaire',
    titleEn: 'Cardiovascular Physiology',
    taglineFr: 'Cycle cardiaque, hémodynamique et activité électrique.',
    taglineEn: 'Cardiac cycle, hemodynamics, and electrical activity.',
    icon: 'Activity',
    chapters: chaptersFor('physiologie-cardiovasculaire'),
  },
  {
    id: 'physiologie-respiratoire',
    slug: 'physiologie-respiratoire',
    titleFr: 'Physiologie respiratoire',
    titleEn: 'Respiratory Physiology',
    taglineFr: 'Ventilation, échanges gazeux et mécanique pulmonaire.',
    taglineEn: 'Ventilation, gas exchange, and pulmonary mechanics.',
    icon: 'AirVent',
    chapters: chaptersFor('physiologie-respiratoire'),
  },
]

export function getDisciplineTitle(discipline: Discipline, language: Language): string {
  return language === 'fr' ? discipline.titleFr : discipline.titleEn
}

export function getDisciplineTagline(discipline: Discipline, language: Language): string {
  return language === 'fr' ? discipline.taglineFr : discipline.taglineEn
}

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
