import * as React from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, OrbitControls, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { Crosshair, Maximize, RotateCcw, Tags } from 'lucide-react'
import { ProceduralHeart } from './ProceduralHeart'
import { ProceduralRespiratory } from './ProceduralRespiratory'
import { GltfStructureModel } from './GltfStructureModel'
import { getStructure, modelRegistry } from '@/data/anatomy'
import { heartParts, labelAnchors, viewPresets, HOME_TARGET, type ViewPreset } from './heartParts'
import { respiratoryParts, respiratoryLabelAnchors, respiratoryViewPresets, HOME_TARGET as RESP_HOME_TARGET } from './respiratoryParts'
import { cn } from '@/lib/utils'

export interface CameraFocus {
  point: THREE.Vector3
  offset: THREE.Vector3
}

interface AnatomyViewerProps {
  modelId?: string
  selectedId: string | null
  onSelect: (id: string | null) => void
  showLabels?: boolean
  onToggleLabels?: () => void
  className?: string
  compact?: boolean
}

/**
 * Cinematic three-point lighting rig: warm key with soft shadows, medical-red
 * rim from behind-left, cool counter-rim from behind-right and a faint fill.
 * Tuned for a dark "anatomy laboratory" environment.
 */
function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.22} />
      <spotLight
        position={[5, 7, 6]}
        angle={0.4}
        penumbra={0.9}
        intensity={170}
        color="#fff2ec"
        castShadow
        shadow-bias={-0.0001}
      />
      <spotLight position={[-6, 3, -5]} angle={0.6} penumbra={1} intensity={90} color="#e0243a" />
      <pointLight position={[4, -2, -6]} intensity={40} color="#3f6fb0" />
      <pointLight position={[-4, 1, 4]} intensity={22} color="#ffd9d0" />
      <directionalLight position={[0, 6, -2]} intensity={0.4} color="#9fb6d8" />
    </>
  )
}

/**
 * Smoothly flies the camera + orbit target to a focus (structure or preset).
 * User input cancels the flight (OrbitControls onStart clears the focus).
 */
function CameraController({
  focus,
  onArrived,
}: {
  focus: CameraFocus | null
  onArrived: () => void
}) {
  const controls = useThree((s) => s.controls) as
    | (THREE.EventDispatcher & { target: THREE.Vector3; enabled: boolean; update: () => void })
    | null
  const camera = useThree((s) => s.camera)
  const flying = React.useRef(false)

  React.useEffect(() => {
    if (focus && controls) {
      flying.current = true
      controls.enabled = false
    }
  }, [focus, controls])

  useFrame((_, delta) => {
    if (!focus || !flying.current || !controls) return
    const dest = focus.point.clone().add(focus.offset)
    const k = 1 - Math.pow(0.0016, delta)
    controls.target.lerp(focus.point, k)
    camera.position.lerp(dest, k)
    camera.lookAt(controls.target)
    if (camera.position.distanceTo(dest) < 0.04 && controls.target.distanceTo(focus.point) < 0.04) {
      flying.current = false
      controls.enabled = true
      controls.update()
      onArrived()
    }
  })
  return null
}

