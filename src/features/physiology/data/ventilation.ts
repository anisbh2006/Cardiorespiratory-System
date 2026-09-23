import type { WavePoint } from '../waveform'
import type { LessonRef, SourceRef } from '../provenance'

/**
 * Ventilatory-mechanics data — every number, pressure, muscle and sequence is
 * taken verbatim from "Mécanique ventilatoire" (pr-9) and the spirometry TD
 * (pr-td02).
 *
 * Schematic note: the *shapes* of the Palv / flow / volume curves are drawings of
 * the sequence pr-9 describes; the *landmarks* are the course's own — cycle 4–5 s
 * (12–15/min), Patm 760 mmHg, Ppl 756 mmHg abs / −4 mmHg rel / −5→−8 cmH2O,
 * Ptp = Palv − Ppl = 4 mmHg, VT 500 ml, CRF 2400 ml, Boyle-Mariotte. Palv and
 * flow *magnitudes* are not given numerically by the course (only their sign and
 * the rule "flow until Palv = Patm"), so they are drawn schematically.
 */

export const CYCLE_SECONDS = 4.5 // pr-9 p.4 (≈4–5 s)
export const FREQ = '12 à 15 cycles/min' // pr-9 p.4 (p.67: 12–16/min)
export const INSPIRATION_END = 0.4 // schematic TI/TE split (TI < TE at rest); pr-td02 p.5 (TI/TE/Ttot)

/* Pressures (verbatim). */
export const PATM = 760 // pr-9 p.10 (mmHg, sea level)
export const PPL_REST_ABS = 756 // pr-9 p.12 (mmHg absolute)
export const PPL_REST_REL_MMHG = -4 // pr-9 p.12 (relative to Patm)
export const PPL_REST_CMH2O = -5 // pr-td02 p.10 (normalization / rest)
export const PPL_INSP_CMH2O = -8 // pr-td02 p.10 (pleural pressure at inspiration)
export const PTP_REST = 4 // pr-9 p.14 (Ptp = Palv − Ppl = 760 − 756 = 4 mmHg)

/* Lung volumes used by the animation (pr-9 p.63). */
export const VT = 500 // tidal volume, ml
export const CRF = 2400 // functional residual capacity, ml (end-expiration level)
export const END_INSP_VOLUME = CRF + VT // 2900 ml (CRF + VT)

export const BOYLE = 'P₁V₁ = P₂V₂' // pr-9 p.17

export const VOLUME_SCALE = { min: 2300, max: 3000 }
export const PALV_SCALE = { min: -2, max: 2 }
export const PPL_SCALE = { min: -9, max: -4 }
export const FLOW_SCALE = { min: -1, max: 1 }

/** Lung volume (ml): CRF at end-expiration → CRF+VT at end-inspiration (pr-9 p.63). */
export const VOLUME: WavePoint[] = [
  { p: 0.0, v: 2400 },
  { p: 0.1, v: 2560 },
  { p: 0.25, v: 2800 },
  { p: 0.4, v: 2900 },
  { p: 0.55, v: 2800 },
  { p: 0.75, v: 2560 },
  { p: 0.9, v: 2430 },
  { p: 0.99, v: 2400 },
]

/** Alveolar pressure relative to Patm (mmHg) — sign per pr-9 p.16/19/21, magnitude schematic. */
export const PALV: WavePoint[] = [
  { p: 0.0, v: 0 },
  { p: 0.1, v: -1.2 },
  { p: 0.25, v: -1.0 },
  { p: 0.4, v: 0 },
  { p: 0.5, v: 0.6 },
  { p: 0.65, v: 1.0 },
  { p: 0.85, v: 0.4 },
  { p: 0.99, v: 0 },
]

/** Pleural pressure (cmH2O): −5 at rest → −8 at inspiration (pr-td02 p.10). */
export const PPL: WavePoint[] = [
  { p: 0.0, v: -5 },
  { p: 0.15, v: -7 },
  { p: 0.4, v: -8 },
  { p: 0.6, v: -6.5 },
  { p: 0.8, v: -5.2 },
  { p: 0.99, v: -5 },
]

/** Airflow (arbitrary units): + = inspiration, − = expiration, 0 when Palv = Patm (pr-9 p.11/16). */
export const FLOW: WavePoint[] = [
  { p: 0.0, v: 0 },
  { p: 0.08, v: 0.9 },
  { p: 0.2, v: 0.7 },
  { p: 0.35, v: 0.2 },
  { p: 0.4, v: 0 },
  { p: 0.5, v: -0.4 },
  { p: 0.62, v: -0.85 },
  { p: 0.8, v: -0.4 },
  { p: 0.95, v: -0.05 },
  { p: 0.99, v: 0 },
]

