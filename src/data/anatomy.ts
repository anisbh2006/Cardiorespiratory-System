import type { AnatomyStructure } from './types'

/**
 * Anatomical structures named in the project specification.
 *
 * Educational fields (definition, location, relations, function) are left
 * empty and marked 'awaiting-source': they must be populated exclusively
 * from the supplied course files — never invented.
 */
export const anatomyStructures: AnatomyStructure[] = [
  // ---- Cardiovascular ----
  { id: 'right-atrium', system: 'cardiovascular', nameFr: 'Atrium droit', nameEn: 'Right atrium', lessonId: 'ac-3', relatedLessonIds: ['ac-5', 'ac-8'], searchTerms: ['right atrium', 'atrium droit', 'right auricle', 'oreillette droite'], status: 'awaiting-source' },
  { id: 'left-atrium', system: 'cardiovascular', nameFr: 'Atrium gauche', nameEn: 'Left atrium', lessonId: 'ac-3', relatedLessonIds: ['ac-5'], searchTerms: ['left atrium', 'atrium gauche', 'left auricle', 'oreillette gauche'], status: 'awaiting-source' },
  { id: 'right-ventricle', system: 'cardiovascular', nameFr: 'Ventricule droit', nameEn: 'Right ventricle', lessonId: 'ac-3', relatedLessonIds: ['ac-5'], searchTerms: ['right ventricle', 'ventricule droit'], status: 'awaiting-source' },
  { id: 'left-ventricle', system: 'cardiovascular', nameFr: 'Ventricule gauche', nameEn: 'Left ventricle', lessonId: 'ac-3', relatedLessonIds: ['ac-5', 'pc-2'], searchTerms: ['left ventricle', 'ventricule gauche'], status: 'awaiting-source' },
  { id: 'aorta', system: 'cardiovascular', nameFr: 'Aorte', nameEn: 'Aorta', lessonId: 'ac-7', relatedLessonIds: ['ac-5'], searchTerms: ['aorta', 'aorte', 'aortic'], status: 'awaiting-source' },
  { id: 'pulmonary-artery', system: 'cardiovascular', nameFr: 'Artère pulmonaire', nameEn: 'Pulmonary artery', lessonId: 'ac-5', searchTerms: ['pulmonary artery', 'pulmonary trunk', 'artère pulmonaire', 'tronc pulmonaire'], status: 'awaiting-source' },
  { id: 'pulmonary-veins', system: 'cardiovascular', nameFr: 'Veines pulmonaires', nameEn: 'Pulmonary veins', lessonId: 'ac-5', searchTerms: ['pulmonary vein', 'veine pulmonaire'], status: 'awaiting-source' },
  { id: 'superior-vena-cava', system: 'cardiovascular', nameFr: 'Veine cave supérieure', nameEn: 'Superior vena cava', lessonId: 'ac-8', searchTerms: ['superior vena cava', 'veine cave supérieure'], status: 'awaiting-source' },
  { id: 'inferior-vena-cava', system: 'cardiovascular', nameFr: 'Veine cave inférieure', nameEn: 'Inferior vena cava', lessonId: 'ac-8', searchTerms: ['inferior vena cava', 'veine cave inférieure'], status: 'awaiting-source' },
  // ---- Respiratory ----
  { id: 'lungs', system: 'respiratory', nameFr: 'Poumons', nameEn: 'Lungs', lessonId: 'ar-12', searchTerms: ['lung', 'poumon', 'pulmonary'], status: 'awaiting-source' },
  { id: 'trachea', system: 'respiratory', nameFr: 'Trachée', nameEn: 'Trachea', lessonId: 'ar-11', searchTerms: ['trachea', 'trachée'], status: 'awaiting-source' },
  { id: 'bronchi', system: 'respiratory', nameFr: 'Bronches', nameEn: 'Bronchi', lessonId: 'ar-11', searchTerms: ['bronch', 'bronche'], status: 'awaiting-source' },
  { id: 'bronchioles', system: 'respiratory', nameFr: 'Bronchioles', nameEn: 'Bronchioles', lessonId: 'ar-12', searchTerms: ['bronchiole'], status: 'awaiting-source' },
  { id: 'thoracic-cavity', system: 'respiratory', nameFr: 'Cavité thoracique', nameEn: 'Thoracic cavity', lessonId: 'ac-1', searchTerms: ['thoracic cavity', 'cavité thoracique', 'thoracic wall', 'paroi thoracique'], status: 'awaiting-source' },
]

export function getStructure(id: string): AnatomyStructure | undefined {
  return anatomyStructures.find((s) => s.id === id)
}

export function getStructuresBySystem(system: AnatomyStructure['system']): AnatomyStructure[] {
  return anatomyStructures.filter((s) => s.system === system)
}

/**
 * 3D model registry.
 *
 * Maps a model id to a GLTF/GLB asset path. When models are supplied or
 * sourced, drop the files into src/models/ and register them here —
 * the viewer architecture picks them up without further changes.
 */
export const modelRegistry: Record<string, string> = {
  // 'heart': new URL('../models/heart.glb', import.meta.url).href,
  // 'lungs': new URL('../models/lungs.glb', import.meta.url).href,
}
