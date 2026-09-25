import * as React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, BookOpen, Layers, Move3d } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { courseMeta, disciplines, countLessons } from '@/data/disciplines'
import { getDisciplineIcon } from '@/data/icons'
import { useDisciplineProgress } from '@/features/study/useProgress'

const HeroHeart = React.lazy(() =>
  import('@/features/three/AnatomyViewer').then((m) => ({ default: m.HeroHeart }))
)

function DisciplineCard({ index, slug }: { index: number; slug: string }) {
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
              {lessons} leçon{lessons > 1 ? 's' : ''}
            </span>
            <span className="font-mono text-primary">{progress}%</span>
          </div>
          <Progress value={progress} className="h-1" />
        </div>

        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary/80 transition-colors duration-300 group-hover:text-primary">
          Ouvrir la discipline
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </Link>
    </motion.div>
  )
}

export default function HomePage() {
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
              {courseMeta.code}
            </div>

            <h1 className="mt-6 font-serif text-5xl font-bold leading-[1.02] tracking-tight text-gradient sm:text-6xl xl:text-7xl">
              CARDIO
              <br />
              RESPIRATORY
              <br />
              <span className="text-gradient-red">SYSTEM</span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-relaxed text-muted">
              UEI / VEI 01 — Medical Student Learning Platform. Système cardiorespiratoire et
              organes hématopoïétiques : anatomie, histologie, biophysique et physiologie dans
              un environnement d'apprentissage interactif et cinématique.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/anatomy">
                <Button size="lg" className="gap-2">
                  <Move3d className="h-4 w-4" /> Explore Anatomy
                </Button>
              </Link>
              <Link to="/discipline/anatomie-cardiovasculaire">
                <Button size="lg" variant="secondary" className="gap-2">
                  Start Learning <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-6 text-xs text-faint">
              <span className="flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-primary/70" /> 6 disciplines
              </span>
              <span className="flex items-center gap-1.5">
                <Move3d className="h-3.5 w-3.5 text-primary/70" /> Laboratoire 3D interactif
              </span>
              <span className="hidden items-center gap-1.5 sm:flex">
                <BookOpen className="h-3.5 w-3.5 text-primary/70" /> Suivi de progression
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
            Les six disciplines
          </span>
          <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Un parcours médical complet
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
            Chaque discipline sera structurée en chapitres et leçons à partir du matériel de
            cours fourni — texte, images, diagrammes et documents médicaux.
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