/* Respiratory muscles — pr-9 p.5–8 (verbatim). */
export interface MuscleGroup {
  phase: 'inspiration' | 'expiration'
  mode: 'calm' | 'forced'
  active: boolean
  muscles: string
  detail: string
  page: number
}
export const MUSCLES: MuscleGroup[] = [
  { phase: 'inspiration', mode: 'calm', active: true, muscles: 'Diaphragme + intercostaux externes', detail: 'Phénomène actif qui demande de l’énergie : la contraction augmente le volume de la cage thoracique.', page: 6 },
  { phase: 'inspiration', mode: 'forced', active: true, muscles: '+ muscles accessoires du cou', detail: 'Inspiration plus profonde : contraction plus forte du diaphragme et des intercostaux externes + accessoires du cou qui tirent le sternum et les 2 premières côtes vers le haut.', page: 7 },
  { phase: 'expiration', mode: 'calm', active: false, muscles: 'Aucun (passive)', detail: 'Phénomène passif dû à la rétraction élastique du poumon ; simple retour au volume de base.', page: 6 },
  { phase: 'expiration', mode: 'forced', active: true, muscles: 'Paroi abdominale + intercostaux internes', detail: 'L’expiration devient active pour dégonfler les poumons plus et plus vite (ex. exercice physique).', page: 8 },
]

/* Event sequences — pr-9 p.19 / p.21 (verbatim order). */
export const INSPIRATION_SEQUENCE = [
  'Contraction du diaphragme et des intercostaux externes',
  'Expansion du thorax',
  'Expansion des poumons',
  'Pression transpulmonaire (Ptp) ↗',
  'Palv < Patm',
  'L’air entre dans les alvéoles',
  'Le flux continue jusqu’à Palv = Patm',
  'Ppl devient plus négative',
]
export const EXPIRATION_SEQUENCE = [
  'Relâchement du diaphragme et des intercostaux externes',
  'Rétraction des poumons vers le volume pré-inspiratoire',
  'Compression des gaz alvéolaires',
  'Palv > Patm',
  'L’air sort des alvéoles',
  'Le flux continue jusqu’à Palv = Patm',
  'Ppl revient à sa valeur pré-inspiratoire · Ptp idem',
]

export const KEY_FACTS: { label: string; value: string; page: number }[] = [
  { label: 'Patm (niveau de la mer)', value: '760 mmHg', page: 10 },
  { label: 'Ppl au repos (absolue)', value: '756 mmHg', page: 12 },
  { label: 'Ppl au repos (relative)', value: '−4 mmHg / −5 cmH2O', page: 12 },
  { label: 'Ppl en inspiration', value: '−8 cmH2O', page: 10 },
  { label: 'Ptp = Palv − Ppl', value: '760 − 756 = 4 mmHg', page: 14 },
  { label: 'Durée du cycle', value: '4 à 5 s (12–15/min)', page: 4 },
  { label: 'Volume courant (VT)', value: '500 ml', page: 63 },
  { label: 'Loi de Boyle-Mariotte', value: BOYLE, page: 17 },
]

export const SOURCES: SourceRef[] = [
  { chapterId: 'pr-9', page: 4, quote: 'The duration of a respiratory cycle is approximately 04 to 05 seconds which corresponds to a respiratory frequency of 12 to 15 cycles/min in humans at rest' },
  { chapterId: 'pr-9', page: 6, quote: 'During calm breathing, expiration is normally a passive phenomenon due to elastic retraction of the lung while inspiration is an active phenomenon requiring energy' },
  { chapterId: 'pr-9', page: 7, quote: 'Deeper Inspiration results from stronger contraction of the diaphragm and external intercostal muscles and … accessory inspiratory muscles located in the neck' },
  { chapterId: 'pr-9', page: 8, quote: 'During forced expiration … expiration becomes active: contraction of the expiratory muscles (muscles of the abdominal wall and internal intercostal muscles)' },
  { chapterId: 'pr-9', page: 10, quote: 'Atmospheric pressure (Patm) … At sea level it is equal to 760 mm Hg' },
  { chapterId: 'pr-9', page: 12, quote: 'equal to 756mmHg at rest (absolute P°) corresponding to a relative pressure … equal to -4mmHg' },
  { chapterId: 'pr-9', page: 14, quote: 'Ptp = Palv - Ppl = 760 - 756 = 4 mm Hg' },
  { chapterId: 'pr-9', page: 16, quote: 'that the Palv < Patm so that it enters the lungs during inspiration; that the Palv > Patm so that the air flows out of the lungs during expiration' },
  { chapterId: 'pr-9', page: 17, quote: 'Boyle-Mariotte law … P₁V₁ = P₂V₂' },
  { chapterId: 'pr-9', page: 19, quote: 'Contraction of the diaphragm and external intercostal muscles → Expansion of the thorax → … Palv < Patm → Air flows into the alveoli … Ppl becomes more negative' },
  { chapterId: 'pr-9', page: 21, quote: 'Relaxation … → Retraction of the lungs → … Palv > Patm → Air flows out of the alveoli … Ppl returns to its pre-inspiratory value' },
  { chapterId: 'pr-9', page: 63, quote: 'Tidal volume (VT) 500ml … Functional residual capacity (CRF) 2400ml = VR + ERV' },
  { chapterId: 'pr-td02', page: 5, quote: 'TI: inspiratory time · TE: expiratory time · Ttot: total duration of the respiratory cycle' },
  { chapterId: 'pr-td02', page: 10, quote: 'Pleural pressure at -8cmH2O · Normalization of pleural pressure at -5 cmH2O' },
]

export const LESSON: LessonRef = { slug: 'physiologie-respiratoire', chapterId: 'pr-9' }
