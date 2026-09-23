import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

/**
 * Part definitions for the interactive procedural heart.
 *
 * This is a stylized-but-anatomically-organized demonstration model built from
 * parametric geometry (chambers, great vessels, coronaries). It is NOT a
 * scanned anatomical asset and carries NO medical facts: every educational
 * statement is read from the course data layer (src/data), never from here.
 *
 * The model is data-driven: to add a structure, register it in
 * src/data/anatomy.ts and append a HeartPartDef below — hover, click,
 * highlight, labels, camera focus and the course-content panel pick it up
 * automatically. When a real GLTF heart is supplied, drop it in src/models/
 * and register it in modelRegistry; the viewer switches over unchanged.
 *
 * Orientation: +Y superior, +Z anterior (default camera), +X = patient's left.
 */

export interface HeartMaterialDef {
  color: string
  roughness: number
  metalness?: number
  clearcoat?: number
  clearcoatRoughness?: number
  sheen?: number
  sheenColor?: string
}

export interface HeartPartDef {
  structureId: string
  material: HeartMaterialDef
  build: () => THREE.BufferGeometry
  position: [number, number, number]
  rotation?: [number, number, number]
  /** World point the camera looks at when this structure is focused. */
  focusPoint: [number, number, number]
  /** Camera offset from focusPoint when focused. */
  focusOffset: [number, number, number]
}

/* ------------------------------------------------------------- helpers ---- */

function tube(points: [number, number, number][], radius: number, radial = 20): THREE.BufferGeometry {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)))
  return new THREE.TubeGeometry(curve, 48, radius, radial, false)
}

function merge(geoms: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const merged = mergeGeometries(geoms, false)
  geoms.forEach((g) => g.dispose())
  return merged ?? geoms[0]
}

/** Ellipsoid whose lower pole narrows toward an apex (ventricle-like). */
function chamber(
  rx: number,
  ry: number,
  rz: number,
  apexTaper = 0.5,
  seg = 48
): THREE.BufferGeometry {
  const g = new THREE.SphereGeometry(1, seg, seg)
  g.scale(rx, ry, rz)
  const pos = g.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i)
    const t = THREE.MathUtils.clamp((-y / ry + 1) / 2, 0, 1)
    const f = 1 - apexTaper * t * t
    pos.setX(i, pos.getX(i) * f)
    pos.setZ(i, pos.getZ(i) * f)
  }
  pos.needsUpdate = true
  g.computeVertexNormals()
  return g
}

function blob(rx: number, ry: number, rz: number, seg = 40): THREE.BufferGeometry {
  const g = new THREE.SphereGeometry(1, seg, seg)
  g.scale(rx, ry, rz)
  return g
}

/* ------------------------------------------------------------ materials ---- */

const MYOCARDIUM: HeartMaterialDef = {
  color: '#8e1b2a',
  roughness: 0.42,
  metalness: 0.05,
  clearcoat: 0.55,
  clearcoatRoughness: 0.5,
  sheen: 0.6,
  sheenColor: '#ff5a6e',
}
const ATRIUM: HeartMaterialDef = {
  color: '#a3243a',
  roughness: 0.48,
  metalness: 0.04,
  clearcoat: 0.45,
  clearcoatRoughness: 0.55,
  sheen: 0.5,
  sheenColor: '#ff6b7d',
}
const AORTA_MAT: HeartMaterialDef = {
  color: '#b0505e',
  roughness: 0.3,
  metalness: 0.06,
  clearcoat: 0.8,
  clearcoatRoughness: 0.3,
  sheen: 0.4,
  sheenColor: '#ff8a94',
}
const PULM_TRUNK: HeartMaterialDef = {
  color: '#5a5f96',
  roughness: 0.34,
  metalness: 0.05,
  clearcoat: 0.7,
  clearcoatRoughness: 0.35,
  sheen: 0.35,
  sheenColor: '#8f96d8',
}
const VEIN_MAT: HeartMaterialDef = {
  color: '#3d5a80',
  roughness: 0.4,
  metalness: 0.05,
  clearcoat: 0.6,
  clearcoatRoughness: 0.4,
  sheen: 0.3,
  sheenColor: '#7fa3d0',
}
const PULM_VEIN_MAT: HeartMaterialDef = {
  color: '#9e2a3a',
  roughness: 0.36,
  metalness: 0.05,
  clearcoat: 0.65,
  clearcoatRoughness: 0.38,
  sheen: 0.35,
  sheenColor: '#ff7a88',
}

