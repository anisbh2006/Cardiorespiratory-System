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
  titleKey: string
  blurbKey: string
  system: 'cardiovascular' | 'respiratory'
  icon: ComponentType<{ className?: string }>
  Component: ComponentType
}

/**
 * Registry of interactive physiology visualizations. Each entry is backed by a
 * specific lecturee chapter (see the visualization's own `sources`). Adding a new
 * visualization = build the component and append an entry here.
 */
export const VIZ: VizEntry[] = [
  {
    id: 'cardiac-cycle',
    titleKey: 'physiology.visualizations.cardiacCycle.title',
    blurbKey: 'physiology.visualizations.cardiacCycle.description',
    system: 'cardiovascular',
    icon: HeartPulse,
    Component: CardiacCycleViz,
  },
  {
    id: 'electrical-activity',
    titleKey: 'physiology.visualizations.electricalActivity.title',
    blurbKey: 'physiology.visualizations.electricalActivity.description',
    system: 'cardiovascular',
    icon: Zap,
    Component: ActionPotentialViz,
  },
  {
    id: 'cardiac-output',
    titleKey: 'physiology.visualizations.cardiacOutput.title',
    blurbKey: 'physiology.visualizations.cardiacOutput.description',
    system: 'cardiovascular',
    icon: Gauge,
    Component: CardiacOutputViz,
  },
  {
    id: 'circulation',
    titleKey: 'physiology.visualizations.coronary.title',
    blurbKey: 'physiology.visualizations.coronary.description',
    system: 'cardiovascular',
    icon: HeartHandshake,
    Component: CirculationViz,
  },
  {
    id: 'ventilation',
    titleKey: 'physiology.visualizations.ventilation.title',
    blurbKey: 'physiology.visualizations.ventilation.description',
    system: 'respiratory',
    icon: Wind,
    Component: VentilationViz,
  },
  {
    id: 'gas-exchange',
    titleKey: 'physiology.visualizations.gasExchange.title',
    blurbKey: 'physiology.visualizations.gasExchange.description',
    system: 'respiratory',
    icon: Droplets,
    Component: GasExchangeViz,
  },
  {
    id: 'spirometry',
    titleKey: 'physiology.visualizations.spirometry.title',
    blurbKey: 'physiology.visualizations.spirometry.description',
    system: 'respiratory',
    icon: RefreshCw,
    Component: SpirometryViz,
  },
]
