import * as React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, BookOpen, Clock, Layers, Move3d, PlayCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { lectureeMeta, disciplines, countLessons, getDiscipline } from '@/data/disciplines'
import { lessonRoute } from '@/data/contentLoader'
import { getDisciplineIcon } from '@/data/icons'
import { useStudy } from '@/features/study/StudyContext'
import { useCourseProgress, useDisciplineProgress } from '@/features/study/useProgress'
import { useLanguage } from '@/context/LanguageContext'

const HeroHeart = React.lazy(() =>
  import('@/features/three/AnatomyViewer').then((m) => ({ default: m.HeroHeart }))
)

function DisciplineCard({ index, slug }: { index: number; slug: string }) {
  const { t } = useLanguage()
  const discipline = disciplines[index]
  const progress = useDisciplineProgress(discipline)
  const Icon = getDisciplineIcon(discipline.icon)
  const lessons = countLessons(discipline)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08, ease: 'easeOut' }}
    >
      <Link
        to={`/discipline/${slug}`}
        className="group flex h-full flex-col rounded-xl border border-border bg-surface p-6 transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
      >
        <div className="flex items-start justify-between">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-primary/20 bg-primary/8 text-primary transition-colors duration-300 group-hover:border-primary/35 group-hover:bg-primary/15">
            <Icon className="h-5 w-5" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        <h3 className="mt-4 font-serif text-lg font-semibold tracking-tight text-foreground">
          {discipline.titleFr}
        </h3>
        <p className="text-xs font-medium uppercase tracking-wider text-faint">
          {discipline.titleEn}
        </p>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{discipline.tagline}</p>

        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <Layers className="h-3 w-3 text-faint" />
              {discipline.chapters.length} chapitre{discipline.chapters.length > 1 ? 's' : ''}
              <span className="text-faint">·</span>
              <BookOpen className="h-3 w-3 text-faint" />
              {lessons} lesson{lessons > 1 ? 's' : ''}
            </span>
            <span className="font-mono text-primary">{progress}%</span>
          </div>
          <Progress value={progress} className="h-1" />
        </div>

        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary/80 transition-colors duration-300 group-hover:text-primary">
          {t('home.openDiscipline')}
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </Link>
    </motion.div>
  )
}

/**
 * "Continue where you left off" card. Only rendered once the student has opened
 * at least one lesson; deep-links straight back into it and shows overall lecturee
 * progress. Purely derived from locally-stored study state — no content invented.
 */
function ResumeCard() {
  const { t } = useLanguage()
  const { recentlyViewed } = useStudy()
  const lecturee = useCourseProgress()
  if (recentlyViewed.length === 0) return null

  const last = recentlyViewed[0]
  const to = lessonRoute(last.lessonId, last.disciplineSlug) ?? `/discipline/${last.disciplineSlug}`
  const disciplineTitle = getDiscipline(last.disciplineSlug)?.titleFr

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.25, ease: 'easeOut' }}
      className="mt-8 max-w-md"
    >
      <Link
        to={to}
        className="group flex items-center gap-4 rounded-xl border border-border bg-surface/80 p-4 backdrop-blur transition-[border-color,box-shadow] duration-300 hover:border-primary/40 hover:shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary/15">
          <PlayCircle className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
            <Clock className="h-3 w-3" /> {t('home.resumeStudying')}
          </span>
          <span className="mt-1 block truncate text-sm font-medium text-foreground">
            {last.title}
          </span>
          {disciplineTitle && (
            <span className="block truncate text-[11px] text-muted">{disciplineTitle}</span>
          )}
          <span className="mt-2 flex items-center gap-2">
            <Progress value={lecturee.percent} className="h-1 flex-1" />
            <span className="shrink-0 font-mono text-[10px] text-primary">{lecturee.percent}%</span>
          </span>
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-faint transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-primary" />
      </Link>
    </motion.div>
  )
}

export default function HomePage() {
  const { t } = useLanguage()

  return (
    <div className="pt-14">
      {/* ================= HERO ================= */}
      <section className="relative flex min-h-[calc(100vh-3.5rem)] items-center overflow-hidden">
        {/* ambient glows — restrained, weighted toward the 3D heart */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[16%] top-1/2 h-[560px] w-[560px] -translate-y-1/2 rounded-full bg-primary/10 blur-[150px]" />
          <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-[#2a3f5f]/12 blur-[130px]" />
        </div>

        <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 px-6 py-16 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/8 px-3.5 py-1.5 text-xs font-medium text-primary">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              {lectureeMeta.code}
            </div>

            <h1 className="mt-6 font-serif text-5xl font-bold leading-[1.02] tracking-tight text-gradient sm:text-6xl xl:text-7xl">
              CARDIO
              <br />
              RESPIRATORY
              <br />
              <span className="text-gradient-red">SYSTEM</span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-relaxed text-muted">
              {t('home.blurb')}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/anatomy">
                <Button size="lg" className="gap-2">
                  <Move3d className="h-4 w-4" /> {t('home.exploreAnatomy')}
                </Button>
              </Link>
              <Link to="/discipline/anatomie-cardiovasculaire">
                <Button size="lg" variant="secondary" className="gap-2">
                  {t('home.startLearning')} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <ResumeCard />

            <div className="mt-10 flex items-center gap-6 text-xs text-faint">
              <span className="flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-primary/70" /> {t('home.sixDisciplines')}
              </span>
              <span className="flex items-center gap-1.5">
                <Move3d className="h-3.5 w-3.5 text-primary/70" /> {t('home.interactive3D')}
              </span>
              <span className="hidden items-center gap-1.5 sm:flex">
                <BookOpen className="h-3.5 w-3.5 text-primary/70" /> {t('home.tracking')}
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: 'easeOut' }}
            className="relative h-[420px] sm:h-[520px] lg:h-[600px]"
          >
            <React.Suspense
              fallback={
                <div className="flex h-full items-center justify-center">
                  <Skeleton className="h-72 w-72 rounded-full" />
                </div>
              }
            >
              <HeroHeart className="h-full w-full" />
            </React.Suspense>
          </motion.div>
        </div>
      </section>

      {/* ================= DISCIPLINES ================= */}
      <section className="relative mx-auto max-w-7xl px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-primary">
            {t('home.allDisciplinesTitle')}
          </span>
          <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t('home.allDisciplinesSubtitle')}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
            {t('home.allDisciplinesDescription')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {disciplines.map((d, i) => (
            <DisciplineCard key={d.id} index={i} slug={d.slug} />
          ))}
        </div>
      </section>
    </div>
  )
}
