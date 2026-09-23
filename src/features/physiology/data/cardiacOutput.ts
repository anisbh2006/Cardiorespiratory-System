import type { LessonRef, SourceRef } from '../provenance'

/**
 * Cardiac-output data — every number and formula is taken verbatim from the
 * supplied course chapter "Le débit cardiaque" (pc-3).
 *
 * The interactive calculator only applies the course's own formulas:
 *   VE = VTD − VTS   (pc-3 p.12)
 *   DC = HR × VE     (pc-3 p.4)
 * with VTS held at the course's cited value (65 ml, pc-2 p.16 / pc-3 example).
 * No numeric Frank-Starling curve, contractility coefficient or BSA value is
 * invented — the chapter states those relationships qualitatively only.
 */

export const ESV = 65 // télésystolique, pc-3 p.12 (VE = VTD − VTS) ; pc-2 p.16
export const REST_EDV = 135 // pc-3 example / pc-2 p.16
export const REST_SV = 70 // pc-3 p.4 (VE 70 ml)
export const REST_HR = 72 // pc-3 p.4 (HR 72 beats/min)
export const REST_CO = 5 // pc-3 p.4 (DC = 72 × 0.07 = 5 l/min)

export const INTRINSIC_HR = 100 // pc-3 p.8 (spontaneous inherent frequency of the sinus node)
export const RESTING_HR = 70 // pc-3 p.9 (at rest, parasympathetic predominant → 70/min)

export const MAX_CO_LOW = 20 // pc-3 p.6
export const MAX_CO_HIGH = 25 // pc-3 p.6
export const MAX_CO_FACTOR_LOW = 4 // pc-3 p.6 (4 or 5 times resting)
export const MAX_CO_FACTOR_HIGH = 5
export const ATHLETE_CO = 35 // pc-3 p.6

export const HR_RANGE: [number, number] = [50, 180]
export const EDV_RANGE: [number, number] = [100, 180]

/** Ejection volume from the course formula VE = VTD − VTS (pc-3 p.12). */
export function strokeVolume(edv: number): number {
  return edv - ESV
}
/** Cardiac output from the course formula DC = HR × VE (pc-3 p.4), in L/min. */
export function cardiacOutput(hr: number, edv: number): number {
  return (hr * strokeVolume(edv)) / 1000
}

/* Determinants of ejection volume — pc-3 p.13 (verbatim). */
export interface Determinant {
  id: string
  label: string
  definition: string
}
export const DETERMINANTS: Determinant[] = [
  { id: 'preload', label: 'Précharge', definition: 'Variations du volume télédiastolique (VTD).' },
  { id: 'contractility', label: 'Contractilité', definition: 'Variations de l’amplitude des influx du système nerveux sympathique vers les ventricules.' },
  { id: 'afterload', label: 'Postcharge', definition: 'Variations de la pression dans les artères contre laquelle les ventricules doivent pomper.' },
]

/* Heart-rate control — pc-3 p.8–11 (verbatim). */
export const HR_FACTS: { label: string; value: string; page: number }[] = [
  { label: 'Fréquence intrinsèque (nœud sinusal, hors influences)', value: '100 batt/min', page: 8 },
  { label: 'Fréquence au repos (parasympathique prédominant)', value: '70 batt/min', page: 9 },
  { label: 'Sympathique / parasympathique', value: 'augmente / diminue la FC', page: 9 },
  { label: 'Conduction : sympathique / parasympathique', value: 'augmente / réduit la vitesse', page: 10 },
]

export const KEY_FACTS: { label: string; value: string; page: number }[] = [
  { label: 'Formule du débit', value: 'DC = HR × VE', page: 4 },
  { label: 'Exemple du cours', value: '72 × 0,07 = 5 L/min', page: 4 },
  { label: "Volume d'éjection", value: 'VE = VTD − VTS', page: 12 },
  { label: 'Index cardiaque', value: 'DC / surface corporelle', page: 5 },
  { label: 'Réserve cardiaque (max)', value: '20 à 25 L/min (4–5×)', page: 6 },
  { label: 'Athlète entraîné', value: "jusqu'à 35 L/min", page: 6 },
]

export const SOURCES: SourceRef[] = [
  { chapterId: 'pc-3', page: 4, quote: 'DC = HR x VE … If HR: 72 beats/min, VE: 70 ml, DC = 72 x 0.07 = 5 l/min' },
  { chapterId: 'pc-3', page: 5, quote: 'The cardiac index (CI) is the ratio of cardiac output to body surface area, expressed in l/min/m²' },
  { chapterId: 'pc-3', page: 6, quote: 'Maximum cardiac output can reach 4 or 5 times the resting cardiac output, i.e. 20 to 25 l/min. In a well-trained athlete, it can increase up to 35 l/min' },
  { chapterId: 'pc-3', page: 8, quote: 'the frequency of the rhythmic beats of the heart is 100 beats/min. It represents the spontaneous inherent frequency of the sinus node' },
  { chapterId: 'pc-3', page: 9, quote: 'At rest, parasympathetic activity is predominant with a frequency heart rate of 70 beats / min' },
  { chapterId: 'pc-3', page: 12, quote: 'VE = VTD - VTS · VTD: end-diastolic volume · VTS: end-systolic volume' },
  { chapterId: 'pc-3', page: 13, quote: 'preload: changes in end-diastolic volume · contractility … · afterload: changes in pressure in the arteries' },
  { chapterId: 'pc-3', page: 15, quote: 'The ejection volume therefore increases with the end-diastolic volume (TDV)' },
  { chapterId: 'pc-3', page: 18, quote: 'Ventricular contractility … is increased by sympathetic stimulation' },
]

export const LESSON: LessonRef = { slug: 'physiologie-cardiovasculaire', chapterId: 'pc-3' }
