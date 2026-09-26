import { motion } from 'framer-motion'
import { ArrowRight, Atom, Beaker, Gauge, Play, Sparkles, Waves } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getDiscipline } from '@/data/disciplines'
import type { Chapter } from '@/data/types'

const discipline = getDiscipline('biophysique')

function chapterBadge(chapter: Chapter) {
  return chapter.kind === 'td' ? 'TD' : `CH ${String(chapter.number).padStart(2, '0')}`
}

export function BiophysicsLanding() {
  const chapters = discipline?.chapters ?? []

  return (
    <div className="pt-14">
      <header className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(224,36,58,0.18),transparent_30%),radial-gradient(circle_at_left,_rgba(91,157,246,0.08),transparent_28%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-12">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
              <Atom className="h-3.5 w-3.5" /> Biophysics
            </span>

            <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <h1 className="font-serif text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
                  BIOPHYSICS
                </h1>
                <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
                  Understanding the physical principles behind the cardiorespiratory system.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Badge variant="default">Hemodynamics</Badge>
                  <Badge variant="secondary">Pressure-volume relationships</Badge>
                  <Badge variant="secondary">ECG & bioelectricity</Badge>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link to={`/discipline/biophysique/${chapters[0]?.id ?? 'bp-1'}/${chapters[0]?.lessons[0]?.id ?? 'bp-1'}`}>
                    <Button size="lg" className="gap-2">
                      <Play className="h-4 w-4" /> Start learning
                    </Button>
                  </Link>
                  <Link to="/search?q=biophysics+resistance+pressure">
                    <Button variant="outline" size="lg" className="gap-2">
                      <Sparkles className="h-4 w-4" /> Search concepts
                    </Button>
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
                    <span>Flow Lab</span>
                    <span>Cardiorespiratory</span>
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
                          style={{
                            left: `${10 + index * 4}%`,
                            top: `${50 + (index % 3) * 8}%`,
                          }}
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
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-faint"><Waves className="h-3 w-3" /> Pressure</div>
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
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: 'Theory',
              text: 'Read the supplied course content and keep the original scientific meaning intact.',
              icon: 'T',
            },
            {
              title: 'Visualize',
              text: 'See pressure-flow, viscosity, and pressure-volume relationships as live conceptual diagrams.',
              icon: 'V',
            },
            {
              title: 'Practice',
              text: 'Test the concepts with questions and equation-driven simulations drawn from the lecture material.',
              icon: 'P',
            },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-border bg-surface p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-elevated font-mono text-primary">
                {item.icon}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
            </div>
          ))}
        </div>

        <section>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary">Course structure</p>
              <h2 className="mt-1 font-serif text-3xl font-semibold text-foreground">Chapters from the supplied material</h2>
            </div>
          </div>

          <div className="space-y-4">
            {chapters.map((chapter, index) => (
              <motion.div
                key={chapter.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
                className="rounded-xl border border-border bg-surface p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-primary">{chapterBadge(chapter)}</span>
                    <h3 className="font-serif text-2xl font-semibold text-foreground">{chapter.title}</h3>
                  </div>
                  <Badge variant="secondary">{chapter.lessons.length} lesson</Badge>
                </div>

                <div className="mt-4 space-y-2">
                  {chapter.lessons.map((lesson) => (
                    <Link
                      key={lesson.id}
                      to={`/discipline/biophysique/${chapter.id}/${lesson.id}`}
                      className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-elevated/50 px-3 py-2.5 text-sm text-muted transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
                    >
                      <span>{lesson.title}</span>
                      <ArrowRight className="h-4 w-4 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
                    </Link>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
