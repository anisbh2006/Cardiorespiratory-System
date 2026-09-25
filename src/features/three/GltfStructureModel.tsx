import * as React from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

interface GltfStructureModelProps {
  src: string
  selectedId: string | null
  onSelect: (structureId: string | null) => void
  onHover: (structureId: string | null) => void
  autoRotate: boolean
}

/**
 * Loads a supplied GLTF/GLB anatomy model.
 *
 * Convention: each anatomical structure is a named mesh whose name matches
 * (or is mapped to) a structure id from the lecturee data layer. Materials
 * are cloned so highlighting a structure does not affect its siblings.
 */
export function GltfStructureModel({
  src,
  selectedId,
  onSelect,
  onHover,
  autoRotate,
}: GltfStructureModelProps) {
  const { scene } = useGLTF(src)
  const groupRef = React.useRef<THREE.Group>(null)

  const cloned = React.useMemo(() => {
    const root = scene.clone(true)
    root.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        const mat = mesh.material as THREE.MeshStandardMaterial
        const clonedMat = mat.clone()
        clonedMat.emissive = new THREE.Color('#ff2a44')
        clonedMat.emissiveIntensity = 0.04
        mesh.material = clonedMat
      }
    })
    return root
  }, [scene])

  React.useEffect(() => {
    cloned.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return
      const mesh = child as THREE.Mesh
      const mat = mesh.material as THREE.MeshStandardMaterial
      const isSelected = mesh.name === selectedId
      mat.emissiveIntensity = isSelected ? 0.5 : 0.04
    })
  }, [cloned, selectedId])

  React.useEffect(() => {
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const delta = (now - last) / 1000
      last = now
      if (groupRef.current && autoRotate) groupRef.current.rotation.y += delta * 0.25
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [autoRotate])

  return (
    <group ref={groupRef} onPointerMissed={() => onSelect(null)}>
      <primitive
        object={cloned}
        onClick={(e: { stopPropagation: () => void; object: THREE.Object3D }) => {
          e.stopPropagation()
          onSelect(selectedId === e.object.name ? null : e.object.name)
        }}
        onPointerOver={(e: { stopPropagation: () => void; object: THREE.Object3D }) => {
          e.stopPropagation()
          onHover(e.object.name)
        }}
        onPointerOut={() => onHover(null)}
      />
    </group>
  )
}
