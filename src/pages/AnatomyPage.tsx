import * as React from 'react'
import { useSearchParams } from 'react-router-dom'
import { Move3d } from 'lucide-react'
import { Tabs } from '@/components/ui/tabs'
import { AwaitingContent } from '@/components/medical/AwaitingContent'
import { StructureInfoPanel } from '@/components/medical/StructureInfoPanel'
import { getStructuresBySystem, getStructure } from '@/data/anatomy'
import type { StructureSystem } from '@/data/types'
import { cn } from '@/lib/utils'

const AnatomyViewer = React.lazy(() =>
  import('@/features/three/AnatomyViewer').then((m) => ({ default: m.AnatomyViewer }))
)

export default function AnatomyPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const system = (searchParams.get('system') === 'respiratory'
    ? 'respiratory'
    : 'cardiovascular') as StructureSystem
  const [selectedId, setSelectedId] = React.useState<string | null>(null)

  const structures = getStructuresBySystem(system)
  const selected = selectedId ? getStructure(selectedId) ?? null : null

  return (
    <div className="pt-14">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-primary">
              Laboratoire d'anatomie 3D
            </span>
            <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Exploration anatomique interactive
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              Rotation, zoom, panoramique, angles prédéfinis, étiquettes, surbrillance et cadrage
              automatique. Cliquez une structure pour afficher les informations, extraits et images
              issus du cours fourni.
            </p>
          </div>
          <Tabs
            items={[
              { value: 'cardiovascular', label: 'Cœur & vaisseaux' },
              { value: 'respiratory', label: 'Appareil respiratoire' },
            ]}
            value={system}
            onValueChange={(v) => {
              setSelectedId(null)
              setSearchParams({ system: v })
            }}
          />
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        {/* LEFT: 3D viewer */}
        <div className="space-y-4">
          <React.Suspense
            fallback={<div className="shimmer h-[480px] rounded-xl bg-overlay lg:h-[600px]" />}
          >
            <AnatomyViewer
              modelId={system === 'cardiovascular' ? 'heart' : 'lungs'}
              selectedId={selectedId}
              onSelect={setSelectedId}
              className="h-[440px] sm:h-[500px] lg:h-[600px]"
            />
          </React.Suspense>

          {/* Structure chips */}
          <div className="flex flex-wrap gap-1.5">
            {structures.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedId(s.id === selectedId ? null : s.id)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-medium transition-[color,border-color,background-color,box-shadow] duration-200 cursor-pointer',
                  s.id === selectedId
                    ? 'border-primary bg-primary/15 text-primary shadow-[0_0_14px_rgba(224,36,58,0.2)]'
                    : 'border-border bg-surface text-muted hover:border-border-strong hover:text-foreground'
                )}
              >
                {s.nameFr}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: course-content information panel */}
        <div className="space-y-4 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-1">
          <StructureInfoPanel structure={selected} />
          {system === 'respiratory' && (
            <AwaitingContent
              title="Modèle 3D respiratoire en attente"
              description="L'interface est prête : dès qu'un modèle 3D des poumons, de la trachée ou des bronches sera disponible (déposé dans src/models/ et enregistré dans le registre), il remplacera automatiquement l'espace actuel. Les structures respiratoires répertoriées dans le cours restent sélectionnables ci-dessus."
              className="py-6"
            />
          )}
        </div>
      </main>

      <section className="mx-auto max-w-7xl px-6 pb-12">
        <div className="flex items-center gap-2 text-xs text-faint">
          <Move3d className="h-3.5 w-3.5 text-primary" />
          Le modèle affiché est une représentation anatomique procédurale interactive. Un modèle
          GLTF fourni remplacera automatiquement cette maquette via le registre de modèles (
          <span className="font-mono">src/models/</span>), sans changer l'interface.
        </div>
      </section>
    </div>
  )
}