export function AnatomyViewer({
  modelId,
  selectedId,
  onSelect,
  showLabels = true,
  onToggleLabels,
  className,
  compact = false,
}: AnatomyViewerProps) {
  const [hoveredId, setHoveredId] = React.useState<string | null>(null)
  const [autoRotate, setAutoRotate] = React.useState(!compact)
  const [focus, setFocus] = React.useState<CameraFocus | null>(null)
  const [internalLabels, setInternalLabels] = React.useState(true)
  const labelEls = React.useRef<Record<string, HTMLElement | null>>({})

  const labelsOn = onToggleLabels ? showLabels : internalLabels
  const toggleLabels = onToggleLabels ?? (() => setInternalLabels((v) => !v))

  const modelSrc = modelId ? modelRegistry[modelId] : undefined
  const isRespiratory = modelId === 'lungs'
  const showLabelOverlay = labelsOn && !modelSrc && !compact

  // Fly to a structure when it is selected.
  React.useEffect(() => {
    if (!selectedId) return
    const parts = isRespiratory ? respiratoryParts : heartParts
    const def = parts.find((p) => p.structureId === selectedId)
    if (!def) return
    setAutoRotate(false)
    setFocus({
      point: new THREE.Vector3(...def.focusPoint),
      offset: new THREE.Vector3(...def.focusOffset),
    })
  }, [selectedId, isRespiratory])

  const goToPreset = (preset: ViewPreset) => {
    setAutoRotate(false)
    setFocus({
      point: new THREE.Vector3(...(isRespiratory ? RESP_HOME_TARGET : HOME_TARGET)),
      offset: new THREE.Vector3(...(isRespiratory ? respiratoryViewPresets[preset] : viewPresets[preset])),
    })
  }

  const resetCamera = () => {
    onSelect(null)
    setAutoRotate(!compact)
    setFocus({
      point: new THREE.Vector3(...(isRespiratory ? RESP_HOME_TARGET : HOME_TARGET)),
      offset: new THREE.Vector3(...(isRespiratory ? respiratoryViewPresets.anterior : viewPresets.anterior)),
    })
  }

  const focusOnHovered = () => {
    const id = hoveredId ?? selectedId
    if (!id) return
    const parts = isRespiratory ? respiratoryParts : heartParts
    const def = parts.find((p) => p.structureId === id)
    if (!def) return
    setAutoRotate(false)
    setFocus({
      point: new THREE.Vector3(...def.focusPoint),
      offset: new THREE.Vector3(...def.focusOffset),
    })
  }

  const presetItems: { key: ViewPreset; label: string }[] = [
    { key: 'anterior', label: 'Anterior' },
    { key: 'posterior', label: 'Posterior' },
    { key: 'left', label: 'Left lateral' },
    { key: 'right', label: 'Right lateral' },
    { key: 'superior', label: 'Superior' },
  ]

  return (
    <div
      role="group"
      aria-label="Visualisation anatomique 3D interactive"
      className={cn(
        'relative overflow-hidden rounded-xl border border-border bg-[#08080b]',
        className
      )}
    >
      <Canvas
        dpr={[1, 2]}
        shadows="percentage"
        camera={{ position: viewPresets.anterior, fov: 42 }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.12
        }}
      >
        <color attach="background" args={['#08080b']} />
        <fog attach="fog" args={['#08080b', 9, 20]} />
        <SceneLights />
        <Sparkles count={compact ? 26 : 60} scale={7} size={1.3} speed={0.22} color="#e0243a" opacity={0.3} />

        {modelSrc ? (
          <GltfStructureModel
            src={modelSrc}
            selectedId={selectedId}
            onSelect={onSelect}
            onHover={setHoveredId}
            autoRotate={autoRotate}
          />
        ) : isRespiratory ? (
          <ProceduralRespiratory
            selectedId={selectedId}
            onSelect={onSelect}
            hoveredId={hoveredId}
            onHover={setHoveredId}
            showLabels={labelsOn}
            autoRotate={autoRotate}
            labelElements={showLabelOverlay ? labelEls : undefined}
          />
        ) : (
          <ProceduralHeart
            selectedId={selectedId}
            onSelect={onSelect}
            hoveredId={hoveredId}
            onHover={setHoveredId}
            showLabels={labelsOn}
            autoRotate={autoRotate}
            labelElements={showLabelOverlay ? labelEls : undefined}
          />
        )}

        <ContactShadows position={[0, -2.0, 0]} opacity={0.55} scale={11} blur={2.6} far={4.5} color="#000000" />

        <OrbitControls
          makeDefault
          enablePan
          enableZoom
          enableRotate
          enableDamping
          dampingFactor={0.08}
          minDistance={2.2}
          maxDistance={11}
          onStart={() => setFocus(null)}
        />
        <CameraController focus={focus} onArrived={() => setFocus(null)} />
      </Canvas>

      {/* Projected DOM labels — positioned each frame by ProceduralHeart. */}
      {showLabelOverlay && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {(isRespiratory ? respiratoryParts : heartParts).map((def) => {
            const anchors = isRespiratory ? respiratoryLabelAnchors : labelAnchors
            if (!anchors[def.structureId]) return null
            const active = selectedId === def.structureId || hoveredId === def.structureId
            return (
              <div
                key={`label-${def.structureId}`}
                ref={(el) => {
                  labelEls.current[def.structureId] = el
                }}
                style={{ willChange: 'transform' }}
                className={cn(
                  'absolute left-0 top-0 flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-medium backdrop-blur-md transition-colors',
                  active
                    ? 'border-primary/70 bg-primary/25 text-white shadow-[0_0_18px_rgba(224,36,58,0.45)]'
                    : 'border-white/10 bg-black/55 text-white/70'
                )}
              >
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    active ? 'bg-primary' : 'bg-white/40'
                  )}
                />
                {getStructure(def.structureId)?.nameFr ?? def.structureId}
              </div>
            )
          })}
        </div>
      )}

      {/* cinematic vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(5,5,8,0.65)_100%)]" />

      {/* Control overlay */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="pointer-events-auto flex flex-wrap gap-1">
            {!compact &&
              presetItems.map((p) => (
                <button
                  key={p.key}
                  onClick={() => goToPreset(p.key)}
                  className="rounded-md border border-white/10 bg-black/50 px-2 py-1 text-[10px] font-medium text-white/70 backdrop-blur-md transition-colors hover:border-primary/50 hover:text-white cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
          </div>
          <div className="pointer-events-auto flex gap-1">
            {!compact && (
              <button
                onClick={focusOnHovered}
                title="Cadrer la structure survolée / sélectionnée"
                aria-label="Cadrer la structure survolée ou sélectionnée"
                className="rounded-md border border-white/10 bg-black/50 p-1.5 text-white/60 backdrop-blur-md transition-colors hover:border-primary/50 hover:text-white cursor-pointer"
              >
                <Crosshair className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={toggleLabels}
              title="Afficher / masquer les étiquettes"
              aria-label="Afficher ou masquer les étiquettes"
              aria-pressed={labelsOn}
              className={cn(
                'rounded-md border p-1.5 backdrop-blur-md transition-colors cursor-pointer',
                labelsOn
                  ? 'border-primary/50 bg-primary/20 text-white'
                  : 'border-white/10 bg-black/50 text-white/60 hover:text-white'
              )}
            >
              <Tags className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setAutoRotate((v) => !v)}
              title="Rotation automatique"
              aria-label="Rotation automatique"
              aria-pressed={autoRotate}
              className={cn(
                'rounded-md border p-1.5 backdrop-blur-md transition-colors cursor-pointer',
                autoRotate
                  ? 'border-primary/50 bg-primary/20 text-white'
                  : 'border-white/10 bg-black/50 text-white/60 hover:text-white'
              )}
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={resetCamera}
              title="Reset la caméra"
              aria-label="Reset la caméra"
              className="rounded-md border border-white/10 bg-black/50 p-1.5 text-white/60 backdrop-blur-md transition-colors hover:text-white cursor-pointer"
            >
              <Maximize className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="pointer-events-none flex items-center gap-1.5 rounded-full border border-white/10 bg-black/50 px-2.5 py-1 text-[10px] text-white/50 backdrop-blur-md">
            Glisser : rotation · Molette : zoom · Clic droit : panoramique · Clic : sélectionner
          </span>
          {!modelSrc && !compact && (
            <span className="rounded-full border border-white/10 bg-black/50 px-2.5 py-1 text-[10px] text-white/40 backdrop-blur-md">
              Modèle anatomique procédural — GLTF plugable
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

/** Idle-rotating heart for the landing hero (no control chrome). */
export function HeroHeart({ className }: { className?: string }) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null)

  return (
    <div className={cn('relative', className)}>
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.4, 5.6], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.15
        }}
      >
        <SceneLights />
        <Sparkles count={120} scale={9} size={1.8} speed={0.2} color="#e0243a" opacity={0.45} />
        <Sparkles count={50} scale={12} size={1} speed={0.1} color="#ffffff" opacity={0.2} />
        <ProceduralHeart
          selectedId={selectedId}
          onSelect={setSelectedId}
          hoveredId={null}
          onHover={() => {}}
          showLabels={false}
          autoRotate
        />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableRotate
          enableDamping
          dampingFactor={0.05}
          autoRotate
          autoRotateSpeed={0.6}
        />
      </Canvas>
      {/* cinematic vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(8,8,10,0.75)_100%)]" />
    </div>
  )
}
