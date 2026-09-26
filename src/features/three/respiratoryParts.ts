import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export interface RespiratoryMaterialDef {
  color: string
  roughness: number
  metalness?: number
  clearcoat?: number
  clearcoatRoughness?: number
  sheen?: number
  sheenColor?: string
  transparent?: boolean
  opacity?: number
}

export interface RespiratoryPartDef {
  structureId: string
  material: RespiratoryMaterialDef
  build: () => THREE.BufferGeometry
  position: [number, number, number]
  rotation?: [number, number, number]
  focusPoint: [number, number, number]
  focusOffset: [number, number, number]
}

function tube(points: [number, number, number][], radius: number, radial = 18): THREE.BufferGeometry {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)))
  return new THREE.TubeGeometry(curve, 60, radius, radial, false)
}

function merge(geoms: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const merged = mergeGeometries(geoms, false)
  geoms.forEach((g) => g.dispose())
  return merged ?? geoms[0]
}

function blob(rx: number, ry: number, rz: number, seg = 44): THREE.BufferGeometry {
  const g = new THREE.SphereGeometry(1, seg, seg)
  g.scale(rx, ry, rz)
  return g
}

const AIRWAY: RespiratoryMaterialDef = {
  color: '#a9d8ff',
  roughness: 0.28,
  metalness: 0.05,
  clearcoat: 0.74,
  clearcoatRoughness: 0.25,
  sheen: 0.42,
  sheenColor: '#dff4ff',
}

const LUNG: RespiratoryMaterialDef = {
  color: '#8d1d2f',
  roughness: 0.46,
  metalness: 0.04,
  clearcoat: 0.68,
  clearcoatRoughness: 0.35,
  sheen: 0.44,
  sheenColor: '#ff7587',
}

const PLEURA: RespiratoryMaterialDef = {
  color: '#dfe9f8',
  roughness: 0.28,
  metalness: 0.08,
  clearcoat: 0.75,
  clearcoatRoughness: 0.26,
  transparent: true,
  opacity: 0.28,
}

const DIAPHRAGM: RespiratoryMaterialDef = {
  color: '#c2d0e6',
  roughness: 0.55,
  metalness: 0.06,
  clearcoat: 0.48,
  clearcoatRoughness: 0.45,
}

const LARYNX: RespiratoryMaterialDef = {
  color: '#b9717d',
  roughness: 0.38,
  metalness: 0.05,
  clearcoat: 0.55,
  clearcoatRoughness: 0.42,
}

export const HOME_TARGET = [0, 0.5, 0] as const

export const respiratoryViewPresets = {
  anterior: [0, 0.8, 5.8],
  posterior: [0, 0.7, -5.8],
  left: [-5.6, 0.8, 0.2],
  right: [5.6, 0.8, 0.2],
  superior: [0, 5.7, 0.4],
} as const

