import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bookmark, Clock, GraduationCap, Search, Trash2, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { disciplines, getDiscipline } from '@/data/disciplines'
import { chapterTitleById, disciplineByChapterId, lessonRoute } from '@/data/contentLoader'
import { getDisciplineIcon } from '@/data/icons'
import { useStudy } from '@/features/study/StudyContext'
import { useCourseProgress, useDisciplineProgress } from '@/features/study/useProgress'

function DisciplineProgressRow({ slug }: { slug: string }) {
  const discipline = getDiscipline(slug)!
  const progress = useDisciplineProgress(discipline)
  const Icon = getDisciplineIcon(discipline.icon)

  return (
    <Link
      to={`/discipline/${discipline.slug}`}
      className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3 transition-colors hover:border-primary/40"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-foreground">
          {discipline.titleFr}
        </span>
        <Progress value={progress} className="mt-1.5 h-1" />
      </span>
      <span className="shrink-0 font-mono text-xs text-primary">{progress}%</span>
    </Link>
  )
}

export default function StudyPage() {
  const { recentlyViewed, bookmarks, completedLessons, searchHistory, clearSearchHistory } =
    useStudy()
  const lecturee = useCourseProgress()

  return (
    <div className="pt-14">
      <header className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-primary">
            <GraduationCap className="h-3.5 w-3.5" /> My study
          </span>
          <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Tableau de bord d'apprentissage
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-xl border border-border bg-surface p-5"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                <TrendingUp className="h-4 w-4 text-primary" />
                Progression globale the lesson
              </span>
              <span className="font-mono text-sm text-primary">{lecturee.percent}%</span>
            </div>
            <Progress value={lecturee.percent} className="mt-3 h-2" />
            <p className="mt-2 text-xs text-faint">
              {lecturee.completed} leçon(s) terminée(s){lecturee.total > 0 && ` sur ${lecturee.total}`} —
              la progression s'enregistrera automatiquement à mesure que le contenu the lesson sera
              intégré. Data stored locally (localStorage).
            </p>
          </motion.div>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-6 py-10 md:grid-cols-2">
        {/* Continue learning */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-faint">
            <Clock className="h-3.5 w-3.5" /> Resume studying
          </h2>
          <div className="space-y-2">
            {recentlyViewed.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border-strong p-4 text-xs text-faint">
                No lessons viewed yet. Recently opened lessons
                apparaîtront ici.
              </p>
            ) : (
              recentlyViewed.slice(0, 6).map((r) => (
                <Link
                  key={r.lessonId}
                  to={lessonRoute(r.lessonId, r.disciplineSlug) ?? `/discipline/${r.disciplineSlug}`}
                  className="group block rounded-lg border border-border bg-surface p-3 text-sm text-foreground transition-colors hover:border-border-strong hover:shadow-[0_6px_20px_rgba(0,0,0,0.25)]"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium">{r.title}</span>
                    <Clock className="h-3.5 w-3.5 shrink-0 text-faint transition-colors group-hover:text-primary" />
                  </span>
                  <span className="mt-0.5 block text-[11px] text-faint">
                    {getDiscipline(r.disciplineSlug)?.titleFr} ·{' '}
                    {new Date(r.at).toLocaleDateString('fr-FR')}
                  </span>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Bookmarks */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-faint">
            <Bookmark className="h-3.5 w-3.5" /> Favoris ({bookmarks.length})
          </h2>
          <div className="space-y-2">
            {bookmarks.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border-strong p-4 text-xs text-faint">
                Aucun favori. Marquez des leçons comme favorites depuis leur page pour les
                retrouver ici.
              </p>
            ) : (
              bookmarks.map((id) => {
                const slug = disciplineByChapterId[id]
                const title = chapterTitleById[id]
                const to = lessonRoute(id)
                const inner = (
                  <>
                    <span className="flex items-center gap-2">
                      <Bookmark className="h-3.5 w-3.5 shrink-0 text-primary" fill="currentColor" />
                      <span className="truncate text-sm font-medium text-foreground">
                        {title ?? id}
                      </span>
                    </span>
                    {slug && (
                      <span className="mt-0.5 block truncate text-[11px] text-faint">
                        {getDiscipline(slug)?.titleFr}
                      </span>
                    )}
                  </>
                )
                return to ? (
                  <Link
                    key={id}
                    to={to}
                    className="block rounded-lg border border-border bg-surface p-3 transition-colors hover:border-border-strong hover:shadow-[0_6px_20px_rgba(0,0,0,0.25)]"
                  >
                    {inner}
                  </Link>
                ) : (
                  <div key={id} className="rounded-lg border border-border bg-surface p-3">
                    {inner}
                  </div>
                )
              })
            )}
          </div>
        </section>

        {/* Discipline progress */}
        <section className="md:col-span-2">
          <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-faint">
            Progression par discipline
          </h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {disciplines.map((d) => (
              <DisciplineProgressRow key={d.id} slug={d.slug} />
            ))}
          </div>
        </section>

        {/* Search history */}
        <section className="md:col-span-2">
          <h2 className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-faint">
            <Search className="h-3.5 w-3.5" /> Historique de recherche
          </h2>
          {searchHistory.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border-strong p-4 text-xs text-faint">
              Aucune recherche enregistrée.
            </p>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              {searchHistory.map((q) => (
                <Link
                  key={q}
                  to={`/search?q=${encodeURIComponent(q)}`}
                  className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  {q}
                </Link>
              ))}
              <Button variant="ghost" size="sm" onClick={clearSearchHistory} className="gap-1.5">
                <Trash2 className="h-3 w-3" /> Effacer
              </Button>
            </div>
          )}
        </section>

        <section className="md:col-span-2">
          <p className="text-xs text-faint">
            Lessons terminées : {completedLessons.length} · Progression conservée localement dans
            votre navigateur (aucun backend, aucune donnée envoyée).
          </p>
        </section>
      </main>
    </div>
  )
}
