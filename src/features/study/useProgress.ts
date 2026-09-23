import { useMemo } from 'react'
import { disciplines, countLessons, getAllLessons } from '@/data/disciplines'
import type { Discipline } from '@/data/types'
import { useStudy } from '@/features/study/StudyContext'

/** Completion progress (0–100) for a discipline based on its lesson count. */
export function useDisciplineProgress(discipline: Discipline | undefined) {
  const { completedLessons } = useStudy()
  return useMemo(() => {
    if (!discipline) return 0
    const lessons = getAllLessons(discipline)
    if (lessons.length === 0) return 0
    const done = lessons.filter(({ lesson }) => completedLessons.includes(lesson.id)).length
    return Math.round((done / lessons.length) * 100)
  }, [discipline, completedLessons])
}

/** Overall course progress across all six disciplines. */
export function useCourseProgress() {
  const { completedLessons } = useStudy()
  return useMemo(() => {
    const total = disciplines.reduce((acc, d) => acc + countLessons(d), 0)
    if (total === 0) return { total: 0, completed: 0, percent: 0 }
    const completed = disciplines
      .flatMap((d) => getAllLessons(d))
      .filter(({ lesson }) => completedLessons.includes(lesson.id)).length
    return { total, completed, percent: Math.round((completed / total) * 100) }
  }, [completedLessons])
}
