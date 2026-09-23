import * as React from 'react'
import { HeartPulse } from 'lucide-react'
import { VizFrame } from '../VizFrame'
import { usePhysioClock } from '../usePhysioClock'
import { buildWavePath, mapY, sampleWave, type WavePoint } from '../waveform'
import * as CC from '../data/cardiacCycle'

const X0 = 274
const X1 = 764
const XP = (p: number) => X0 + p * (X1 - X0)

interface Track {
  id: string
  label: string
  color: string
  y0: number
  y1: number
  scale: { min: number; max: number }
  ctrl: WavePoint[]
  unit?: string
}

const TRACKS: Track[] = [
  { id: 'ecg', label: 'ECG · P–QRS–T', color: '#60a5fa', y0: 24, y1: 86, scale: CC.ECG_SCALE, ctrl: CC.ECG },
  { id: 'lvp', label: 'Pression VG', color: '#e0243a', y0: 98, y1: 192, scale: CC.PRESSURE_SCALE, ctrl: CC.LV_PRESSURE, unit: 'mmHg' },
  { id: 'aop', label: 'Pression aortique', color: '#fbbf24', y0: 204, y1: 298, scale: CC.PRESSURE_SCALE, ctrl: CC.AORTIC_PRESSURE, unit: 'mmHg' },
  { id: 'atp', label: 'Pression atriale G.', color: '#a78bfa', y0: 310, y1: 366, scale: CC.ATRIAL_SCALE, ctrl: CC.ATRIAL_PRESSURE, unit: 'mmHg' },
  { id: 'vol', label: 'Volume VG', color: '#34d399', y0: 378, y1: 452, scale: CC.VOLUME_SCALE, ctrl: CC.LV_VOLUME, unit: 'ml' },
]

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

