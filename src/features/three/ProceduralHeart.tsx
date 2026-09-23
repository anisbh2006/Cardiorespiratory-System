import * as React from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { coronaryVessels, heartParts, labelAnchors, type HeartPartDef } from './heartParts'

interface ProceduralHeartProps {
  selectedId: string | null
  onSelect: (structureId: string | null) => void
  hoveredId: string | null
  onHover: (structureId: string | null) => void
  showLabels: boolean
  autoRotate: boolean
  /** DOM nodes (rendered by the viewer overlay) positioned each frame. */
  labelElements?: React.MutableRefObject<Record<string, HTMLElement | null>>
}

function Part({
  def,
  selected,
  hovered,
  onSelect,
  onHover,
}: {
  def: HeartPartDef
  selected: boolean
  hovered: boolean
  onSelect: (id: string | null) => void
  onHover: (id: string | null) => void
}) {
  const meshRef = React.useRef<THREE.Mesh>(null)
  const geometry = React.useMemo(() => def.build(), [def])
  const emissiveTarget = selected ? 0.5 : hovered ? 0.26 : 0.03
  const emissiveIntensity = React.useRef(0.03)

  useFrame((_, delta) => {
    const mesh = meshRef.current
    if (!mesh) return
    const mat = mesh.material as THREE.MeshPhysicalMaterial
    emissiveIntensity.current = THREE.MathUtils.damp(
      emissiveIntensity.current,
      emissiveTarget,
      8,
      delta
    )
    mat.emissiveIntensity = emissiveIntensity.current
    const scaleTarget = selected ? 1.03 : 1
    const s = THREE.MathUtils.damp(mesh.scale.x, scaleTarget, 8, delta)
    mesh.scale.setScalar(s)
  })

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={def.position}
      rotation={def.rotation ? new THREE.Euler(...def.rotation) : undefined}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(selected ? null : def.structureId)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        onHover(def.structureId)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        onHover(null)
        document.body.style.cursor = 'auto'
      }}
    >
      <meshPhysicalMaterial
        color={def.material.color}
        roughness={def.material.roughness}
        metalness={def.material.metalness ?? 0.05}
        clearcoat={def.material.clearcoat ?? 0.5}
        clearcoatRoughness={def.material.clearcoatRoughness ?? 0.45}
        sheen={def.material.sheen ?? 0.4}
        sheenColor={def.material.sheenColor ?? '#ff5a6e'}
        emissive="#ff2a44"
        emissiveIntensity={0.03}
      />
    </mesh>
  )
}

/** Non-interactive coronary vessels, rendered for anatomical realism. */
function Coronaries() {
  return (
    <group>
      {coronaryVessels.map((v, i) => (
        <mesh key={i} geometry={v.geometry}>
          <meshPhysicalMaterial
            color={v.color}
            roughness={0.35}
            clearcoat={0.7}
            clearcoatRoughness={0.35}
            emissive={v.color}
            emissiveIntensity={0.12}
          />
        </mesh>
      ))}
    </group>
  )
}

export function ProceduralHeart({
  selectedId,
  onSelect,
  hoveredId,
  onHover,
  autoRotate,
  labelElements,
}: ProceduralHeartProps) {
  const groupRef = React.useRef<THREE.Group>(null)
  const { camera, size } = useThree()
  const projected = React.useMemo(() => new THREE.Vector3(), [])

  useFrame((state, delta) => {
    const group = groupRef.current
    if (!group) return

    if (autoRotate && !hoveredId && !selectedId) {
      group.rotation.y += delta * 0.22
    }

    // subtle heartbeat-like breathing when idle
    const t = state.clock.elapsedTime
    const beat = 1 + Math.sin(t * 2.1) * 0.006 + Math.sin(t * 4.2) * 0.004
    group.scale.setScalar(beat)

    // Project each label anchor into screen space and drive the DOM pill.
    const els = labelElements?.current
    if (els) {
      const halfW = size.width / 2
      const halfH = size.height / 2
      for (const def of heartParts) {
        const el = els[def.structureId]
        if (!el) continue
        const anchor = labelAnchors[def.structureId]
        if (!anchor) {
          el.style.display = 'none'
          continue
        }
        projected.set(anchor[0], anchor[1], anchor[2])
        group.localToWorld(projected)
        projected.project(camera)
        if (projected.z > 1) {
          el.style.display = 'none'
          continue
        }
        el.style.display = ''
        el.style.transform = `translate3d(${projected.x * halfW}px, ${
          -projected.y * halfH
        }px, 0) translate(-50%, -50%)`
      }
    }
  })

  return (
    <group ref={groupRef} onPointerMissed={() => onSelect(null)}>
      {heartParts.map((def) => (
        <Part
          key={def.structureId}
          def={def}
          selected={selectedId === def.structureId}
          hovered={hoveredId === def.structureId}
          onSelect={onSelect}
          onHover={onHover}
        />
      ))}

      <Coronaries />
    </group>
  )
}
