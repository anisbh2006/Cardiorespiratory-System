import type { WavePoint } from '../waveform'
import type { LessonRef, SourceRef } from '../provenance'

/**
 * Cardiac electrophysiology data — every number, phase, ionic current and
 * conduction velocity is taken verbatim from the supplied lecturee chapter
 * "Cardiac Electrophysiology" (pc-1).
 *
 * Schematic note: the *shape* of each action-potential curve is a drawing of the
 * sequence the chapter describes; the *landmarks* (rest −80 mV, overshoot
 * +20/+30 mV, threshold −45 mV, max diastolic −65 mV, phase order, refractory
 * boundaries, conduction velocities, ion concentrations) are the lecturee's own.
 * Time axis is the 0–300 ms window of the chapter's figures (p.34, p.37).
 */

export const WINDOW_MS = 300 // pc-1 p.34 / p.37 figures: time 0–300 ms

/* Resting / threshold potentials (verbatim). */
export const REST_VENTRICULAR = -80 // pc-1 p.15, p.25 (–80 mV, K⁺ conductance)
export const OVERSHOOT_MIN = 20 // pc-1 p.20 (+20 mV)
export const OVERSHOOT_MAX = 30 // pc-1 p.20 (+30 mV)
export const NODAL_MAX_DIASTOLIC = -65 // pc-1 p.40 (–65 mV)
export const NODAL_THRESHOLD = -45 // pc-1 p.39 (threshold –45 mV)
export const REFRACTORY_END_MV = -50 // pc-1 p.34 (PRA until ≈ –50 mV)

export type ApKind = 'rapid' | 'slow'

export interface ApPhase {
  id: string
  label: string
  /** Normalized window [start, end] over the 0–300 ms figure. */
  start: number
  end: number
  /** Dominant ionic movement described by the lecturee for this phase. */
  ion: string
  detail: string
}

/** Phases of the rapidly-depolarizing cell AP (ventricular) — pc-1 p.18–25. */
export const RAPID_PHASES: ApPhase[] = [
  { id: '0', label: 'Phase 0 · depolarization rapide', start: 0.0, end: 0.02, ion: 'Na⁺ entrée', detail: 'Ouverture des canaux Na⁺ voltage-dépendants, entrée rapide de Na⁺ ; le potentiel inverse et atteint +20 à +30 mV. Activation de INa ≈ 1 ms, inactivation 10–15 ms.' },
  { id: '1', label: 'Phase 1 · repolarization initiale', start: 0.02, end: 0.06, ion: 'K⁺ sortie', detail: 'Inactivation des canaux Na⁺ ; courant potassique transitoire sortant par les canaux K⁺ voltage-dépendants rapides.' },
  { id: '2', label: 'Phase 2 · plateau', start: 0.06, end: 0.55, ion: 'Ca²⁺ entrée', detail: 'Ouverture prolongée des canaux Ca²⁺ de type L (récepteurs dihydropyridine, DHPR) ; entrée de Ca²⁺.' },
  { id: '3', label: 'Phase 3 · repolarization rapide', start: 0.55, end: 0.8, ion: 'K⁺ sortie', detail: 'Fermeture des canaux Ca²⁺ de type L et ouverture d’autres sous-types de canaux K⁺ ; sortie rapide de K⁺, retour au potentiel de rest.' },
  { id: '4', label: 'Phase 4 · rest électrique (diastole)', start: 0.8, end: 1.0, ion: 'Na⁺/K⁺ ATPase · NCX', detail: 'Potentiel de rest ≈ −80 mV ; restauration des gradients par l’échangeur Na⁺/Ca²⁺ et la pompe Na⁺/K⁺ (2 K⁺ entrants pour 3 Na⁺ sortants).' },
]

/** Phases of the slowly-depolarizing (nodal / pacemaker) AP — pc-1 p.37–40. */
export const SLOW_PHASES: ApPhase[] = [
  { id: '4', label: 'Phase 4 · potentiel pacemaker (DDL)', start: 0.0, end: 0.45, ion: 'Na⁺ entrée (canaux f)', detail: 'Pas de potentiel de rest stable : depolarization diastolique lente et spontanée. Vers −65 mV, IK diminue et les canaux « f » (Na⁺/K⁺) s’ouvrent ; l’entrée de Na⁺ l’emporte, puis canaux Ca²⁺ T et L.' },
  { id: '0', label: 'Phase 0 · depolarization', start: 0.45, end: 0.58, ion: 'Ca²⁺ entrée (type L)', detail: 'Au seuil (−45 mV), le courant calcique entrant ICa (canaux Ca²⁺ de type L) déclenche le potentiel d’action. Phase 0 lente.' },
  { id: '3', label: 'Phase 3 · repolarization', start: 0.58, end: 0.9, ion: 'K⁺ sortie', detail: 'Fermeture des canaux Ca²⁺ au sommet du PA ; le courant sortant IK (canaux K⁺) ramène le potentiel vers le maximum diastolique (−65 mV).' },
  { id: '4b', label: 'Retour au maximum diastolique', start: 0.9, end: 1.0, ion: '—', detail: 'Le potentiel rejoint ≈ −65 mV, puis la depolarization diastolique lente reprend. Pas de phases 1 ni 2.' },
]

