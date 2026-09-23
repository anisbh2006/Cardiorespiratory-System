import type { WavePoint } from '../waveform'
import type { LessonRef, SourceRef } from '../provenance'

/**
 * Pulmonary gas-exchange data — every number, pressure, law and membrane layer
 * is taken verbatim from "Échanges gazeux pulmonaire et systémique" (pr-10).
 *
 * Schematic note: the *shape* of the capillary equilibration curve is a drawing
 * of the process pr-10 describes (blood PO2 rises from 40 toward the alveolar
 * 105, equilibrium reached in 0.3–0.4 s); the *endpoints* (40 → 105 mmHg,
 * 46 → 40 mmHg) and the equilibration time are the course's own.
 */

export const EQUILIBRATION_SECONDS = 0.4 // pr-10 p.20 (equilibrium reached in 0.3–0.4 s)
export const EQUILIBRATION_LABEL = '0,3–0,4 s'

/* Partial pressures (mmHg, verbatim). */
export const PATM = 760 // p.5
export const AIR_PO2 = 160 // p.6
export const AIR_PCO2 = 0.23 // p.6 (negligible)
export const PH2O = 47 // p.9
export const INSPIRED_PO2 = 150 // p.9 ((760 − 47) × 0.21 ≈ 150)
export const ALVEOLAR_PO2 = 105 // p.10 / p.15
export const ALVEOLAR_PCO2 = 40 // p.15
export const VENOUS_PO2 = 40 // p.14 (systemic venous blood entering pulmonary capillary)
export const VENOUS_PCO2 = 46 // p.14
export const ARTERIAL_PO2 = 105 // p.17
export const ARTERIAL_PCO2 = 40 // p.17
export const TISSUE_PO2 = '≤ 40' // p.15
export const TISSUE_PCO2 = '≥ 46' // p.15
export const PAO2 = 105 // p.34
export const PAO2_ARTERIAL = 100 // p.34 (PaO2 ≈ 100, slightly < PAO2)

/* Air composition (p.5). */
export const AIR_N2_PCT = 79
export const AIR_O2_PCT = 21

/* Membrane (p.12 / p.13). */
export const MEMBRANE_THICKNESS = '0,3 à 0,5 µm'
export const MEMBRANE_LAYERS = [
  'Film liquidien alvéolaire + surfactant',
  'Épithélium alvéolaire',
  'Membrane basale des cellules épithéliales',
  'Espace interstitiel',
  'Membrane basale du capillaire',
  'Endothélium capillaire',
]

/* Fick's law (p.18 / p.19). */
export const FICK = 'V̇gaz = K × S × (P1 − P2) / e'

/* Diffusion / transport values (p.22, p.26). */
export const ALV_VENTILATION = 4000 // ml/min, p.22
export const CARDIAC_OUTPUT = 5000 // ml/min, p.22
export const O2_FLOW = 250 // ml/min, p.22
export const CO2_FLOW = 200 // ml/min, p.22
export const DLCO = 17 // ml/min/mmHg, p.26
export const DLO2 = 21 // = 1.23 × DLCO, p.26

export const PO2_SCALE = { min: 30, max: 115 }
export const PCO2_SCALE = { min: 35, max: 50 }

/** Blood PO2 along the capillary transit: 40 → 105, equilibrium by 0.3–0.4 s (p.14/17/20). */
export const BLOOD_PO2: WavePoint[] = [
  { p: 0.0, v: 40 },
  { p: 0.3, v: 72 },
  { p: 0.55, v: 92 },
  { p: 0.75, v: 101 },
  { p: 0.9, v: 104 },
  { p: 0.99, v: 105 },
]
/** Blood PCO2 along the capillary transit: 46 → 40 (p.14/17). */
export const BLOOD_PCO2: WavePoint[] = [
  { p: 0.0, v: 46 },
  { p: 0.3, v: 44 },
  { p: 0.6, v: 41.8 },
  { p: 0.85, v: 40.5 },
  { p: 0.99, v: 40 },
]

