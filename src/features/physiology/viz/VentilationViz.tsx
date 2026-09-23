import * as React from 'react'
import { Wind } from 'lucide-react'
import { VizFrame } from '../VizFrame'
import { usePhysioClock } from '../usePhysioClock'
import { buildWavePath, mapY, sampleWave, type WavePoint } from '../waveform'
import * as V from '../data/ventilation'
import { cn } from '@/lib/utils'

const WX0 = 372
const WX1 = 706
const XP = (p: number) => WX0 + p * (WX1 - WX0)

interface Track {
  id: string
  label: string
  color: string
  y0: number
  y1: number
  scale: { min: number; max: number }
  ctrl: WavePoint[]
  unit: string
  zeroLine?: boolean
}

const TRACKS: Track[] = [
  { id: 'vol', label: 'Volume pulmonaire', color: '#34d399', y0: 40, y1: 96, scale: V.VOLUME_SCALE, ctrl: V.VOLUME, unit: 'ml' },
  { id: 'palv', label: 'Palv − Patm', color: '#e0243a', y0: 110, y1: 158, scale: V.PALV_SCALE, ctrl: V.PALV, unit: 'mmHg', zeroLine: true },
  { id: 'ppl', label: 'Ppl (pleurale)', color: '#a78bfa', y0: 172, y1: 214, scale: V.PPL_SCALE, ctrl: V.PPL, unit: 'cmH2O' },
  { id: 'flow', label: 'Débit aérien', color: '#60a5fa', y0: 228, y1: 284, scale: V.FLOW_SCALE, ctrl: V.FLOW, unit: 'u.a.', zeroLine: true },
]

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

