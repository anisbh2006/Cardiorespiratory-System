import { Atom, Calculator, LineChart, Sigma } from 'lucide-react'
import { AwaitingContent } from '@/components/medical/AwaitingContent'
import { getDiscipline } from '@/data/disciplines'
import { useDisciplineProgress } from '@/features/study/useProgress'
import { Progress } from '@/components/ui/progress'

const capabilities = [
  {
    icon: Sigma,
    title: 'Équations',
    description:
      'Présentation typée des équations du cours avec variables et significations, rendues via le bloc « Équation ».',
  },
  {
    icon: LineChart,
    title: 'Diagrammes interactifs',
    description:
      'Graphiques et diagrammes scientifiques issus du matériel fourni, intégrés au fur et à mesure.',
  },
  {
    icon: Calculator,
    title: 'Explications pas à pas',
    description:
      'Sections dépliables pour les démonstrations et raisonnements étape par étape du cours.',
  },
]

export default function BiophysicsPage() {
  const discipline = getDiscipline('biophysique')
  const progress = useDisciplineProgress(discipline)

  return (
    <div className="pt-14">
      <header className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 right-1/4 h-56 w-56 rounded-full bg-info/8 blur-[110px]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 py-10">
          <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-primary">
            <Atom className="h-3.5 w-3.5" /> Biophysique
          </span>
          <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Atelier de biophysique
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Interface scientifique dédiée : équations, variables, diagrammes interactifs et
            explications étape par étape — construite exclusivement à partir du contenu de
            biophysique du cours fourni.
          </p>
          {discipline && (
            <div className="mt-4 max-w-xs">
              <div className="flex justify-between text-xs text-muted">
                <span>Progression</span>
                <span className="font-mono text-primary">{progress}%</span>
              </div>
              <Progress value={progress} className="mt-1.5" />
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-6 py-10">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {capabilities.map((c) => (
            <div key={c.title} className="rounded-xl border border-border bg-surface p-5 transition-[border-color,box-shadow] duration-300 hover:border-border-strong hover:shadow-[0_8px_28px_rgba(0,0,0,0.28)]">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/8 text-primary">
                <c.icon className="h-4 w-4" />
              </span>
              <h3 className="mt-3 text-sm font-semibold text-foreground">{c.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">{c.description}</p>
            </div>
          ))}
        </div>

        <AwaitingContent
          title="Contenu de biophysique en attente d'intégration"
          description="Les équations, variables, illustrations scientifiques, graphiques et explications pas à pas seront intégrés ici exactement tels qu'ils figurent dans le matériel de cours fourni. Aucune donnée physique ou médicale n'est inventée."
          className="py-16"
        />
      </main>
    </div>
  )
}
