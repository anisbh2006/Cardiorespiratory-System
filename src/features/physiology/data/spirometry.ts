import type { WavePoint } from '../waveform'
import type { LessonRef, SourceRef } from '../provenance'

/**
 * Spirometry data — every volume, capacity, formula and threshold is taken
 * verbatim from "Ventilatory mechanics" (pr-9, p.63–69) and the spirometry TD
 * "TD 02 — Spirometry" (pr-td02).
 *
 * Schematic note: the volume–time curves (spirograms) are drawings of the
 * manoeuvres the lecturee describes; the *landmarks* are the lecturee's own —
 * VT 500, VRI 3000, ERV 1200, VR 1200 ml; CV 4800, CI 3500, CRF 2400,
 * CPT 6000 ml; anatomical dead space 150 ml; VEMS = 75–80 % de la CV;
 * expiration forced ≥ 6 s. The forced-expiration curve is drawn so that the
 * volume expired in the first second falls in the cited 75–80 % range; no
 * numeric value is asserted beyond those cited.
 */

/* Respiratory volumes — pr-9 p.63 (young adult male). */
export const VT = 500
export const VRI = 3000
export const ERV = 1200
export const VR = 1200

/* Lung capacities — pr-9 p.63. */
export const CV = 4800 // = VT + VRI + ERV
export const CI = 3500 // = VT + VRI
export const CRF = 2400 // = VR + ERV
export const CPT = 6000 // = VR + CV

/* Dead space & ventilation — pr-9 p.67–69. */
export const DEAD_SPACE = 150 // anatomical dead space, ml (p.67)
export const FREQ_RANGE: [number, number] = [12, 16] // cycles/min at rest (p.67)

/* Forced expiratory volume — pr-9 p.66 / pr-td02 p.18–19. */
export const FEV_PCT_LOW = 75 // VEMS normally 75–80 % of CV (p.66)
export const FEV_PCT_HIGH = 80
export const EXHALATION_MIN_S = 6 // pr-td02 p.28 (exhalation ≥ 6 s)

/* Interpretation norms — pr-td02 p.31. */
export const NORMS = [
  { param: 'CVF (FVC)', threshold: '≥ 80 %' },
  { param: 'VEMS (FEV)', threshold: '≥ 80 %' },
  { param: 'VEMS/CVF (Tiffeneau)', threshold: '≥ 70 %' },
]

export interface VolumeDef {
  key: string
  label: string
  fr: string
  value: number
  definition: string
  page: number
}
/** Ordered bottom → top of the stacked volume diagram. */
export const VOLUME_DEFS: VolumeDef[] = [
  { key: 'VR', label: 'VR', fr: 'Volume résiduel', value: VR, definition: 'Air restant dans les lungs après expiration maximale.', page: 63 },
  { key: 'ERV', label: 'VRE', fr: "Volume de réserve expiratoire", value: ERV, definition: 'Air expiré avec effort maximal après une expiration normale.', page: 63 },
  { key: 'VT', label: 'VT', fr: 'Volume courant', value: VT, definition: 'Air inspiré ou expiré au lecture de la quiet breathing.', page: 63 },
  { key: 'VRI', label: 'VRI', fr: 'Volume de réserve inspiratoire', value: VRI, definition: 'Air inspiré avec effort maximal en plus d’une inspiration normale.', page: 63 },
]

export interface CapacityDef {
  key: string
  label: string
  fr: string
  value: number
  formula: string
  /** Cumulative volume bounds [low, high] spanned on the diagram. */
  span: [number, number]
  page: number
}
export const CAPACITY_DEFS: CapacityDef[] = [
  { key: 'CRF', label: 'CRF', fr: 'Capacité résiduelle fonctionnelle', value: CRF, formula: 'VR + VRE', span: [0, CRF], page: 63 },
  { key: 'CI', label: 'CI', fr: 'Capacité inspiratoire', value: CI, formula: 'VT + VRI', span: [CRF, CRF + CI], page: 63 },
  { key: 'CV', label: 'CV', fr: 'Capacité vitale', value: CV, formula: 'VT + VRI + VRE', span: [VR, VR + CV], page: 63 },
  { key: 'CPT', label: 'CPT', fr: 'Capacité pulmonaire totale', value: CPT, formula: 'VR + CV', span: [0, CPT], page: 63 },
]

/** Cumulative segment boundaries (ml, absolute lung volume) for the diagram. */
export const SEGMENTS = [
  { key: 'VR', label: 'VR', low: 0, high: VR, color: '#6b7280' },
  { key: 'ERV', label: 'VRE', low: VR, high: VR + ERV, color: '#a78bfa' },
  { key: 'VT', label: 'VT', low: VR + ERV, high: VR + ERV + VT, color: '#34d399' },
  { key: 'VRI', label: 'VRI', low: VR + ERV + VT, high: VR + ERV + VT + VRI, color: '#60a5fa' },
]
export const DIAGRAM_MAX = VR + ERV + VT + VRI // 5900 ml (sum of cited volumes)