/* ---------------------------------------------------------------- parts ---- */

export const heartParts: HeartPartDef[] = [
  {
    structureId: 'left-ventricle',
    material: MYOCARDIUM,
    build: () => chamber(0.78, 1.15, 0.74, 0.88),
    position: [0.42, -0.5, 0.12],
    rotation: [0, 0, 0.42],
    focusPoint: [0.45, -0.55, 0.2],
    focusOffset: [1.5, -0.3, 2.4],
  },
  {
    structureId: 'right-ventricle',
    material: { ...MYOCARDIUM, color: '#96202f' },
    build: () => chamber(0.62, 0.95, 0.5, 0.6),
    position: [-0.34, -0.28, 0.5],
    rotation: [0, 0, 0.18],
    focusPoint: [-0.34, -0.3, 0.55],
    focusOffset: [-1.1, -0.2, 2.5],
  },
  {
    structureId: 'left-atrium',
    material: ATRIUM,
    build: () => blob(0.6, 0.55, 0.5),
    position: [0.55, 0.62, -0.45],
    focusPoint: [0.55, 0.62, -0.45],
    focusOffset: [1.6, 0.7, -2.1],
  },
  {
    structureId: 'right-atrium',
    material: { ...ATRIUM, color: '#ad2b40' },
    build: () =>
      merge([
        blob(0.56, 0.62, 0.55),
        (() => {
          const a = blob(0.24, 0.2, 0.22, 24)
          a.translate(-0.15, 0.42, 0.42)
          return a
        })(),
      ]),
    position: [-0.78, 0.45, 0.08],
    focusPoint: [-0.78, 0.45, 0.1],
    focusOffset: [-1.9, 0.6, 1.7],
  },
  {
    structureId: 'aorta',
    material: AORTA_MAT,
    build: () =>
      merge([
        // ascending + arch + descending
        tube(
          [
            [0.05, 0.45, 0.1],
            [0.1, 1.1, 0.05],
            [0.28, 1.5, -0.12],
            [0.62, 1.45, -0.35],
            [0.72, 0.9, -0.5],
            [0.68, 0.0, -0.55],
            [0.66, -0.9, -0.55],
          ],
          0.16
        ),
        // arch branches (brachiocephalic / carotid / subclavian)
        tube([[0.2, 1.42, -0.05], [0.24, 1.85, -0.02]], 0.06, 12),
        tube([[0.4, 1.5, -0.15], [0.45, 1.92, -0.14]], 0.055, 12),
        tube([[0.58, 1.46, -0.28], [0.66, 1.86, -0.3]], 0.05, 12),
      ]),
    position: [0, 0, 0],
    focusPoint: [0.35, 1.25, -0.2],
    focusOffset: [0.9, 1.1, 2.3],
  },
  {
    structureId: 'pulmonary-artery',
    material: PULM_TRUNK,
    build: () =>
      merge([
        // pulmonary trunk
        tube(
          [
            [-0.2, 0.35, 0.5],
            [-0.14, 0.9, 0.4],
            [-0.05, 1.25, 0.28],
          ],
          0.14
        ),
        // left pulmonary artery
        tube([[-0.05, 1.25, 0.28], [0.4, 1.35, 0.12], [0.8, 1.3, 0.0]], 0.1, 14),
        // right pulmonary artery
        tube([[-0.05, 1.25, 0.28], [-0.5, 1.32, 0.1], [-0.9, 1.28, -0.02]], 0.1, 14),
      ]),
    position: [0, 0, 0],
    focusPoint: [-0.05, 1.1, 0.3],
    focusOffset: [-0.6, 1.0, 2.3],
  },
  {
    structureId: 'superior-vena-cava',
    material: VEIN_MAT,
    build: () =>
      tube(
        [
          [-0.86, 1.8, -0.02],
          [-0.83, 1.3, 0.0],
          [-0.8, 0.85, 0.05],
        ],
        0.12
      ),
    position: [0, 0, 0],
    focusPoint: [-0.84, 1.4, 0.0],
    focusOffset: [-1.4, 1.3, 1.8],
  },
  {
    structureId: 'inferior-vena-cava',
    material: VEIN_MAT,
    build: () =>
      tube(
        [
          [-0.88, -1.5, -0.08],
          [-0.84, -0.8, -0.03],
          [-0.8, -0.1, 0.02],
        ],
        0.13
      ),
    position: [0, 0, 0],
    focusPoint: [-0.85, -0.9, -0.03],
    focusOffset: [-1.5, -0.9, 1.7],
  },
  {
    structureId: 'pulmonary-veins',
    material: PULM_VEIN_MAT,
    build: () =>
      merge([
        tube([[1.5, 0.85, -0.62], [1.0, 0.75, -0.55], [0.7, 0.68, -0.5]], 0.08, 12),
        tube([[1.5, 0.35, -0.62], [1.0, 0.4, -0.55], [0.7, 0.45, -0.5]], 0.08, 12),
        tube([[-1.4, 0.8, -0.66], [-0.6, 0.72, -0.6], [0.1, 0.66, -0.55]], 0.08, 12),
        tube([[-1.4, 0.3, -0.66], [-0.6, 0.36, -0.6], [0.1, 0.42, -0.55]], 0.08, 12),
      ]),
    position: [0, 0, 0],
    focusPoint: [0.4, 0.6, -0.6],
    focusOffset: [0.8, 0.6, -2.2],
  },
]

