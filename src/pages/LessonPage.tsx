import * as React from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bookmark, Check, ChevronLeft, ChevronRight, Move3d } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { LessonContent } from '@/components/medical/LessonContent'
import { getDiscipline, getAllLessons } from '@/data/disciplines'
import { getDisciplineIcon } from '@/data/icons'
import type { Chapter, Topic } from '@/data/types'
import { useStudy } from '@/features/study/StudyContext'
import { cn } from '@/lib/utils'

const MiniAnatomyViewer = React.lazy(() =>
  import('@/features/three/AnatomyViewer').then((m) => ({ default: m.AnatomyViewer }))
)

/** Chapter label: "TD" for travaux dirigés, zero-padded number for lectures. */
function chapterLabel(ch: Chapter): string {
  return ch.kind === 'td' ? 'TD' : `Chapitre ${String(ch.number).padStart(2, '0')}`
}

export default function LessonPage() {
  const { slug, chapterId, lessonId } = useParams<{
    slug: string
    chapterId: string
    lessonId: string
  }>()
  const discipline = slug ? getDiscipline(slug) : undefined
  const chapter = discipline?.chapters.find((c) => c.id === chapterId)
  const lesson = chapter?.lessons.find((l) => l.id === lessonId)

  const flat = discipline ? getAllLessons(discipline) : []
  const flatIndex = flat.findIndex((f) => f.lesson.id === lessonId)
  const prev = flatIndex > 0 ? flat[flatIndex - 1] : undefined
  const next = flatIndex >= 0 && flatIndex < flat.length - 1 ? flat[flatIndex + 1] : undefined

  const { isCompleted, isBookmarked, toggleComplete, toggleBookmark, recordView } = useStudy()

  const [topics, setTopics] = React.useState<Topic[]>([])
  React.useEffect(() => {
    setTopics([])
  }, [lessonId])

  React.useEffect(() => {
    if (discipline && lesson) {
      recordView({
        lessonId: lesson.id,
        title: lesson.title,
        disciplineSlug: discipline.slug,
        at: Date.now(),
      })
    }
    window.scrollTo(0, 0)
  }, [discipline, lesson, recordView])

  if (!discipline) return <Navigate to="/" replace />
  if (!chapter || !lesson) return <Navigate to={`/discipline/${discipline.slug}`} replace />

  const Icon = getDisciplineIcon(discipline.icon)
  const completed = isCompleted(lesson.id)
  const bookmarked = isBookmarked(lesson.id)

  return (
    <div className="pt-14">
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-0 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_290px]">
        {/* ================= LEFT: course navigation ================= */}
        <aside className="hidden border-r border-border lg:block">
          <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto p-4">
            <Link
              to={`/discipline/${discipline.slug}`}
              className="group flex items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-elevated"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-foreground">
                  {discipline.titleFr}
                </span>
                <span className="block text-[10px] uppercase tracking-wider text-faint">
                  Discipline
                </span>
              </span>
            </Link>

            <Separator className="my-3" />

            <nav className="space-y-4">
              {discipline.chapters.map((ch) => (
                <div key={ch.id}>
                  <div
                    className={cn(
                      'px-2 font-mono text-[10px] uppercase tracking-[0.2em]',
                      ch.id === chapter.id ? 'text-primary' : 'text-faint'
                    )}
                  >
                    {chapterLabel(ch)} · {ch.title}
                  </div>
                  <div className="mt-1.5 space-y-0.5">
                    {ch.lessons.map((l) => {
                      const active = l.id === lesson.id
                      const done = isCompleted(l.id)
                      return (
                        <Link
                          key={l.id}
                          to={`/discipline/${discipline.slug}/${ch.id}/${l.id}`}
                          className={cn(
                            'flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] transition-colors',
                            active
                              ? 'bg-primary/10 font-medium text-primary'
                              : 'text-muted hover:bg-elevated hover:text-foreground'
                          )}
                        >
                          <span
                            className={cn(
                              'h-1.5 w-1.5 shrink-0 rounded-full',
                              done ? 'bg-success' : active ? 'bg-primary' : 'bg-border-strong'
                            )}
                          />
                          <span className="truncate">{l.title}</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* ================= CENTER: lesson content ================= */}
        <main className="min-w-0 px-5 py-8 sm:px-10">
          <motion.article
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mx-auto max-w-3xl"
          >
            <div className="flex flex-wrap items-center gap-2 text-xs text-faint">
              <Link to="/" className="hover:text-primary">UEI/VEI 01</Link>
              <span>/</span>
              <Link to={`/discipline/${discipline.slug}`} className="hover:text-primary">
                {discipline.titleFr}
              </Link>
              <span>/</span>
              <span className="text-muted">{chapterLabel(chapter)}</span>
            </div>

            <h1 className="mt-4 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {lesson.title}
            </h1>
            {lesson.summary && (
              <p className="mt-3 text-base leading-relaxed text-muted">{lesson.summary}</p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-2">
              {lesson.status === 'awaiting-source' && <Badge variant="secondary">Contenu en attente</Badge>}
              {completed && <Badge variant="success">Terminée</Badge>}
              <Button
                size="sm"
                variant={bookmarked ? 'default' : 'secondary'}
                onClick={() => toggleBookmark(lesson.id)}
                className="gap-1.5"
              >
                <Bookmark className="h-3.5 w-3.5" fill={bookmarked ? 'currentColor' : 'none'} />
                {bookmarked ? 'Favori' : 'Ajouter aux favoris'}
              </Button>
            </div>

            <Separator className="my-8" />

            <LessonContent
              key={lesson.id}
              discipline={discipline.slug}
              chapterId={lesson.id}
              lessonTitle={lesson.title}
              onTopics={setTopics}
            />

            {/* Prev / Next / Complete */}
            <div className="mt-14 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center">
              {prev ? (
                <Link
                  to={`/discipline/${discipline.slug}/${prev.chapter.id}/${prev.lesson.id}`}
                  className="group flex flex-1 items-center gap-2 rounded-lg border border-border bg-surface p-3 transition-colors hover:border-primary/40"
                >
                  <ChevronLeft className="h-4 w-4 text-muted transition-transform group-hover:-translate-x-0.5" />
                  <span className="min-w-0">
                    <span className="block text-[10px] uppercase tracking-wider text-faint">Précédent</span>
                    <span className="block truncate text-sm font-medium text-foreground">{prev.lesson.title}</span>
                  </span>
                </Link>
              ) : (
                <span className="flex-1" />
              )}

              <Button
                variant={completed ? 'secondary' : 'default'}
                onClick={() => toggleComplete(lesson.id)}
                className="gap-2"
              >
                <Check className="h-4 w-4" />
                {completed ? 'Leçon terminée' : 'Marquer comme terminée'}
              </Button>

              {next ? (
                <Link
                  to={`/discipline/${discipline.slug}/${next.chapter.id}/${next.lesson.id}`}
                  className="group flex flex-1 items-center justify-end gap-2 rounded-lg border border-border bg-surface p-3 text-right transition-colors hover:border-primary/40"
                >
                  <span className="min-w-0">
                    <span className="block text-[10px] uppercase tracking-wider text-faint">Suivant</span>
                    <span className="block truncate text-sm font-medium text-foreground">{next.lesson.title}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-0.5" />
                </Link>
              ) : (
                <span className="flex-1" />
              )}
            </div>
          </motion.article>
        </main>

        {/* ================= RIGHT: TOC / tools / 3D ================= */}
        <aside className="hidden xl:block">
          <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] space-y-5 overflow-y-auto border-l border-border p-4">
            {/* Table of contents */}
            {topics.length > 0 && (
              <div>
                <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
                  Table des matières
                </h4>
                <nav className="mt-2 space-y-1">
                  {topics.map((t) => (
                    <a
                      key={t.id}
                      href={`#${t.id}`}
                      className="block rounded-md px-2 py-1 text-[13px] text-muted transition-colors hover:bg-elevated hover:text-foreground"
                    >
                      {t.title}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {/* 3D viewer when relevant */}
            {lesson.relatedStructureIds && lesson.relatedStructureIds.length > 0 && (
              <div>
                <h4 className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
                  <Move3d className="h-3 w-3" /> Anatomie 3D
                </h4>
                <React.Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-overlay" />}>
                  <MiniAnatomyViewer
                    compact
                    className="h-48"
                    selectedId={null}
                    onSelect={() => {}}
                    showLabels={false}
                  />
                </React.Suspense>
              </div>
            )}

            {/* Study tools */}
            <div>
              <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
                Outils d'étude
              </h4>
              <div className="mt-2 space-y-2">
                <div className="rounded-lg border border-border bg-surface p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted">Progression du chapitre</span>
                    <span className="font-mono text-primary">
                      {chapter.lessons.filter((l) => isCompleted(l.id)).length}/{chapter.lessons.length}
                    </span>
                  </div>
                  <Progress
                    value={
                      chapter.lessons.length
                        ? (chapter.lessons.filter((l) => isCompleted(l.id)).length /
                            chapter.lessons.length) *
                          100
                        : 0
                    }
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

            {/* Related lessons */}
            {lesson.relatedLessonIds && lesson.relatedLessonIds.length > 0 && (
              <div>
                <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
                  Concepts liés
                </h4>
                <div className="mt-2 space-y-1">
                  {flat
                    .filter((f) => lesson.relatedLessonIds?.includes(f.lesson.id))
                    .map((f) => (
                      <Link
                        key={f.lesson.id}
                        to={`/discipline/${discipline.slug}/${f.chapter.id}/${f.lesson.id}`}
                        className="block rounded-md px-2 py-1.5 text-[13px] text-muted transition-colors hover:bg-elevated hover:text-foreground"
                      >
                        {f.lesson.title}
                      </Link>
                    ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
