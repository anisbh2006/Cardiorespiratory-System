import { Link, Navigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, BookOpen, Move3d } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { AwaitingContent } from '@/components/medical/AwaitingContent'
import { getDiscipline, countLessons } from '@/data/disciplines'
import { getDisciplineIcon } from '@/data/icons'
import { useDisciplineProgress } from '@/features/study/useProgress'
import { useStudy } from '@/features/study/StudyContext'

const anatomyCta: Record<string, { to: string; label: string }> = {
  'anatomie-cardiovasculaire': { to: '/anatomy?system=cardiovascular', label: 'Open the heart in 3D' },
  'anatomie-respiratoire': { to: '/anatomy?system=respiratory', label: 'Ouvrir l\'appareil respiratoire en 3D' },
  histologie: { to: '/histologie', label: 'Ouvrir le visualiseur d\'histologie' },
  biophysique: { to: '/biophysique', label: 'Ouvrir l\'atelier de biophysique' },
  'physiologie-cardiovasculaire': { to: '/physiologie?system=cardiovascular', label: 'Open visualizations' },
  'physiologie-respiratoire': { to: '/physiologie?system=respiratory', label: 'Open visualizations' },
}

export default function DisciplinePage() {
  const { slug } = useParams<{ slug: string }>()
  const discipline = slug ? getDiscipline(slug) : undefined
  const progress = useDisciplineProgress(discipline)
  const { completedLessons } = useStudy()

  if (!discipline) return <Navigate to="/" replace />

  const Icon = getDisciplineIcon(discipline.icon)
  const lessonCount = countLessons(discipline)
  const cta = anatomyCta[discipline.id]

  return (
    <div className="pt-14">
      {/* Header */}
      <header className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/4 h-64 w-64 rounded-full bg-primary/10 blur-[110px]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 py-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <Link
              to="/"
              className="text-xs font-medium uppercase tracking-[0.2em] text-faint transition-colors hover:text-primary"
            >
              ← Toutes les disciplines
            </Link>
            <div className="mt-5 flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
                <Icon className="h-6 w-6" />
              </span>
              <div>
                <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {discipline.titleFr}
                </h1>
                <p className="text-sm font-medium uppercase tracking-wider text-faint">
                  {discipline.titleEn}
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">{discipline.tagline}</p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Badge variant="secondary">
                <BookOpen className="mr-1 h-3 w-3" />
                {discipline.chapters.length} chapitres · {lessonCount} leçons
              </Badge>
              <Badge>Progression : {progress}%</Badge>
              {cta && (
                <Link to={cta.to}>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Move3d className="h-3.5 w-3.5" /> {cta.label}
                  </Button>
                </Link>
              )}
            </div>
            <Progress value={progress} className="mt-4 max-w-md" />
          </motion.div>
        </div>
      </header>

      {/* Chapters */}
      <main className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="mb-6 font-mono text-[11px] uppercase tracking-[0.25em] text-primary">
          Chapitres
        </h2>

        {discipline.chapters.length === 0 ? (
          <AwaitingContent
            title={`Chapitres de « ${discipline.titleFr} » en attente d'intégration`}
            description="Les noms et contenus exacts des chapitres proviendront des fichiers de lecture fournis. Aucun chapitre n'est inventé en l'absence du matériel source (spécification : « Do not invent chapter names if they are not present in the source material »)."
          />
        ) : (
          <div className="space-y-4">
            {discipline.chapters.map((chapter, i) => (
              <motion.div
                key={chapter.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="rounded-xl border border-border bg-surface p-5 transition-[border-color,box-shadow] duration-300 hover:border-border-strong hover:shadow-[0_8px_28px_rgba(0,0,0,0.28)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-primary">
                      {chapter.kind === 'td' ? 'TD' : String(chapter.number).padStart(2, '0')}
                    </span>
                    <h3 className="font-serif text-lg font-semibold text-foreground">
                      {chapter.title}
                    </h3>
                  </div>
                  {chapter.status === 'awaiting-source' && (
                    <Badge variant="secondary">En attente</Badge>
                  )}
                </div>
                {chapter.summary && (
                  <p className="mt-2 text-sm text-muted">{chapter.summary}</p>
                )}
                <div className="mt-4 space-y-1.5">
                  {chapter.lessons.map((lesson) => {
                    const done = completedLessons.includes(lesson.id)
                    return (
                      <Link
                        key={lesson.id}
                        to={`/discipline/${discipline.slug}/${chapter.id}/${lesson.id}`}
                        className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted transition-colors hover:bg-elevated hover:text-foreground"
                      >
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${done ? 'bg-success' : 'bg-border-strong'}`}
                        />
                        <span className="truncate">{lesson.title}</span>
                        <ArrowRight className="ml-auto h-3.5 w-3.5 shrink-0 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
                      </Link>
                    )
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