/* Ventilation formulas — pr-9 p.67–68. */
export function pulmonaryVentilation(freq: number): number {
  return VT * freq // ml/min
}
export function alveolarVentilation(freq: number): number {
  return (VT - DEAD_SPACE) * freq // ml/min (physiological dead space = anatomical in normals, p.69)
}

export const CALM_CYCLE = 4.5 // pr-9 p.4
export const FORCED_CYCLE = 8 // schematic manoeuvre duration; forced expiration ≈ 6 s (pr-td02 p.28)
export const FORCED_EXPIRATION_START = 0.2 // phase where forced expiration begins
export const FEV_PHASE = FORCED_EXPIRATION_START + 1 / FORCED_CYCLE // 1 s into forced expiration

export const CALM_VOLUME: WavePoint[] = [
  { p: 0.0, v: 2400 },
  { p: 0.1, v: 2520 },
  { p: 0.25, v: 2800 },
  { p: 0.4, v: 2900 },
  { p: 0.55, v: 2820 },
  { p: 0.75, v: 2560 },
  { p: 0.9, v: 2430 },
  { p: 0.99, v: 2400 },
]

/** Forced manoeuvre: CRF → maximal inspiration (CPT) → forced expiration (VR). */
export const FORCED_VOLUME: WavePoint[] = [
  { p: 0.0, v: 2400 },
  { p: 0.08, v: 4200 },
  { p: 0.15, v: 6000 },
  { p: 0.2, v: 6000 },
  { p: 0.25, v: 3400 },
  { p: 0.325, v: 2280 }, // 1 s into forced expiration → VEMS ≈ 77,5 % de la CV
  { p: 0.45, v: 1700 },
  { p: 0.6, v: 1400 },
  { p: 0.8, v: 1250 },
  { p: 0.95, v: 1200 },
  { p: 0.99, v: 2100 },
]

export const SPIRO_SCALE = { min: 1000, max: 6200 }

export const KEY_FACTS: { label: string; value: string; page: number }[] = [
  { label: 'Volume courant (VT)', value: '500 ml', page: 63 },
  { label: 'Capacité vitale (CV)', value: '4800 ml', page: 63 },
  { label: 'Capacité pulmonaire totale (CPT)', value: '6000 ml', page: 63 },
  { label: 'CRF', value: '2400 ml (VR + VRE)', page: 63 },
  { label: 'Espace mort anatomique', value: '150 ml', page: 67 },
  { label: 'VEMS (FEV)', value: '75–80 % de la CV', page: 66 },
  { label: 'Coefficient de Tiffeneau', value: 'VEMS / CV', page: 66 },
  { label: 'Expiration forced', value: '≥ 6 s', page: 28 },
]

export const SOURCES: SourceRef[] = [
  { chapterId: 'pr-9', page: 63, quote: 'Tidal volume (VT) 500ml · Inspiratory reserve (VRI) 3000ml · Expiratory reserve (ERV) 1200ml · Residual volume (VR) 1200ml · Vital capacity (CV) 4800ml = VT + VRI + ERV · Inspiratory capacity (CI) 3500ml · Functional residual capacity (CRF) 2400ml · Total lung capacity (CPT) 6000ml' },
  { chapterId: 'pr-9', page: 66, quote: 'the forced expiratory volume second (FEV) … is the volume of gas exhaled during the very first second of a maximum expiration from a maximum inspiration. It is normally 75 to 80% of the (CV); the FEV/CV ratio is the Tiffeneau coefficient' },
  { chapterId: 'pr-9', page: 67, quote: 'Pulmonary ventilation = tidal volume (VT) × respiratory frequency … 12 to 16 cycles/min … This volume of air is 150 ml in normal adults; this is the anatomical dead space' },
  { chapterId: 'pr-9', page: 68, quote: 'Alveolar ventilation = (tidal volume – volume of physiological dead space) × respiratory rate' },
  { chapterId: 'pr-9', page: 69, quote: 'In normal subjects, alveolar dead space is negligible … the physiological dead space is equal to the anatomical dead space' },
  { chapterId: 'pr-td02', page: 18, quote: 'Vital capacity (CV): volume of air mobilized by a forced expiration following forced inspiration · The maximum expiratory volume/second (FEV): the fraction of vital capacity (CV) expired in 1 second' },
  { chapterId: 'pr-td02', page: 19, quote: 'The FEV/CV ratio determines the Tiffeneau index (TI)' },
  { chapterId: 'pr-td02', page: 21, quote: 'Residual volume (VR) … = 1.2 - 1.5L · Functional residual capacity (CRF) = ERV+VR · Total lung capacity (CPT) = CV+VR = ERV+VRI+Vt+VR' },
  { chapterId: 'pr-td02', page: 28, quote: 'Exhalation duration should be at least 6 seconds' },
  { chapterId: 'pr-td02', page: 31, quote: 'FVC ≥ 80% · FEV ≥ 80% · FEV1/FVC ≥ 70%' },
]

export const LESSON: LessonRef = { slug: 'physiologie-respiratoire', chapterId: 'pr-td02' }
