import type { WavePoint } from '../waveform'
import type { LessonRef, SourceRef } from '../provenance'

/**
 * Cardiac-cycle data — every number, phase, valve event and waveform landmark
 * is taken from the supplied course chapter "Le cycle cardiaque" (pc-2).
 *
 * Schematic note: the *shape* of each curve is a drawing of the sequence the
 * chapter describes; the *landmarks* (0.8 s cycle, 0.3 s systole / 0.5 s
 * diastole, EDV 135 / ESV 65 / SV 70 ml, systemic 120/80 mmHg, 80 % of filling
 * before atrial systole, the P/QRS/T–event order, B1/B2, dicrotic notch) are
 * the course's own. Sub-phase widths are proportional, not separately cited.
 */

export const CYCLE_SECONDS = 0.8 // pc-2 p.3
export const HEART_RATE = 72 // pc-2 p.3
export const SYSTOLE_SECONDS = 0.3 // pc-2 p.3
export const DIASTOLE_SECONDS = 0.5 // pc-2 p.3

/** Normalized phase boundaries (t = 0 at the R wave / start of systole). */
export const B = {
  systoleEnd: SYSTOLE_SECONDS / CYCLE_SECONDS, // 0.375
  isoContractionEnd: 0.055,
  fillingStart: 0.45,
  atrialSystoleStart: 0.88,
}

export const VOLUMES = {
  edv: 135, // end-diastolic volume, pc-2 p.16 (135 ml)
  esv: 65, // end-systolic volume, pc-2 p.16 (65 ml)
  sv: 70, // ejection volume = 135 − 65, pc-2 p.16
  fillingBeforeAtrialPct: 80, // pc-2 p.9
}

export interface CyclePhase {
  id: string
  label: string
  start: number
  end: number
  kind: 'systole' | 'diastole'
}

/** Ordered phases exactly as pc-2 subdivides systole and diastole. */
export const PHASES: CyclePhase[] = [
  { id: 'iso-contraction', label: 'Contraction isovolumétrique', start: 0, end: B.isoContractionEnd, kind: 'systole' },
  { id: 'ejection', label: 'Éjection ventriculaire', start: B.isoContractionEnd, end: B.systoleEnd, kind: 'systole' },
  { id: 'iso-relaxation', label: 'Relaxation isovolumétrique (protodiastole)', start: B.systoleEnd, end: B.fillingStart, kind: 'diastole' },
  { id: 'filling', label: 'Remplissage ventriculaire', start: B.fillingStart, end: B.atrialSystoleStart, kind: 'diastole' },
  { id: 'atrial-systole', label: 'Systole atriale', start: B.atrialSystoleStart, end: 1, kind: 'diastole' },
]

export function phaseAt(phase: number): CyclePhase {
  const p = ((phase % 1) + 1) % 1
  return PHASES.find((x) => p >= x.start && p < x.end) ?? PHASES[PHASES.length - 1]
}

/** Valve states derived from the phase boundaries described in pc-2. */
export function valveState(phase: number): { avOpen: boolean; aorticOpen: boolean } {
  const p = ((phase % 1) + 1) % 1
  // AV (mitral) opens when ventricular pressure falls below atrial (start of filling).
  const avOpen = p >= B.fillingStart // open through filling + atrial systole
  // Aortic opens when LV pressure exceeds aortic, closes at end of ejection.
  const aorticOpen = p >= B.isoContractionEnd && p < B.systoleEnd
  return { avOpen, aorticOpen }
}

/* Waveform scales (mmHg / ml / arbitrary ECG units). */
export const PRESSURE_SCALE = { min: -4, max: 132 }
export const VOLUME_SCALE = { min: 50, max: 145 }
export const ECG_SCALE = { min: -0.35, max: 1.4 }
export const ATRIAL_SCALE = { min: -2, max: 16 }

/* ECG: P (atrial depolarization), QRS (ventricular depolarization), T (ventricular
   repolarization) — order and timing per pc-2 p.12/15/19. */
export const ECG: WavePoint[] = [
  { p: 0.0, v: 0.0 },
  { p: 0.006, v: -0.15 },
  { p: 0.014, v: 1.3 },
  { p: 0.026, v: -0.25 },
  { p: 0.05, v: 0.0 },
  { p: 0.3, v: 0.0 },
  { p: 0.33, v: 0.05 },
  { p: 0.375, v: 0.35 },
  { p: 0.44, v: 0.05 },
  { p: 0.5, v: 0.0 },
  { p: 0.86, v: 0.0 },
  { p: 0.895, v: 0.17 },
  { p: 0.94, v: 0.02 },
  { p: 0.99, v: 0.0 },
]

/* Left ventricular pressure — steep isovolumetric rise, peak ~120 (systemic
   systolic, pc-2 p.26), fall below aortic at end of ejection (p.19). */
export const LV_PRESSURE: WavePoint[] = [
  { p: 0.0, v: 8 },
  { p: 0.03, v: 55 },
  { p: 0.055, v: 88 },
  { p: 0.12, v: 118 },
  { p: 0.18, v: 120 },
  { p: 0.28, v: 105 },
  { p: 0.36, v: 86 },
  { p: 0.375, v: 78 },
  { p: 0.41, v: 30 },
  { p: 0.45, v: 6 },
  { p: 0.6, v: 5 },
  { p: 0.8, v: 7 },
  { p: 0.88, v: 9 },
  { p: 0.93, v: 13 },
  { p: 0.99, v: 9 },
]