export const respiratoryParts: RespiratoryPartDef[] = [
  {
    structureId: 'trachea',
    material: AIRWAY,
    build: () =>
      tube(
        [
          [0, 1.8, 0],
          [0, 1.3, 0.2],
          [0, 0.9, 0.35],
          [0.15, 0.5, 0.28],
          [0.28, 0.1, 0.12],
        ],
        0.14
      ),
    position: [0, 0, 0],
    focusPoint: [0.1, 0.7, 0.2],
    focusOffset: [0.8, 0.8, 3.1],
  },
  {
    structureId: 'left-main-bronchus',
    material: AIRWAY,
    build: () =>
      tube(
        [
          [0.12, 0.35, 0.12],
          [-0.32, 0.08, 0.18],
          [-0.9, -0.25, 0.2],
          [-1.25, -0.6, 0.18],
        ],
        0.11
      ),
    position: [0, 0, 0],
    focusPoint: [-0.7, -0.1, 0.2],
    focusOffset: [-1.8, 0.5, 2.3],
  },
  {
    structureId: 'right-main-bronchus',
    material: AIRWAY,
    build: () =>
      tube(
        [
          [0.12, 0.35, 0.12],
          [0.55, 0.08, 0.05],
          [1.18, -0.1, 0.08],
          [1.62, -0.42, 0.14],
        ],
        0.11
      ),
    position: [0, 0, 0],
    focusPoint: [1.0, -0.05, 0.12],
    focusOffset: [2.2, 0.6, 1.8],
  },
  {
    structureId: 'bronchial-tree',
    material: { ...AIRWAY, opacity: 0.9 },
    build: () =>
      merge([
        tube(
          [
            [1.68, -0.38, 0.18],
            [2.6, -0.8, 0.22],
            [3.0, -1.1, 0.28],
          ],
          0.07
        ),
        tube(
          [
            [-1.32, -0.68, 0.18],
            [-2.25, -1.08, 0.08],
            [-2.9, -1.42, 0.1],
          ],
          0.07
        ),
        tube(
          [
            [0.9, -0.75, 0.45],
            [1.4, -1.35, 0.85],
            [1.7, -1.92, 1.1],
          ],
          0.05
        ),
        tube(
          [
            [-1.1, -0.9, 0.5],
            [-1.7, -1.6, 0.9],
            [-2.1, -2.15, 1.3],
          ],
          0.05
        ),
      ]),
    position: [0, 0, 0],
    focusPoint: [0.1, -1.0, 0.4],
    focusOffset: [0.5, -0.6, 4.0],
  },
  {
    structureId: 'right-lung',
    material: LUNG,
    build: () => merge([blob(1.4, 1.8, 1.2), blob(0.82, 1.1, 0.9)]),
    position: [1.5, -0.15, 0.2],
    focusPoint: [1.65, -0.15, 0.25],
    focusOffset: [2.7, 0.6, 2.5],
  },
  {
    structureId: 'left-lung',
    material: { ...LUNG, color: '#8b2333' },
    build: () => merge([blob(1.3, 1.6, 1.1), blob(0.7, 1.1, 0.8)]),
    position: [-1.55, -0.1, 0.15],
    focusPoint: [-1.75, -0.1, 0.15],
    focusOffset: [-2.8, 0.6, 2.5],
  },
  {
    structureId: 'pleura',
    material: PLEURA,
    build: () => merge([blob(2.0, 2.25, 1.45), blob(1.75, 2.0, 1.25)]),
    position: [0, -0.1, 0],
    focusPoint: [0.1, 0.5, 0.1],
    focusOffset: [0.8, 1.2, 3.7],
  },
  {
    structureId: 'diaphragm',
    material: DIAPHRAGM,
    build: () => {
      const geometry = new THREE.CylinderGeometry(2.2, 2.6, 0.18, 48, 1, true)
      geometry.rotateX(Math.PI / 2)
      return geometry
    },
    position: [0, -1.8, 0.15],
    rotation: [0, 0, 0],
    focusPoint: [0, -1.8, 0.2],
    focusOffset: [0.7, -2.3, 3.8],
  },
  {
    structureId: 'larynx',
    material: LARYNX,
    build: () => {
      const geometry = new THREE.TorusGeometry(0.42, 0.18, 20, 42, Math.PI)
      geometry.rotateY(Math.PI / 2)
      return geometry
    },
    position: [0, 1.8, 0],
    focusPoint: [0, 1.8, 0.2],
    focusOffset: [0.8, 1.3, 3.0],
  },
]

export const respiratoryLabelAnchors: Record<string, [number, number, number]> = {
  trachea: [0.0, 1.2, 0.1],
  'left-main-bronchus': [-0.8, -0.25, 0.28],
  'right-main-bronchus': [1.1, -0.1, 0.2],
  'bronchial-tree': [0.0, -0.8, 0.55],
  'right-lung': [1.7, 0.25, 0.7],
  'left-lung': [-1.8, 0.2, 0.6],
  pleura: [0.0, 0.8, 1.0],
  diaphragm: [0.0, -1.8, 0.8],
  larynx: [0.0, 2.1, 0.2],
}

export type RespiratoryViewPreset = keyof typeof respiratoryViewPresets
