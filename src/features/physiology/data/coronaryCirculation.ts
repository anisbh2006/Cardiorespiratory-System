import type { WavePoint } from '../waveform'
import type { LessonRef, SourceRef } from '../provenance'

/**
 * Coronary-circulation data — every number and mechanism is taken verbatim from
 * the supplied lecturee chapter "Coronary Circulation" (pc-6), with the cycle
 * timing (0.8 s; systole 0.3 s / diastole 0.5 s) from "The Cardiac Cycle" (pc-2).
 *
 * Schematic note: the *shape* of the phasic-flow curves is a drawing of the
 * sequence pc-6 describes (LV flow low during isovolumetric contraction, brief
 * rise at ejection onset, surge during relaxation, high throughout diastole; RV
 * flow equal in systole and diastole). The *landmarks* (0.8 / 0.6 ml/min/g,
 * ×4–5 at exercise, 70–80 % of LV flow in diastole, coronary sinus ≈ 75 %,
 * 25/10 vs 120/80 mmHg) are the lecturee's own.
 */

export const CYCLE_SECONDS = 0.8 // pc-2 p.3
export const SYSTOLE_END = 0.375 // 0.3 s / 0.8 s, pc-2 p.3
export const EJECTION_START = 0.055 // pc-2 (aortic opening)

export const FLOW_LV = 0.8 // ml/min/g, pc-6 p.11
export const FLOW_RV = 0.6 // ml/min/g, pc-6 p.11
export const EXERCISE_FACTOR_LOW = 4 // pc-6 p.11
export const EXERCISE_FACTOR_HIGH = 5
export const DIASTOLIC_FRACTION_LOW = 70 // pc-6 p.15 (70–80 % of LV flow)
export const DIASTOLIC_FRACTION_HIGH = 80
export const CORONARY_SINUS_PCT = 75 // pc-6 p.7

/* Pressures for the systemic vs pulmonary comparison (pc-2 p.26–27). */
export const AORTIC_PRESSURE = '120 / 80 mmHg'
export const PULMONARY_PRESSURE = '25 / 10 mmHg'

/** Phasic LV coronary flow (arbitrary units) — landmarks per pc-6 p.12–15. */
export const LV_CORO_FLOW: WavePoint[] = [
  { p: 0.0, v: 0.2 }, // isovolumetric contraction: high intramyocardial pressure, low flow (p.12)
  { p: 0.055, v: 0.45 }, // rise at start of ejection (p.14)
  { p: 0.12, v: 0.3 },
  { p: 0.3, v: 0.22 }, // decreases until start of relaxation (p.14)
  { p: 0.375, v: 0.32 },
  { p: 0.42, v: 0.8 }, // sudden increase during relaxation (p.15)
  { p: 0.5, v: 0.95 },
  { p: 0.7, v: 1.0 }, // high throughout diastole (p.15)
  { p: 0.85, v: 0.9 },
  { p: 0.95, v: 0.55 },
  { p: 0.99, v: 0.32 },
]

/** RV coronary flow — ensured equally during systole and diastole (pc-6 p.16). */
export const RV_CORO_FLOW: WavePoint[] = [
  { p: 0.0, v: 0.6 },
  { p: 0.2, v: 0.62 },
  { p: 0.375, v: 0.6 },
  { p: 0.6, v: 0.62 },
  { p: 0.8, v: 0.6 },
  { p: 0.99, v: 0.6 },
]

export const FLOW_SCALE = { min: 0, max: 1.1 }

/* Anatomy — pc-6 p.4–8 (verbatim). */
export const ANATOMY: { label: string; detail: string; page: number }[] = [
  { label: 'Origin', detail: 'Les grosses arterys coronaires naissent de la racine de l’aorte, à la surface du heart ; les petites arterys plongent dans la masse musculaire.', page: 4 },
  { label: 'Coronaire gauche', detail: 'Irrigue surtout les parois antérieure et latérale du left ventricle (VG).', page: 5 },
  { label: 'Coronaire droite', detail: 'Irrige le right ventricle (VD) et la paroi postérieure du heart.', page: 6 },
  { label: 'Retour veinux', detail: '≈ 75 % du retour veinux coronaire du VG via le sinus coronaire ; le VD retourne directement à l’right atrium par les petites veins cardiaques antérieures (et veins de Thebesius).', page: 7 },
  { label: 'Artères terminales', detail: 'Type terminal : l’obstruction totale d’une branche arrête la circulation de cette région → myocardial infarction.', page: 8 },
]