export function rapidPhaseAt(p: number): ApPhase {
  const x = ((p % 1) + 1) % 1
  return RAPID_PHASES.find((ph) => x >= ph.start && x < ph.end) ?? RAPID_PHASES[RAPID_PHASES.length - 1]
}
export function slowPhaseAt(p: number): ApPhase {
  const x = ((p % 1) + 1) % 1
  return SLOW_PHASES.find((ph) => x >= ph.start && x < ph.end) ?? SLOW_PHASES[SLOW_PHASES.length - 1]
}

/* Membrane-potential scales (mV). */
export const RAPID_SCALE = { min: -90, max: 40 }
export const SLOW_SCALE = { min: -75, max: 25 }

/** Rapid (ventricular) AP trace — landmarks per pc-1 p.20–25. */
export const RAPID_AP: WavePoint[] = [
  { p: 0.0, v: -80 },
  { p: 0.012, v: 25 },
  { p: 0.02, v: 30 },
  { p: 0.045, v: 8 },
  { p: 0.06, v: 5 },
  { p: 0.2, v: 2 },
  { p: 0.4, v: -2 },
  { p: 0.55, v: -8 },
  { p: 0.66, v: -45 },
  { p: 0.75, v: -74 },
  { p: 0.8, v: -80 },
  { p: 0.99, v: -80 },
]

/** Slow (nodal) AP trace — landmarks per pc-1 p.37–40. */
export const SLOW_AP: WavePoint[] = [
  { p: 0.0, v: -65 },
  { p: 0.2, v: -56 },
  { p: 0.45, v: -45 },
  { p: 0.52, v: 8 },
  { p: 0.58, v: 12 },
  { p: 0.7, v: -10 },
  { p: 0.82, v: -55 },
  { p: 0.9, v: -65 },
  { p: 0.99, v: -63 },
]

/** Refractory-period boundaries for the rapid AP (pc-1 p.34–35). */
export const REFRACTORY = {
  // Absolute: phases 0→2 and almost half of phase 3, until ≈ −50 mV.
  praEnd: 0.675,
  // Relative: until phase 4.
  prrEnd: 0.8,
}

/* Ion distribution table — pc-1 p.14 (verbatim). */
export interface IonRow {
  ion: string
  extracellular: string
  intracellular: string
  equilibrium: string
}
export const ION_TABLE: IonRow[] = [
  { ion: 'Na⁺', extracellular: '145', intracellular: '5 à 10', equilibrium: '+60' },
  { ion: 'K⁺', extracellular: '4 à 5', intracellular: '140', equilibrium: '−90' },
  { ion: 'Ca²⁺', extracellular: '1 à 2', intracellular: '0,001 à 0,1', equilibrium: '+132' },
]

/* Conduction pathway — pc-1 p.45, p.51, p.53, p.56 (verbatim velocities/times). */
export interface ConductionStep {
  structure: string
  velocity: string
  note: string
  page: number
}
export const CONDUCTION: ConductionStep[] = [
  { structure: 'Nœud sinusal (NSA)', velocity: '—', note: 'Pacemaker physiologique : automatisme le plus rapide (100/min), pente de DDL la plus raide.', page: 45 },
  { structure: 'Tissu auriculaire', velocity: '≈ 0,3 m/s', note: 'Propagation radiale depuis le NSA dans les fibres musculaires atriales.', page: 51 },
  { structure: 'Faisceaux internodaux (3 : antérieur, moyen, postérieur)', velocity: '1 m/s', note: 'Conduisent l’influx vers le nœud atrioventriculaire (NAV).', page: 51 },
  { structure: 'Nœud atrioventriculaire (NAV)', velocity: 'ralenti · 0,09 s', note: 'Slow motionssement → décalage entre contraction atriale et ventriculaire.', page: 53 },
  { structure: 'Faisceau de His – Purkinje', velocity: '3 à 5 m/s (5 m/s Purkinje)', note: 'Vc la plus élevée, 150× celle du NAV ; transmission quasi instantanée aux deux ventricules.', page: 56 },
]