/* Partial-pressure compartments (verbatim). */
export interface GasRow {
  compartment: string
  po2: string
  pco2: string
  page: number
}
export const PRESSURE_TABLE: GasRow[] = [
  { compartment: 'Air atmosphérique', po2: '160', pco2: '0,23', page: 6 },
  { compartment: 'Air inspiré (humidifié)', po2: '≈ 150', pco2: '—', page: 9 },
  { compartment: 'Alvéole', po2: '≈ 105', pco2: '40', page: 10 },
  { compartment: 'Sang veineux (entrée)', po2: '40', pco2: '46', page: 14 },
  { compartment: 'Sang artériel (sortie)', po2: '105', pco2: '40', page: 17 },
  { compartment: 'Tissus périphériques', po2: '≤ 40', pco2: '≥ 46', page: 15 },
]

export const KEY_FACTS: { label: string; value: string; page: number }[] = [
  { label: 'Équilibre atteint en', value: EQUILIBRATION_LABEL, page: 20 },
  { label: 'K CO₂ vs O₂', value: 'K CO₂ ≫ K O₂ (solubilité)', page: 21 },
  { label: 'Ventilation alvéolaire', value: '4000 ml/min', page: 22 },
  { label: 'Débit cardiaque', value: '5000 ml/min', page: 22 },
  { label: 'Débit O₂ / CO₂', value: '≈ 250 / 200 ml/min', page: 22 },
  { label: 'DLCO · DLO₂', value: '17 · 21 ml/min/mmHg', page: 26 },
  { label: 'PAO₂ · PaO₂', value: '≈ 105 · ≈ 100 mmHg', page: 34 },
]

export const SOURCES: SourceRef[] = [
  { chapterId: 'pr-10', page: 5, quote: 'air contains 79% nitrogen (N2), 21% O2 … a total atmospheric pressure (Patm) of 760mmHg' },
  { chapterId: 'pr-10', page: 6, quote: 'In air, PO2 = 160 mm Hg and PCO2 = 0.23 mm Hg (negligible)' },
  { chapterId: 'pr-10', page: 8, quote: 'A gas always diffuses from an area of high partial pressure to an area of low partial pressure' },
  { chapterId: 'pr-10', page: 9, quote: 'P gas = (Patm – PH2O) x Fgaz · PO2 = (760 – 47) x 0.21 ≈ 150 mmHg' },
  { chapterId: 'pr-10', page: 10, quote: 'a drop in alveolar PO2 which is then approximately 105 mm Hg' },
  { chapterId: 'pr-10', page: 12, quote: 'The alveolocapillary membrane: very thin from 0.3 to 0.5 μ, made up of … alveolar fluid film and the surfactant; alveolar epithelium; basement membrane …; interstitial space; capillary basement membrane; capillary endothelium' },
  { chapterId: 'pr-10', page: 14, quote: 'The blood entering the pulmonary capillary via the pulmonary artery is systemic venous blood, poor in O2 with a PO2 = 40 mm Hg and rich in CO2 with a PCO2 = 46 mm Hg' },
  { chapterId: 'pr-10', page: 18, quote: 'The diffusion … is governed by Fick’s law … V° gas = K x S (P1 - P2) / e' },
  { chapterId: 'pr-10', page: 20, quote: 'large ΔP between the blood which arrives in the pulmonary capillaries and the alveolar air; equilibrium is reached quickly (0.3-0.4s)' },
  { chapterId: 'pr-10', page: 21, quote: 'K of CO2 >> K of O2 because the solubility of CO2 >> is that of O2' },
  { chapterId: 'pr-10', page: 22, quote: 'alveolar ventilation of 4000 ml/min and a cardiac output of 5000 ml/min: the oxygen flow rate is approximately 250ml/min; the flow rate of carbon dioxide diffused is approximately 200ml/min' },
  { chapterId: 'pr-10', page: 26, quote: 'DLCO = 17ml/min/mmHg in young adults at rest → DLO₂ = 1.23×17 or 21ml/min/mmHg' },
  { chapterId: 'pr-10', page: 34, quote: 'In normal real lung PaO₂ < PAO₂ (slightly): PaO₂≈100mmHg and PAO₂≈105mmHg' },
]

export const LESSON: LessonRef = { slug: 'physiologie-respiratoire', chapterId: 'pr-10' }