/* Functional characteristics — pc-6 p.9–10 (verbatim). */
export const FUNCTIONAL: string[] = [
  'Située dans un organe qui se contracte rythmiquement : au niveau du VG la tension atteint une valeur telle que les vaisseaux (même artériels) sont écrasés → l’irrigation est bloquée pendant une notable partie de la contraction.',
  'Le myocardium, toujours actif, a un métabolisme élevé : il requiert un apport important en nutriments et encore plus en oxygène.',
  'La pressure à l’entrée du system coronaire est celle qui règne dans l’aorte.',
]

export const KEY_FACTS: { label: string; value: string; page: number }[] = [
  { label: 'Flow moyen VG', value: '≈ 0,8 ml/min/g', page: 11 },
  { label: 'Flow moyen VD', value: '≈ 0,6 ml/min/g', page: 11 },
  { label: 'Multiplication à l’exercice', value: '× 4 à 5', page: 11 },
  { label: 'Part du flux VG en diastole', value: '70 à 80 %', page: 15 },
  { label: 'Sinus coronaire (retour VG)', value: '≈ 75 %', page: 7 },
  { label: 'Aorte (systolique/diastolique)', value: AORTIC_PRESSURE, page: 26 },
  { label: 'Pulmonary artery', value: PULMONARY_PRESSURE, page: 26 },
]

export const SOURCES: SourceRef[] = [
  { chapterId: 'pc-6', page: 3, quote: 'The coronary circulation or myocardial circulation is the nourishing circulation of the heart itself … connected directly to the arterial system' },
  { chapterId: 'pc-6', page: 5, quote: 'The left coronary mainly supplies the anterior and lateral walls of the left ventricle (LV)' },
  { chapterId: 'pc-6', page: 6, quote: 'The right coronary irrigates the right ventricle (RV) and the posterior wall of the heart' },
  { chapterId: 'pc-6', page: 7, quote: 'Most of the coronary venous return from the LV occurs through the coronary sinus which receives approximately 75% of the total coronary circulation' },
  { chapterId: 'pc-6', page: 8, quote: 'They are of the terminal type: the total obstruction of a branch therefore leads to the cessation of circulation in this region (myocardial infarction)' },
  { chapterId: 'pc-6', page: 9, quote: 'the vessels, even arterial ones, are crushed; it follows that irrigation is blocked during a notable part of the contraction' },
  { chapterId: 'pc-6', page: 11, quote: 'The average coronary flow is approximately 0.8 ml/min/g of myocardium for the left ventricle and 0.6 ml/min/g … can be multiplied by 4 or 5 during exercise' },
  { chapterId: 'pc-6', page: 12, quote: 'during the isovolumetric contraction phase, intramyocardial pressure is high and coronary flow is low' },
  { chapterId: 'pc-6', page: 14, quote: 'It increases at the start of the ventricular ejection phase … then it decreases until the start of the relaxation phase' },
  { chapterId: 'pc-6', page: 15, quote: 'During this relaxation phase, it increases suddenly to remain high throughout diastole. During this phase, 70 to 80% of the myocardial flow of the LV is ensured' },
  { chapterId: 'pc-6', page: 16, quote: 'In the RV, where the pressure is lower, coronary flow is ensured equally during systole and diastole' },
  { chapterId: 'pc-2', page: 3, quote: 'each cardiac cycle lasts approximately 0.8 s with 0.3 s for systole and 0.5 s for diastole' },
  { chapterId: 'pc-2', page: 26, quote: 'Pressures in the pulmonary artery — Systole 25 mmHg, Diastole 10 mmHg' },
  { chapterId: 'pc-2', page: 27, quote: 'The pulmonary circulation is a low pressure system … the volumes ejection of the two ventricles are identical' },
]

export const LESSON: LessonRef = { slug: 'physiologie-cardiovasculaire', chapterId: 'pc-6' }
