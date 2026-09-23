import type { ComponentType } from 'react'
import { HeartPulse, Zap, Gauge, HeartHandshake, Wind, RefreshCw, Droplets } from 'lucide-react'
import { CardiacCycleViz } from './viz/CardiacCycleViz'
import { ActionPotentialViz } from './viz/ActionPotentialViz'
import { CardiacOutputViz } from './viz/CardiacOutputViz'
import { CirculationViz } from './viz/CirculationViz'
import { VentilationViz } from './viz/VentilationViz'
import { GasExchangeViz } from './viz/GasExchangeViz'
import { SpirometryViz } from './viz/SpirometryViz'

export interface VizEntry {
  id: string
  title: string
  blurb: string
  system: 'cardiovascular' | 'respiratory'
  icon: ComponentType<{ className?: string }>
  Component: ComponentType
}

/**
 * Registry of interactive physiology visualizations. Each entry is backed by a
 * specific course chapter (see the visualization's own `sources`). Adding a new
 * visualization = build the component and append an entry here.
 */
export const VIZ: VizEntry[] = [
  {
    id: 'cardiac-cycle',
    title: 'Le cycle cardiaque',
    blurb: 'ECG, pressions, volume, valves et bruits du cœur synchronisés sur 0,8 s.',
    system: 'cardiovascular',
    icon: HeartPulse,
    Component: CardiacCycleViz,
  },
  {
    id: 'electrical-activity',
    title: 'Activité électrique',
    blurb: 'Potentiels d’action rapide et lent, phases, courants ioniques, périodes réfractaires et conduction.',
    system: 'cardiovascular',
    icon: Zap,
    Component: ActionPotentialViz,
  },
  {
    id: 'cardiac-output',
    title: 'Débit cardiaque',
    blurb: 'DC = HR × VE : faites varier fréquence et précharge, relation de Frank-Starling et réserve cardiaque.',
    system: 'cardiovascular',
    icon: Gauge,
    Component: CardiacOutputViz,
  },
  {
    id: 'circulation',
    title: 'Circulation coronaire',
    blurb: 'Flux coronaire phasique : irrigation du VG bloquée en systole, assurée à 70–80 % en diastole.',
    system: 'cardiovascular',
    icon: HeartHandshake,
    Component: CirculationViz,
  },
  {
    id: 'ventilation',
    title: 'Ventilation pulmonaire',
    blurb: 'Mécanique ventilatoire : diaphragme, intercostaux, pressions alvéolaire/pleurale et flux sur 4,5 s.',
    system: 'respiratory',
    icon: Wind,
    Component: VentilationViz,
  },
  {
    id: 'gas-exchange',
    title: 'Échanges gazeux',
    blurb: 'Diffusion O₂/CO₂ à travers la membrane alvéolo-capillaire et équilibration en 0,3–0,4 s (loi de Fick).',
    system: 'respiratory',
    icon: Droplets,
    Component: GasExchangeViz,
  },
  {
    id: 'spirometry',
    title: 'Spirométrie · volumes',
    blurb: 'Volumes et capacités pulmonaires, ventilation calme vs forcée, VEMS/CVF (Tiffeneau).',
    system: 'respiratory',
    icon: RefreshCw,
    Component: SpirometryViz,
  },
]