/** Decorative coronary vessels — rendered for realism, never selectable. */
export const coronaryVessels: { geometry: THREE.BufferGeometry; color: string }[] = [
  {
    // LAD down the interventricular groove
    geometry: tube(
      [
        [0.02, 0.3, 0.62],
        [0.12, -0.2, 0.72],
        [0.28, -0.8, 0.6],
        [0.42, -1.25, 0.4],
      ],
      0.028,
      10
    ),
    color: '#d2404f',
  },
  {
    // RCA along the right atrioventricular groove
    geometry: tube(
      [
        [-0.55, 0.15, 0.5],
        [-0.72, -0.2, 0.42],
        [-0.7, -0.7, 0.3],
      ],
      0.026,
      10
    ),
    color: '#c93a48',
  },
]

/** Label anchor positions (surface points) for the 3D annotations. */
export const labelAnchors: Record<string, [number, number, number]> = {
  'left-ventricle': [0.75, -0.7, 0.6],
  'right-ventricle': [-0.6, -0.35, 0.9],
  'left-atrium': [0.95, 0.85, -0.3],
  'right-atrium': [-1.15, 0.6, 0.35],
  aorta: [0.5, 1.6, -0.1],
  'pulmonary-artery': [-0.1, 1.4, 0.4],
  'superior-vena-cava': [-0.95, 1.85, 0],
  'inferior-vena-cava': [-0.98, -1.5, -0.05],
  'pulmonary-veins': [1.5, 0.6, -0.62],
}

export type ViewPreset = 'anterior' | 'posterior' | 'left' | 'right' | 'superior'

export const viewPresets: Record<ViewPreset, [number, number, number]> = {
  anterior: [0, 0.3, 5.2],
  posterior: [0, 0.3, -5.2],
  left: [5.2, 0.3, 0],
  right: [-5.2, 0.3, 0],
  superior: [0, 5.2, 0.4],
}

/** Default orbit target (heart centre). */
export const HOME_TARGET: [number, number, number] = [0, 0.1, 0]
