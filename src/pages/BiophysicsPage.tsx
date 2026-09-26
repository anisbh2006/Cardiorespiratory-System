import { motion } from 'framer-motion'
import { Activity, ArrowRight, Beaker, BookOpen, Gauge, Stethoscope } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { InteractiveEquation } from '@/components/biophysics/InteractiveEquation'
import { PoiseuilleLab } from '@/components/biophysics/PoiseuilleLab'
import { getDiscipline } from '@/data/disciplines'
import { getChapterTitle } from '@/data/contentLoader'
import { useDisciplineProgress } from '@/features/study/useProgress'
import { useLanguage } from '@/context/LanguageContext'

const chapterLookup = [
  { title: 'Hemodynamics and Vascular Biophysics', label: 'Fluid dynamics, pressure and viscosity', icon: Gauge },
  { title: 'Cardiac Biophysics', label: 'Pressure-time curves and pressure-volume relationships', icon: Activity },
  { title: 'Electrocardiogram', label: 'Bioelectricity, dipoles and conduction', icon: Stethoscope },
]

export default function BiophysicsPage() {
  const { t, language } = useLanguage()
  const discipline = getDiscipline('biophysique')
  const progress = useDisciplineProgress(discipline)
  const chapters = discipline?.chapters ?? []

  return (
    <div className="pt-14">
      <header className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(224,36,58,0.18),transparent_30%),radial-gradient(circle_at_left,_rgba(91,157,246,0.08),transparent_28%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-12">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
              <BookOpen className="h-3.5 w-3.5" /> {t('biophysics.title')}
            </span>

            <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <h1 className="font-serif text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
                  BIOPHYSICS
                </h1>
                <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
                  {t('biophysics.subtitle')}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Badge variant="default">{t('biophysics.badges.hemodynamics')}</Badge>
                  <Badge variant="secondary">{t('biophysics.badges.pressureVolume')}</Badge>
                  <Badge variant="secondary">{t('biophysics.badges.ecg')}</Badge>
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link to={chapters[0] ? `/discipline/biophysique/${chapters[0].id}/${chapters[0].lessons[0]?.id ?? chapters[0].id}` : '/discipline/biophysique'}>
                    <Button size="lg" className="gap-2">{t('biophysics.startLearning')}</Button>
                  </Link>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="rounded-3xl border border-border bg-surface/80 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.38)]"
              >
                <div className="rounded-2xl border border-border bg-background/60 p-4">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-faint">
                    <span>{t('biophysics.flowLab')}</span>
                    <span>{t('biophysics.cardiorespiratory')}</span>
                  </div>

                  <div className="mt-6 rounded-2xl border border-border bg-elevated/60 p-4">
                    <div className="relative mx-auto h-44 w-full max-w-sm overflow-hidden rounded-xl border border-primary/20 bg-[radial-gradient(circle_at_center,_rgba(224,36,58,0.12),_rgba(0,0,0,0.2)_60%)]">
                      <div className="absolute left-10 top-1/2 h-24 w-28 -translate-y-1/2 rounded-full border border-primary/40 bg-primary/10 blur-[1px]" />
                      <div className="absolute right-10 top-1/2 h-24 w-28 -translate-y-1/2 rounded-full border border-primary/30 bg-red-500/10" />
                      <div className="absolute left-1/2 top-1/2 h-28 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15" />
                      <div className="absolute inset-x-10 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gradient-to-r from-transparent via-primary/80 to-transparent" />
                      {[...Array(18)].map((_, index) => (
                        <motion.div
                          key={index}
                          className="absolute h-2 w-2 rounded-full bg-primary"
                          style={{ left: `${10 + index * 4}%`, top: `${50 + (index % 3) * 8}%` }}
                          animate={{ x: [0, 18, 0], opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 2.4 + index * 0.1, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      ))}
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-3">
                      <div className="rounded-lg border border-border bg-background/50 p-2">
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-faint"><Gauge className="h-3 w-3" /> Flow</div>
                        <div className="mt-2 font-mono text-lg text-foreground">1.2 L/min</div>
                      </div>
                      <div className="rounded-lg border border-border bg-background/50 p-2">
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-faint"><Activity className="h-3 w-3" /> Pressure</div>
                        <div className="mt-2 font-mono text-lg text-foreground">120 mmHg</div>
                      </div>
                      <div className="rounded-lg border border-border bg-background/50 p-2">
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-faint"><Beaker className="h-3 w-3" /> Viscosity</div>
                        <div className="mt-2 font-mono text-lg text-foreground">3.5 cP</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-6 py-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary">{t('biophysics.progress')}</p>
            <h2 className="mt-1 font-serif text-3xl font-semibold text-foreground">{t('biophysics.lab')}</h2>
          </div>
          {discipline && (
            <div className="w-full max-w-sm">
              <div className="flex justify-between text-xs text-muted">
                <span>{t('biophysics.completion')}</span>
                <span className="font-mono text-primary">{progress}%</span>
              </div>
              <Progress value={progress} className="mt-1.5" />
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {chapterLookup.map((item, index) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="rounded-xl border border-border bg-surface p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <h3 className="mt-3 text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.label}</p>
                <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">Chapter {index + 1}</div>
              </div>
            )
          })}
        </div>

        <div className="space-y-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary">{t('lesson.courseStructure')}</p>
              <h2 className="mt-1 font-serif text-3xl font-semibold text-foreground">{t('biophysics.chapterPanel')}</h2>
            </div>
          </div>

          {chapters.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface p-8 text-muted">{t('biophysics.noChapters')}</div>
          ) : (
            chapters.map((chapter, index) => (
              <motion.div
                key={chapter.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
                className="rounded-xl border border-border bg-surface p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-primary">{chapter.kind === 'td' ? 'TD' : `CH ${String(chapter.number).padStart(2, '0')}`}</span>
                    <h3 className="font-serif text-2xl font-semibold text-foreground">{getChapterTitle(chapter.id, language)}</h3>
                  </div>
                  <Badge variant="secondary">{chapter.lessons.length} {t('common.lessonPlural')}</Badge>
                </div>

                <div className="mt-4 space-y-2">
                  {chapter.lessons.map((lesson) => (
                    <Link
                      key={lesson.id}
                      to={`/discipline/biophysique/${chapter.id}/${lesson.id}`}
                      className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-elevated/50 px-3 py-2.5 text-sm text-muted transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
                    >
                      <span>{getChapterTitle(lesson.id, language)}</span>
                      <ArrowRight className="h-4 w-4 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
                    </Link>
                  ))}
                </div>
              </motion.div>
            ))
          )}
        </div>

        <InteractiveEquation
          title="Poiseuille flow"
          subtitle="Pressure gradient drives flow through a vessel; radius has a strong effect because it enters to the fourth power."
          formula="Q = ΔP × r^4 / 8ηL"
          variables={[
            { name: 'ΔP', min: 10, max: 80, step: 1, unit: 'mmHg', description: 'pressure gradient' },
            { name: 'r', min: 1, max: 5, step: 0.1, unit: 'mm', description: 'radius' },
            { name: 'η', min: 1, max: 8, step: 0.1, unit: 'cP', description: 'viscosity' },
            { name: 'L', min: 5, max: 25, step: 0.5, unit: 'cm', description: 'length' },
          ]}
          compute={(values) => (values[0] * Math.pow(values[1], 4)) / (8 * values[2] * values[3])}
          label={(value) => `${value.toFixed(2)} AU`}
        />

        <PoiseuilleLab />
      </main>
    </div>
  )
}