/* Aortic pressure — 120/80 mmHg systemic (pc-2 p.26) with the dicrotic notch at
   aortic-valve closure (pc-2 p.19). */
export const AORTIC_PRESSURE: WavePoint[] = [
  { p: 0.0, v: 82 },
  { p: 0.055, v: 85 },
  { p: 0.13, v: 112 },
  { p: 0.18, v: 120 },
  { p: 0.3, v: 104 },
  { p: 0.36, v: 92 },
  { p: 0.375, v: 88 },
  { p: 0.392, v: 83 },
  { p: 0.41, v: 92 },
  { p: 0.5, v: 86 },
  { p: 0.7, v: 82 },
  { p: 0.88, v: 80 },
  { p: 0.99, v: 80 },
]

/* Left atrial pressure — slight rise during filling, a-wave at atrial systole
   (pc-2 p.9/12). Schematic low-pressure trace. */
export const ATRIAL_PRESSURE: WavePoint[] = [
  { p: 0.0, v: 4 },
  { p: 0.03, v: 6 },
  { p: 0.1, v: 3 },
  { p: 0.3, v: 5 },
  { p: 0.4, v: 8 },
  { p: 0.45, v: 6 },
  { p: 0.6, v: 4 },
  { p: 0.86, v: 5 },
  { p: 0.9, v: 12 },
  { p: 0.96, v: 6 },
  { p: 0.99, v: 4 },
]

/* Left ventricular volume — constant during the two isovolumetric phases,
   135 → 65 during ejection, 65 → 121 (≈80 %) during passive filling, 121 → 135
   with atrial systole (pc-2 p.5/8/9/16). */
export const LV_VOLUME: WavePoint[] = [
  { p: 0.0, v: 135 },
  { p: 0.055, v: 135 },
  { p: 0.1, v: 122 },
  { p: 0.18, v: 95 },
  { p: 0.28, v: 74 },
  { p: 0.375, v: 65 },
  { p: 0.45, v: 65 },
  { p: 0.55, v: 95 },
  { p: 0.62, v: 112 },
  { p: 0.75, v: 118 },
  { p: 0.88, v: 121 },
  { p: 0.94, v: 130 },
  { p: 0.99, v: 135 },
]

export interface CycleEvent {
  at: number
  label: string
  kind: 'ecg' | 'valve' | 'sound' | 'pressure'
}

/** Landmark events, positioned on the timeline (labels verbatim from pc-2). */
export const EVENTS: CycleEvent[] = [
  { at: 0.0, label: 'B1 · fermeture des valves AV', kind: 'sound' },
  { at: 0.012, label: 'QRS · dépolarisation ventriculaire', kind: 'ecg' },
  { at: B.isoContractionEnd, label: 'Ouverture de la valve aortique', kind: 'valve' },
  { at: B.systoleEnd, label: 'B2 · fermeture aortique/pulmonaire', kind: 'sound' },
  { at: 0.392, label: 'Incisure dicrote', kind: 'pressure' },
  { at: 0.375, label: 'T · repolarisation ventriculaire', kind: 'ecg' },
  { at: B.fillingStart, label: 'Ouverture de la valve AV · remplissage', kind: 'valve' },
  { at: 0.895, label: 'P · dépolarisation atriale (systole atriale)', kind: 'ecg' },
]

export const KEY_FACTS: { label: string; value: string; page: number }[] = [
  { label: 'Fréquence cardiaque', value: '72 batt/min', page: 3 },
  { label: 'Durée du cycle', value: '0,8 s', page: 3 },
  { label: 'Systole / Diastole', value: '0,3 s / 0,5 s', page: 3 },
  { label: 'Vol. télédiastolique (EDV)', value: '135 ml', page: 16 },
  { label: 'Vol. télésystolique (ESV)', value: '65 ml', page: 16 },
  { label: "Vol. d'éjection (VES)", value: '70 ml = 135 − 65', page: 16 },
  { label: 'Remplissage avant systole atriale', value: '80 %', page: 9 },
]

export const SOURCES: SourceRef[] = [
  { chapterId: 'pc-2', page: 3, quote: 'each cardiac cycle lasts approximately 0.8 s with 0.3 s for systole and 0.5 s for diastole' },
  { chapterId: 'pc-2', page: 9, quote: 'Atrial contraction occurs in end of diastole when ventricular filling is almost complete (80% of filling)' },
  { chapterId: 'pc-2', page: 16, quote: 'Ejection vol. = end-diastolic vol − telesystolic vol. 70ml = 135ml − 65ml' },
  { chapterId: 'pc-2', page: 19, quote: 'Blood bouncing against the valve causes a drop and then a rebound in aortic pressure … dicrotic notch' },
  { chapterId: 'pc-2', page: 26, quote: 'Pressures in the systemic circulation — Systole 120 mmHg, Diastole 80 mmHg' },
  { chapterId: 'pc-2', page: 28, quote: 'B1 … closure of the AV valves … B2 … closure of the pulmonary and aortic valves' },
]

export const LESSON: LessonRef = { slug: 'physiologie-cardiovasculaire', chapterId: 'pc-2' }
