import * as React from 'react'
import { useSearchParams } from 'react-router-dom'
import { Activity, AirVent, HeartPulse, PlayCircle } from 'lucide-react'
import { Tabs } from '@/components/ui/tabs'
import { VIZ } from '@/features/physiology/registry'
import type { StructureSystem } from '@/data/types'
import { cn } from '@/lib/utils'

export default function PhysiologyPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const system = (searchParams.get('system') === 'respiratory'
    ? 'respiratory'
    : 'cardiovascular') as StructureSystem

  const list = VIZ.filter((v) => v.system === system)
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const active = list.find((v) => v.id === activeId) ?? list[0]
  const ActiveViz = active?.Component

  return (
    <div className="pt-14">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-primary">
              <Activity className="h-3.5 w-3.5" /> Physiologie interactive
            </span>
            <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Visualisations physiologiques
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              Chaque concept est animé pour expliquer le mécanisme décrit dans le cours — avec
              lecture, pause, reset et ralenti. Les valeurs, la terminologie et la séquence
              proviennent exclusivement du matériel fourni et sont citées (chapitre · page).
            </p>
          </div>
          <Tabs
            items={[
              { value: 'cardiovascular', label: 'Cardiovasculaire', icon: <HeartPulse className="h-3.5 w-3.5" /> },
              { value: 'respiratory', label: 'Respiratoire', icon: <AirVent className="h-3.5 w-3.5" /> },
            ]}
            value={system}
            onValueChange={(v) => {
              setActiveId(null)
              setSearchParams({ system: v })
            }}
          />
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        {/* Concept selector */}
        <div className="flex flex-wrap gap-2">
          {list.map((v) => {
            const Icon = v.icon
            const on = active?.id === v.id
            return (
              <button
                key={v.id}
                onClick={() => setActiveId(v.id)}
                className={cn(
                  'flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium transition-[color,border-color,background-color,box-shadow] duration-200 cursor-pointer',
                  on
                    ? 'border-primary bg-primary/15 text-primary shadow-[0_0_14px_rgba(224,36,58,0.18)]'
                    : 'border-border bg-surface text-muted hover:border-border-strong hover:text-foreground'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {v.title}
              </button>
            )
          })}
        </div>

        {active ? (
          <React.Fragment key={active.id}>
            {active.blurb && (
              <p className="flex items-start gap-2 text-sm text-muted">
                <PlayCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {active.blurb}
              </p>
            )}
            <ActiveViz />
          </React.Fragment>
        ) : (
          <div className="rounded-xl border border-dashed border-border-strong bg-surface/40 p-10 text-center text-sm text-faint">
            Aucune visualisation pour ce système pour le moment.
          </div>
        )}
      </main>
    </div>
  )
}