/* Intrinsic automatism rates — pc-1 p.47 (verbatim). */
export interface PacemakerRow {
  site: string
  rate: string
}
export const PACEMAKER_RATES: PacemakerRow[] = [
  { site: 'Nœud sinusal', rate: '100/min' },
  { site: 'Nœud atrioventriculaire', rate: '40 à 50/min' },
  { site: 'Purkinje / ventriculaire', rate: '10 à 30/min' },
]

export const KEY_FACTS: { label: string; value: string; page: number }[] = [
  { label: 'Repos (cell ventriculaire)', value: '−80 mV', page: 15 },
  { label: 'Overshoot phase 0', value: '+20 à +30 mV', page: 20 },
  { label: 'Activation / inactivation INa', value: '≈ 1 ms / 10–15 ms', page: 20 },
  { label: 'Seuil (cell nodale)', value: '−45 mV', page: 39 },
  { label: 'Max diastolique (nodal)', value: '−65 mV', page: 40 },
  { label: 'PA lent : phases absentes', value: 'pas de 1 ni 2', page: 40 },
  { label: 'Électrique → mécanique', value: 'toujours avant', page: 9 },
]

export const SOURCES: SourceRef[] = [
  { chapterId: 'pc-1', page: 14, quote: 'Na⁺ 145 / 5 to 10 / +60 · K⁺ 4 to 5 / 140 / −90 · Ca²⁺ 1 to 2 / 0.001 to 0.1 / +132' },
  { chapterId: 'pc-1', page: 15, quote: 'around –80 mV for a ventricular cell, it is the transmembrane resting potential which is determined by the potassium conductance' },
  { chapterId: 'pc-1', page: 20, quote: 'rapid entry of Na⁺ into the cell. The membrane potential reverses and reaches approximately +20mV to +30mV … activation of the sodium current (INa) is extremely rapid, of the order of 1 ms, while the inactivation is slower, of the order of 10 to 15 ms' },
  { chapterId: 'pc-1', page: 21, quote: 'The cell begins to repolarize thanks to a transient potassium current flowing out through the opening of fast voltage-gated K⁺ channels' },
  { chapterId: 'pc-1', page: 22, quote: 'L-type Ca²⁺ channels … also called dihydropyridine receptors, DHPR … Ca²⁺ enters the cell' },
  { chapterId: 'pc-1', page: 24, quote: 'Closure of L-type Ca²⁺ channels and opening of other K⁺ channel subtypes. There is then a rapid release of K⁺ and the cell returns to resting potential' },
  { chapterId: 'pc-1', page: 29, quote: 'Two potassium ions enter the cell for every three sodium ions leaving, giving a total of one repolarizing outgoing current' },
  { chapterId: 'pc-1', page: 34, quote: 'During phases 0 to 2 and for almost half of phase 3 (until the membrane potential reaches approximately -50mV during repolarization), the heart muscle cannot be excited again … absolute refractory period (PRA)' },
  { chapterId: 'pc-1', page: 37, quote: 'The action potential of slowly depolarizing cells does not include phases 1 and 2' },
  { chapterId: 'pc-1', page: 39, quote: 'Once the threshold is reached (-45mV), the incoming calcium current (ICa) due to the opening of L-type calcium channels … triggers the influx (PA)' },
  { chapterId: 'pc-1', page: 40, quote: 'no phases 1 and 2; unstable resting potential depolarizes around -65mV to -45mv (DDL); maximum diastolic membrane potential is less negative around -65mV; slow phase 0' },
  { chapterId: 'pc-1', page: 51, quote: 'The conduction velocity (Vc) of the auricular tissuee is approximately 0.3m/s. The internodal conduction bundles … there are 3 of them: anterior, middle and posterior. Their Vc is 1m/s' },
  { chapterId: 'pc-1', page: 53, quote: 'There is a slowdown in conduction, the time to cross the NAV is 0.09s' },
  { chapterId: 'pc-1', page: 56, quote: 'The Vc is highest in conduction tissuee from 3 to 5m/s (5m/s in Purkinje fibers): 150 times > Vc of the NAV' },
  { chapterId: 'pc-1', page: 47, quote: '100/min (sinus) · 40 to 50/min · 10 to 30/min' },
]

export const LESSON: LessonRef = { slug: 'physiologie-cardiovasculaire', chapterId: 'pc-1' }