export function VentilationViz() {
  const [forced, setForced] = React.useState(false)
  const clock = usePhysioClock({ cycleSeconds: V.CYCLE_SECONDS })
  const phase = ((clock.phase % 1) + 1) % 1

  const vol = sampleWave(V.VOLUME, phase)
  const palv = sampleWave(V.PALV, phase)
  const ppl = sampleWave(V.PPL, phase)
  const flow = sampleWave(V.FLOW, phase)

  const inspiring = phase < V.INSPIRATION_END
  // Normalized expansion 0 (end-expiration) → 1 (end-inspiration).
  const expand = clamp((vol - V.CRF) / V.VT, 0, 1)
  const amp = forced ? 1.5 : 1 // schematic: forced breathing recruits more muscle

  const paths = React.useMemo(
    () =>
      TRACKS.map((t) => ({
        id: t.id,
        d: buildWavePath(t.ctrl, { left: WX0, right: WX1, top: t.y0, bottom: t.y1, min: t.scale.min, max: t.scale.max }),
      })),
    []
  )

  // Diaphragm geometry: domed at rest, flattened + descended on inspiration.
  const diaY = 214 + expand * 16 * amp // base descends
  const domeLift = 26 - expand * 20 * amp // dome flattens
  const ribSpread = expand * 9 * amp

  const activeMuscles = inspiring
    ? forced
      ? [V.MUSCLES[0], V.MUSCLES[1]]
      : [V.MUSCLES[0]]
    : forced
      ? [V.MUSCLES[3]]
      : [V.MUSCLES[2]]

  const flowDash = -(phase * 400) % 40

  return (
    <VizFrame
      title="Mécanique ventilatoire — le cycle respiratoire"
      subtitle="Pressions, volumes et flux aérien ; inspiration active, expiration passive au repos"
      icon={<Wind className="h-4 w-4" />}
      system="respiratory"
      clock={clock}
      cycleSeconds={V.CYCLE_SECONDS}
      readout={`t = ${(phase * V.CYCLE_SECONDS).toFixed(2)} s · ${inspiring ? 'INSPIRATION' : 'EXPIRATION'} · Palv−Patm = ${palv >= 0 ? '+' : ''}${palv.toFixed(1)} mmHg`}
      marks={[
        { at: 0, label: 'début insp.' },
        { at: V.INSPIRATION_END, label: 'fin insp.' },
      ]}
      legend={TRACKS.map((t) => ({ color: t.color, label: `${t.label} (${t.unit})` }))}
      sources={V.SOURCES}
      lesson={V.LESSON}
      schematicNote="Schéma animé : les formes des courbes Palv et débit sont dessinées d’après la séquence du cours (leur amplitude numérique n’est pas donnée ; seul leur signe et la règle « flux jusqu’à Palv = Patm » proviennent du cours). Ppl (−5 → −8 cmH2O), volumes (VT 500 ml, CRF 2400 ml) et pressions (Patm 760, Ptp 4 mmHg) sont les valeurs citées. La répartition TI/TE est schématique."
      aside={
        <>
          <div className="rounded-lg border border-border bg-background/50 p-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">Phase actuelle</div>
            <div className={cn('mt-1 text-sm font-semibold', inspiring ? 'text-success' : 'text-info')}>
              {inspiring ? 'Inspiration' : 'Expiration'}
              <span className="ml-1.5 text-[11px] font-normal text-faint">
                {inspiring ? '(active)' : forced ? '(active)' : '(passive)'}
              </span>
            </div>
            <div className="mt-2 space-y-1 text-[11px]">
              {activeMuscles.map((m) => (
                <div key={m.muscles} className="rounded-md bg-surface/70 p-2">
                  <div className={cn('font-semibold', m.active ? 'text-primary' : 'text-muted')}>
                    {m.active ? '● ' : '○ '}
                    {m.muscles}
                  </div>
                  <div className="mt-0.5 text-[10px] leading-snug text-faint">{m.detail}</div>
                </div>
              ))}
            </div>
            <div className="mt-2 rounded-md border border-border bg-surface/60 px-2 py-1.5 text-[11px]">
              <span className="text-muted">Règle du flux : </span>
              <span className="font-mono text-foreground">
                {Math.abs(palv) < 0.15 ? 'Palv = Patm → flux nul' : palv < 0 ? 'Palv < Patm → l’air entre' : 'Palv > Patm → l’air sort'}
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-background/50 p-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">Pressions en direct</div>
            <dl className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded-md bg-surface/70 p-2">
                <dt className="text-faint">Patm</dt>
                <dd className="font-mono text-sm text-foreground">760 mmHg</dd>
              </div>
              <div className="rounded-md bg-surface/70 p-2">
                <dt className="text-faint">Palv − Patm</dt>
                <dd className="font-mono text-sm text-primary">{palv >= 0 ? '+' : ''}{palv.toFixed(1)}</dd>
              </div>
              <div className="rounded-md bg-surface/70 p-2">
                <dt className="text-faint">Ppl</dt>
                <dd className="font-mono text-sm" style={{ color: '#a78bfa' }}>{ppl.toFixed(1)} cmH2O</dd>
              </div>
              <div className="rounded-md bg-surface/70 p-2">
                <dt className="text-faint">Ptp (Palv−Ppl)</dt>
                <dd className="font-mono text-sm text-warning">
                  {inspiring ? '↗ augmente' : '↘ revient'}
                </dd>
              </div>
              <div className="col-span-2 rounded-md bg-surface/70 p-2">
                <dt className="text-faint">Volume pulmonaire</dt>
                <dd className="font-mono text-sm text-success">{Math.round(vol)} ml</dd>
              </div>
            </dl>
            <div className="mt-1.5 text-[10px] text-faint">Ptp au repos = 760 − 756 = 4 mmHg (p. 14)</div>
          </div>

          <div className="rounded-lg border border-border bg-background/50 p-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">Valeurs du cours</div>
            <dl className="mt-2 space-y-1.5">
              {V.KEY_FACTS.map((f) => (
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
      {/* calm / forced toggle */}
      <div className="mb-2 flex flex-wrap gap-1.5">
        {(
          [
            { id: false, label: 'Respiration calme' },
            { id: true, label: 'Respiration forcée' },
          ] as const
        ).map((o) => (
          <button
            key={String(o.id)}
            onClick={() => setForced(o.id)}
            className={cn(
              'rounded-md border px-3 py-1.5 text-[11px] font-medium transition-colors cursor-pointer',
              forced === o.id
                ? 'border-primary/60 bg-primary/15 text-primary'
                : 'border-border-strong bg-elevated text-muted hover:text-foreground'
            )}
          >
            {o.label}
          </button>
        ))}
      </div>

      <svg viewBox="0 0 720 320" className="h-auto w-full select-none" role="img" aria-label="Mécanique ventilatoire animée">
        <defs>
          <marker id="vent-arrow" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill="#f4f4f2" />
          </marker>
        </defs>

        {/* ---------------- Left: thorax schematic ---------------- */}
        <g>
          <text x={20} y={20} fill="#f4f4f2" fontSize={11} fontWeight={600}>Cage thoracique · poumon · diaphragme</text>

          {/* trachea + bronchi */}
          <rect x={150} y={30} width={20} height={44} rx={6} fill="#2a2a32" stroke="#3a3a44" />
          <path d="M160 74 L132 96 M160 74 L188 96" stroke="#2a2a32" strokeWidth={11} strokeLinecap="round" />

          {/* airflow arrows in trachea (direction by flow sign) */}
          {Math.abs(flow) > 0.12 && (
            <line
              x1={160}
              y1={flow > 0 ? 34 : 70}
              x2={160}
              y2={flow > 0 ? 70 : 34}
              stroke="#f4f4f2"
              strokeWidth={2.5}
              strokeDasharray="6 6"
              strokeDashoffset={flowDash}
              markerEnd="url(#vent-arrow)"
              opacity={0.9}
            />
          )}
          <text x={186} y={48} fill="#8b8b96" fontSize={9}>{flow > 0.12 ? 'air entrant' : flow < -0.12 ? 'air sortant' : 'flux nul'}</text>

          {/* accessory neck muscles (forced inspiration) */}
          {forced && inspiring && (
            <g>
              <path d="M150 34 L138 24 M170 34 L182 24" stroke="#fbbf24" strokeWidth={3} strokeLinecap="round" opacity={0.9} />
              <text x={96} y={22} fill="#fbbf24" fontSize={8.5}>muscles accessoires du cou</text>
            </g>
          )}

          {/* thorax outline */}
          <path
            d={`M${96 - ribSpread} 60 L${96 - ribSpread} ${diaY} M${224 + ribSpread} 60 L${224 + ribSpread} ${diaY}`}
            stroke="#3a3a44"
            strokeWidth={2}
            fill="none"
          />

          {/* ribs (external intercostals highlighted on inspiration) */}
          {[0, 1, 2, 3].map((i) => {
            const ry = 92 + i * 30
            const glow = inspiring
            return (
              <g key={i}>
                <path
                  d={`M${100 - ribSpread} ${ry} Q160 ${ry + 12 + expand * 4} ${220 + ribSpread} ${ry}`}
                  fill="none"
                  stroke={glow ? '#34d399' : '#4a4a55'}
                  strokeWidth={glow ? 2.6 : 2}
                  opacity={glow ? 0.9 : 0.6}
                />
              </g>
            )
          })}
          {inspiring && <text x={228 + ribSpread} y={110} fill="#34d399" fontSize={8.5}>intercostaux externes</text>}

          {/* lungs (scale with expansion) */}
          <g opacity={0.92}>
            <ellipse cx={128} cy={140} rx={26 + expand * 5 * amp} ry={54 + expand * 10 * amp} fill="#b5465a" />
            <ellipse cx={192} cy={140} rx={26 + expand * 5 * amp} ry={54 + expand * 10 * amp} fill="#b5465a" />
            <ellipse cx={128} cy={140} rx={18 + expand * 4 * amp} ry={44 + expand * 8 * amp} fill="#d76a7c" opacity={0.5} />
            <ellipse cx={192} cy={140} rx={18 + expand * 4 * amp} ry={44 + expand * 8 * amp} fill="#d76a7c" opacity={0.5} />
          </g>
          <text x={160} y={146} textAnchor="middle" fill="#fff" fontSize={13} fontWeight={700} fontFamily="monospace">
            {Math.round(vol)}
          </text>
          <text x={160} y={160} textAnchor="middle" fill="#fff" fontSize={8} opacity={0.85}>ml</text>

          {/* diaphragm (dome flattens + descends on inspiration) */}
          <path
            d={`M${98 - ribSpread} ${diaY} Q160 ${diaY - domeLift} ${222 + ribSpread} ${diaY}`}
            fill="none"
            stroke={inspiring ? '#34d399' : '#c98a3a'}
            strokeWidth={5}
            strokeLinecap="round"
          />
          <text x={160} y={diaY + 16} textAnchor="middle" fill={inspiring ? '#34d399' : '#8b8b96'} fontSize={9} fontWeight={600}>
            diaphragme {inspiring ? '(contracté)' : '(relâché)'}
          </text>

          {/* abdominal wall (forced expiration) */}
          {forced && !inspiring && (
            <g>
              <path d={`M${100 - ribSpread} ${diaY + 22} Q160 ${diaY + 34} ${220 + ribSpread} ${diaY + 22}`} fill="none" stroke="#fbbf24" strokeWidth={3.5} opacity={0.9} />
              <text x={160} y={diaY + 48} textAnchor="middle" fill="#fbbf24" fontSize={8.5}>paroi abdominale + intercostaux internes</text>
            </g>
          )}
        </g>

        {/* ---------------- Right: waveform stack ---------------- */}
        <g>
          {/* inspiration / expiration bands */}
          <rect x={WX0} y={36} width={XP(V.INSPIRATION_END) - WX0} height={252} fill="#34d399" opacity={0.06} />
          <rect x={XP(V.INSPIRATION_END)} y={36} width={WX1 - XP(V.INSPIRATION_END)} height={252} fill="#60a5fa" opacity={0.05} />
          <text x={WX0 + 5} y={32} fill="#34d399" fontSize={9} fontWeight={600} opacity={0.85}>INSPIRATION</text>
          <text x={XP(V.INSPIRATION_END) + 5} y={32} fill="#60a5fa" fontSize={9} fontWeight={600} opacity={0.85}>EXPIRATION</text>

          {TRACKS.map((t) => {
            const path = paths.find((p) => p.id === t.id)!
            const v = sampleWave(t.ctrl, phase)
            const cy = mapY(v, { ...t.scale, top: t.y0, bottom: t.y1 })
            return (
              <g key={t.id}>
                <line x1={WX0} y1={t.y1} x2={WX1} y2={t.y1} stroke="#232329" strokeWidth={1} />
                {t.zeroLine && (
                  <line
                    x1={WX0}
                    y1={mapY(0, { ...t.scale, top: t.y0, bottom: t.y1 })}
                    x2={WX1}
                    y2={mapY(0, { ...t.scale, top: t.y0, bottom: t.y1 })}
                    stroke="#5c5c66"
                    strokeWidth={0.8}
                    strokeDasharray="3 3"
                  />
                )}
                <text x={WX0 + 4} y={t.y0 + 11} fill={t.color} fontSize={9.5} fontWeight={600}>{t.label}</text>
                <text x={WX1 - 4} y={t.y0 + 11} textAnchor="end" fill="#5c5c66" fontSize={9} fontFamily="monospace">
                  {v.toFixed(t.id === 'vol' ? 0 : 1)} {t.unit}
                </text>
                <path d={path.d} fill="none" stroke={t.color} strokeWidth={1.8} strokeLinejoin="round" opacity={0.95} />
                <circle cx={XP(phase)} cy={cy} r={3.2} fill={t.color} stroke="#08080a" strokeWidth={1} />
              </g>
            )
          })}

          {/* playhead */}
          <line x1={XP(phase)} y1={36} x2={XP(phase)} y2={288} stroke="#f4f4f2" strokeWidth={1.1} opacity={0.7} />
          <circle cx={XP(phase)} cy={36} r={3} fill="#f4f4f2" />
          <text x={WX0} y={304} fill="#5c5c66" fontSize={8.5} fontFamily="monospace">0</text>
          <text x={WX1} y={304} textAnchor="end" fill="#5c5c66" fontSize={8.5} fontFamily="monospace">{V.CYCLE_SECONDS.toFixed(1)} s · {V.FREQ}</text>
        </g>
      </svg>

      {/* event sequence */}
      <div className="mt-2">
        <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
          Séquence — {inspiring ? 'inspiration (p. 19)' : 'expiration (p. 21)'}
        </div>
        <ol className="flex flex-wrap gap-1.5">
          {(inspiring ? V.INSPIRATION_SEQUENCE : V.EXPIRATION_SEQUENCE).map((s, i) => (
            <li key={i} className="flex items-center gap-1.5 rounded-md border border-border bg-surface/60 px-2 py-1 text-[10px] text-muted">
              <span className="font-mono text-primary">{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
      </div>
    </VizFrame>
  )
}