export function CardiacCycleViz() {
  const clock = usePhysioClock({ cycleSeconds: CC.CYCLE_SECONDS })
  const phase = clock.phase
  const uid = React.useId().replace(/:/g, '')

  const paths = React.useMemo(
    () =>
      TRACKS.map((t) => ({
        id: t.id,
        d: buildWavePath(t.ctrl, { left: X0, right: X1, top: t.y0, bottom: t.y1, min: t.scale.min, max: t.scale.max }),
      })),
    []
  )

  const lvVol = sampleWave(CC.LV_VOLUME, phase)
  const lvP = sampleWave(CC.LV_PRESSURE, phase)
  const aoP = sampleWave(CC.AORTIC_PRESSURE, phase)
  const atP = sampleWave(CC.ATRIAL_PRESSURE, phase)
  const { avOpen, aorticOpen } = CC.valveState(phase)
  const activePhase = CC.phaseAt(phase)

  // Heart-schematic derived state.
  const contraction = clamp((lvP - 8) / 112, 0, 1)
  const wall = 12 + 9 * contraction
  const fillFrac = clamp((lvVol - CC.VOLUMES.esv) / (CC.VOLUMES.edv - CC.VOLUMES.esv), 0, 1)
  const cavX = 48 + wall
  const cavY = 190 + wall * 0.7
  const cavW = 118 - 2 * wall
  const cavH = 200 - wall * 1.5
  const bloodY = cavY + cavH * (1 - fillFrac)
  const bloodH = cavH * fillFrac

  const flowDash = -(phase * 240) % 40
  const sound = phase < 0.03 ? 'B1' : phase > CC.B.systoleEnd && phase < CC.B.systoleEnd + 0.03 ? 'B2' : null

  const marks = [
    { at: 0, label: 'B1' },
    { at: CC.B.systoleEnd, label: 'B2' },
    { at: 0.895, label: 'P' },
  ]

  return (
    <VizFrame
      title="Le cycle cardiaque"
      subtitle="Événements mécaniques, hémodynamiques et électriques synchronisés (cœur gauche)"
      icon={<HeartPulse className="h-4 w-4" />}
      system="cardiovascular"
      clock={clock}
      cycleSeconds={CC.CYCLE_SECONDS}
      marks={marks}
      legend={[
        { color: '#60a5fa', label: 'ECG' },
        { color: '#e0243a', label: 'Pression VG' },
        { color: '#fbbf24', label: 'Pression aortique' },
        { color: '#a78bfa', label: 'Pression atriale' },
        { color: '#34d399', label: 'Volume VG' },
      ]}
      sources={CC.SOURCES}
      lesson={CC.LESSON}
      aside={
        <>
          <div className="rounded-lg border border-border bg-background/50 p-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">Phase actuelle</div>
            <div className="mt-1 text-sm font-semibold text-foreground">{activePhase.label}</div>
            <div className="mt-0.5 text-[11px] text-muted">
              {activePhase.kind === 'systole' ? 'Systole' : 'Diastole'} · t = {(phase * CC.CYCLE_SECONDS).toFixed(2)} s
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded-md bg-surface/70 p-2">
                <dt className="text-faint">Vol. VG</dt>
                <dd className="font-mono text-sm text-success">{Math.round(lvVol)} ml</dd>
              </div>
              <div className="rounded-md bg-surface/70 p-2">
                <dt className="text-faint">P. VG</dt>
                <dd className="font-mono text-sm text-primary">{Math.round(lvP)} mmHg</dd>
              </div>
              <div className="rounded-md bg-surface/70 p-2">
                <dt className="text-faint">P. aorte</dt>
                <dd className="font-mono text-sm text-warning">{Math.round(aoP)} mmHg</dd>
              </div>
              <div className="rounded-md bg-surface/70 p-2">
                <dt className="text-faint">P. atriale</dt>
                <dd className="font-mono text-sm" style={{ color: '#a78bfa' }}>{Math.round(atP)} mmHg</dd>
              </div>
            </dl>
            <div className="mt-3 space-y-1 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-muted">Valve mitrale (AV)</span>
                <span className={avOpen ? 'font-semibold text-success' : 'font-semibold text-primary'}>
                  {avOpen ? 'Ouverte' : 'Fermée'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Valve aortique</span>
                <span className={aorticOpen ? 'font-semibold text-success' : 'font-semibold text-primary'}>
                  {aorticOpen ? 'Ouverte' : 'Fermée'}
                </span>
              </div>
              {!avOpen && !aorticOpen && (
                <div className="rounded-md border border-warning/30 bg-warning/10 px-2 py-1 text-[10px] text-warning">
                  Toutes valves fermées → volume constant (phase isovolumétrique)
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-background/50 p-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">Valeurs du cours</div>
            <dl className="mt-2 space-y-1.5">
              {CC.KEY_FACTS.map((f) => (
                <div key={f.label} className="flex items-baseline justify-between gap-2 text-[11px]">
                  <dt className="text-muted">{f.label}</dt>
                  <dd className="font-mono text-foreground">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </>
      }
    >
      <svg viewBox="0 0 780 470" className="h-auto w-full select-none" role="img" aria-label="Cycle cardiaque animé">
        <defs>
          <clipPath id={`cav-${uid}`}>
            <rect x={cavX} y={cavY} width={cavW} height={cavH} rx={16} />
          </clipPath>
          <marker id={`arrow-${uid}`} markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill="#f4f4f2" />
          </marker>
        </defs>

        {/* ---------------- Left: schematic left heart ---------------- */}
        <g>
          {/* Aorta */}
          <path
            d="M150 200 C150 140 156 104 182 88 C206 74 228 90 226 122"
            fill="none"
            stroke="#b0505e"
            strokeWidth={20}
            strokeLinecap="round"
            opacity={0.9}
          />
          <path
            d="M150 200 C150 140 156 104 182 88 C206 74 228 90 226 122"
            fill="none"
            stroke="#2a0d12"
            strokeWidth={11}
            strokeLinecap="round"
          />
          <text x={196} y={70} fill="#fbbf24" fontSize={11} fontWeight={600}>Aorte</text>
          <text x={196} y={84} fill="#8b8b96" fontSize={10} fontFamily="monospace">{Math.round(aoP)} mmHg</text>

          {/* Left atrium */}
          <rect x={24} y={40} width={86} height={64} rx={14} fill="#a3243a" opacity={0.85} />
          <rect x={30} y={46} width={74} height={52} rx={10} fill="#2a0d12" />
          <text x={24} y={32} fill="#f4f4f2" fontSize={11} fontWeight={600}>Oreillette G.</text>
          <text x={44} y={78} fill="#a78bfa" fontSize={10} fontFamily="monospace">{Math.round(atP)} mmHg</text>

          {/* Mitral channel */}
          <rect x={58} y={104} width={20} height={90} fill="#2a0d12" />

          {/* Left ventricle: myocardium + cavity + blood */}
          <rect x={48} y={190} width={118} height={200} rx={26} fill="#8e1b2a" />
          <rect x={cavX} y={cavY} width={cavW} height={cavH} rx={16} fill="#16070a" />
          <g clipPath={`url(#cav-${uid})`}>
            <rect x={cavX} y={bloodY} width={cavW} height={bloodH} fill="#c22033" />
          </g>
          <text x={107} y={300} textAnchor="middle" fill="#f4f4f2" fontSize={16} fontWeight={700} fontFamily="monospace">
            {Math.round(lvVol)}
          </text>
          <text x={107} y={316} textAnchor="middle" fill="#f4f4f2" fontSize={9} opacity={0.8}>ml</text>
          <text x={107} y={410} textAnchor="middle" fill="#f4f4f2" fontSize={11} fontWeight={600}>Ventricule G.</text>
          <text x={107} y={424} textAnchor="middle" fill="#e0243a" fontSize={10} fontFamily="monospace">P {Math.round(lvP)} mmHg</text>

          {/* Mitral valve leaflets */}
          <g stroke="#f4f4f2" strokeWidth={2.5} strokeLinecap="round">
            {avOpen ? (
              <>
                <line x1={58} y1={150} x2={64} y2={166} />
                <line x1={78} y1={150} x2={72} y2={166} />
              </>
            ) : (
              <>
                <line x1={58} y1={150} x2={68} y2={150} />
                <line x1={78} y1={150} x2={68} y2={150} />
              </>
            )}
          </g>
          <text x={12} y={150} fill="#8b8b96" fontSize={9} transform="rotate(-90 12 150)" textAnchor="middle">mitrale</text>

          {/* Aortic valve leaflets */}
          <g stroke="#f4f4f2" strokeWidth={2.5} strokeLinecap="round">
            {aorticOpen ? (
              <>
                <line x1={142} y1={200} x2={140} y2={186} />
                <line x1={158} y1={200} x2={160} y2={186} />
              </>
            ) : (
              <>
                <line x1={142} y1={196} x2={150} y2={200} />
                <line x1={158} y1={196} x2={150} y2={200} />
              </>
            )}
          </g>

          {/* Flow arrows */}
          {avOpen && !aorticOpen && (
            <line x1={68} y1={112} x2={68} y2={182} stroke="#f4f4f2" strokeWidth={2} strokeDasharray="6 6"
              strokeDashoffset={flowDash} markerEnd={`url(#arrow-${uid})`} opacity={0.9} />
          )}
          {aorticOpen && (
            <path d="M120 250 C140 230 150 214 150 200 C150 160 156 120 176 104"
              fill="none" stroke="#f4f4f2" strokeWidth={2} strokeDasharray="6 6" strokeDashoffset={flowDash}
              markerEnd={`url(#arrow-${uid})`} opacity={0.9} />
          )}

          {/* Heart-sound flash */}
          {sound && (
            <g>
              <circle cx={107} cy={250} r={26 + contraction * 6} fill="none" stroke="#fbbf24" strokeWidth={2} opacity={0.7} />
              <text x={107} y={254} textAnchor="middle" fill="#fbbf24" fontSize={12} fontWeight={700}>{sound}</text>
            </g>
          )}
        </g>

        {/* ---------------- Right: waveform stack ---------------- */}
        <g>
          {/* systole / diastole bands */}
          <rect x={X0} y={20} width={XP(CC.B.systoleEnd) - X0} height={436} fill="#e0243a" opacity={0.05} />
          <rect x={XP(CC.B.systoleEnd)} y={20} width={X1 - XP(CC.B.systoleEnd)} height={436} fill="#60a5fa" opacity={0.03} />
          <text x={X0 + 6} y={16} fill="#e0243a" fontSize={9} fontWeight={600} opacity={0.8}>SYSTOLE · 0,3 s</text>
          <text x={XP(CC.B.systoleEnd) + 6} y={16} fill="#60a5fa" fontSize={9} fontWeight={600} opacity={0.8}>DIASTOLE · 0,5 s</text>

          {/* event ticks */}
          {CC.EVENTS.map((e, i) => (
            <line key={i} x1={XP(e.at)} y1={22} x2={XP(e.at)} y2={456} stroke="#ffffff" strokeWidth={0.5} strokeDasharray="2 4" opacity={0.14} />
          ))}

          {TRACKS.map((t) => {
            const path = paths.find((p) => p.id === t.id)!
            const v = sampleWave(t.ctrl, phase)
            const cy = mapY(v, { ...t.scale, top: t.y0, bottom: t.y1 })
            const baseY = mapY(t.scale.min, { ...t.scale, top: t.y0, bottom: t.y1 })
            return (
              <g key={t.id}>
                <line x1={X0} y1={t.y1} x2={X1} y2={t.y1} stroke="#232329" strokeWidth={1} />
                <text x={X0 + 4} y={t.y0 + 11} fill={t.color} fontSize={9.5} fontWeight={600}>{t.label}</text>
                <path d={path.d} fill="none" stroke={t.color} strokeWidth={1.8} strokeLinejoin="round" opacity={0.95} />
                <circle cx={XP(phase)} cy={cy} r={3.2} fill={t.color} stroke="#08080a" strokeWidth={1} />
                {t.unit && (
                  <text x={X1 - 4} y={t.y0 + 11} textAnchor="end" fill="#5c5c66" fontSize={9} fontFamily="monospace">
                    {Math.round(v)} {t.unit}
                  </text>
                )}
                <line x1={X0} y1={baseY} x2={X1} y2={baseY} stroke="#232329" strokeWidth={0.5} opacity={0.5} />
              </g>
            )
          })}

          {/* playhead */}
          <line x1={XP(phase)} y1={20} x2={XP(phase)} y2={456} stroke="#f4f4f2" strokeWidth={1.2} opacity={0.75} />
          <circle cx={XP(phase)} cy={20} r={3} fill="#f4f4f2" />
        </g>
      </svg>
    </VizFrame>
  )
}
