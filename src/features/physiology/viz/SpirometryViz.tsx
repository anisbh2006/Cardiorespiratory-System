import * as React from 'react'
import { Droplets } from 'lucide-react'
import { VizFrame } from '../VizFrame'
import { usePhysioClock } from '../usePhysioClock'
import { buildWavePath, mapY, sampleWave, type WavePoint } from '../waveform'
import * as S from '../data/spirometry'
import { cn } from '@/lib/utils'

/* Stacked volume diagram geometry. */
const BX0 = 46
const BX1 = 150
const BY_TOP = 34
const BY_BOT = 286
const yVol = (v: number) => BY_BOT - (v / S.DIAGRAM_MAX) * (BY_BOT - BY_TOP)

/* Spirogram geometry. */
const SX0 = 360
const SX1 = 706
const SY0 = 40
const SY1 = 268
const syVol = (v: number) => mapY(v, { ...S.SPIRO_SCALE, top: SY0, bottom: SY1 })
const sxP = (p: number) => SX0 + p * (SX1 - SX0)

type Mode = 'calm' | 'forced'

export function SpirometryViz() {
  const [mode, setMode] = React.useState<Mode>('calm')
  const [freq, setFreq] = React.useState(14)
  const cycleSeconds = mode === 'calm' ? S.CALM_CYCLE : S.FORCED_CYCLE
  const clock = usePhysioClock({ cycleSeconds })
  const phase = ((clock.phase % 1) + 1) % 1

  const ctrl: WavePoint[] = mode === 'calm' ? S.CALM_VOLUME : S.FORCED_VOLUME
  const vol = sampleWave(ctrl, phase)

  const path = React.useMemo(
    () => buildWavePath(ctrl, { left: SX0, right: SX1, top: SY0, bottom: SY1, min: S.SPIRO_SCALE.min, max: S.SPIRO_SCALE.max }),
    [ctrl]
  )

  const pv = S.pulmonaryVentilation(freq)
  const av = S.alveolarVentilation(freq)

  // Capacity brackets drawn from the cited segment boundaries.
  const brackets = [
    { label: 'CRF', value: S.CRF, formula: 'VR + VRE', low: 0, high: S.VR + S.ERV, color: '#a78bfa' },
    { label: 'CI', value: S.CI, formula: 'VT + VRI', low: S.VR + S.ERV, high: S.DIAGRAM_MAX, color: '#60a5fa' },
    { label: 'CV', value: S.CV, formula: 'VT+VRI+VRE', low: S.VR, high: S.DIAGRAM_MAX, color: '#34d399' },
    { label: 'CPT', value: S.CPT, formula: 'VR + CV', low: 0, high: S.DIAGRAM_MAX, color: '#fbbf24' },
  ]

  return (
    <VizFrame
      title="Spirometry — volumes et lung capacities"
      subtitle="Respiration quiet (VT) et manœuvre forced (CV, VEMS, coefficient de Tiffeneau)"
      icon={<Droplets className="h-4 w-4" />}
      system="respiratory"
      clock={clock}
      cycleSeconds={cycleSeconds}
      readout={`t = ${(phase * cycleSeconds).toFixed(2)} s · volume pulmonaire = ${Math.round(vol)} ml`}
      sources={S.SOURCES}
      lesson={S.LESSON}
      schematicNote="Valeurs verbatim du tableau p. 63 (adulte masculin jeune) : VT 500, VRI 3000, VRE 1200, VR 1200 ml ; CV 4800, CI 3500, CRF 2400, CPT 6000 ml. Les hauteurs des segments sont proportionnelles aux volumes cités ; les capacités portent leurs valeurs citées. Les courbes volume-temps sont des schémas des manœuvres décrites ; la courbe d’expiration forced est tracée de sorte que le volume expiré à la 1re secwave tombe dans l’intervalle cité (VEMS = 75–80 % de la CV). Ventilation pulmonaire = VT × fréquence et ventilation alvéolaire = (VT − 150) × fréquence sont les formules the lesson (p. 67–68)."
      aside={
        <>
          {mode === 'calm' ? (
            <div className="rounded-lg border border-border bg-background/50 p-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">Ventilation (p. 67–68)</div>
              <dl className="mt-2 space-y-1.5 text-[11px]">
                <div className="flex items-baseline justify-between">
                  <dt className="text-muted">Frequency</dt>
                  <dd className="font-mono text-foreground">{freq} cycles/min</dd>
                </div>
                <div className="flex items-baseline justify-between">
                  <dt className="text-muted">Pulmonary ventilation = VT × f</dt>
                  <dd className="font-mono text-success">{(pv / 1000).toFixed(2)} L/min</dd>
                </div>
                <div className="flex items-baseline justify-between">
                  <dt className="text-muted">Espace mort anatomique</dt>
                  <dd className="font-mono text-foreground">150 ml</dd>
                </div>
                <div className="flex items-baseline justify-between border-t border-border/60 pt-1.5">
                  <dt className="text-muted">Alveolar ventilation = (VT−150) × f</dt>
                  <dd className="font-mono text-info">{(av / 1000).toFixed(2)} L/min</dd>
                </div>
              </dl>
              <div className="mt-2 text-[10px] leading-snug text-faint">
                En quiet breathing, seul le volume courant (VT 500 ml) est mobilisé autour de la
                CRF ; l’expiration est passive (pr-9 p. 6).
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-background/50 p-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">Manœuvre forced</div>
              <dl className="mt-2 space-y-1.5 text-[11px]">
                <div className="flex items-baseline justify-between">
                  <dt className="text-muted">Capacité vitale (CV)</dt>
                  <dd className="font-mono text-success">4800 ml</dd>
                </div>
                <div className="flex items-baseline justify-between">
                  <dt className="text-muted">VEMS (1re secwave)</dt>
                  <dd className="font-mono text-foreground">75–80 % CV</dd>
                </div>
                <div className="flex items-baseline justify-between">
                  <dt className="text-muted">Tiffeneau = VEMS/CV</dt>
                  <dd className="font-mono text-primary">75–80 %</dd>
                </div>
                <div className="flex items-baseline justify-between">
                  <dt className="text-muted">Expiration forced</dt>
                  <dd className="font-mono text-foreground">≥ 6 s</dd>
                </div>
              </dl>
              <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">Normes (pr-td02 p. 31)</div>
              <ul className="mt-1 space-y-0.5 text-[10.5px] text-muted">
                {S.NORMS.map((n) => (
                  <li key={n.param} className="flex justify-between">
                    <span>{n.param}</span>
                    <span className="font-mono text-foreground">{n.threshold}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-lg border border-border bg-background/50 p-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">Volumes (p. 63)</div>
            <dl className="mt-2 space-y-1.5">
              {S.VOLUME_DEFS.map((v) => (
                <div key={v.key} className="text-[11px]">
                  <div className="flex items-baseline justify-between">
                    <dt className="font-semibold text-foreground">{v.fr} ({v.label})</dt>
                    <dd className="font-mono text-foreground">{v.value} ml</dd>
                  </div>
                  <div className="text-[10px] leading-snug text-faint">{v.definition}</div>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-lg border border-border bg-background/50 p-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">Capacités (p. 63)</div>
            <dl className="mt-2 space-y-1.5">
              {S.CAPACITY_DEFS.map((c) => (
                <div key={c.key} className="flex items-baseline justify-between gap-2 text-[11px]">
                  <dt className="text-muted">{c.fr} = {c.formula}</dt>
                  <dd className="font-mono text-foreground">{c.value} ml</dd>
                </div>
              ))}
            </dl>
          </div>
        </>
      }
    >
      {/* mode toggle + frequency slider */}
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { id: 'calm', label: 'Respiration quiet (VT)' },
              { id: 'forced', label: 'Manœuvre forced (CV / VEMS)' },
            ] as const
          ).map((o) => (
            <button
              key={o.id}
              onClick={() => {
                setMode(o.id)
                clock.reset()
              }}
              className={cn(
                'rounded-md border px-3 py-1.5 text-[11px] font-medium transition-colors cursor-pointer',
                mode === o.id
                  ? 'border-primary/60 bg-primary/15 text-primary'
                  : 'border-border-strong bg-elevated text-muted hover:text-foreground'
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
        {mode === 'calm' && (
          <label className="flex items-center gap-2 text-[11px]">
            <span className="text-muted">Frequency</span>
            <input
              type="range"
              min={S.FREQ_RANGE[0]}
              max={S.FREQ_RANGE[1]}
              value={freq}
              onChange={(e) => setFreq(Number(e.target.value))}
              className="w-28 cursor-pointer accent-[#34d399]"
            />
            <span className="font-mono text-foreground">{freq}/min</span>
          </label>
        )}
      </div>

      <svg viewBox="0 0 720 320" className="h-auto w-full select-none" role="img" aria-label="Volumes et lung capacities">
        {/* ---------------- Left: stacked volume diagram ---------------- */}
        <g>
          <text x={20} y={22} fill="#f4f4f2" fontSize={11} fontWeight={600}>Volumes & capacités</text>
          {S.SEGMENTS.map((seg) => (
            <g key={seg.key}>
              <rect x={BX0} y={yVol(seg.high)} width={BX1 - BX0} height={yVol(seg.low) - yVol(seg.high)} fill={seg.color} opacity={0.28} stroke={seg.color} strokeWidth={0.8} />
              <text x={(BX0 + BX1) / 2} y={(yVol(seg.low) + yVol(seg.high)) / 2 + 4} textAnchor="middle" fill={seg.color} fontSize={11} fontWeight={700} fontFamily="monospace">{seg.label}</text>
            </g>
          ))}
          {/* segment value labels (left) */}
          {S.SEGMENTS.map((seg) => (
            <text key={`v-${seg.key}`} x={BX0 - 6} y={(yVol(seg.low) + yVol(seg.high)) / 2 + 3} textAnchor="end" fill="#8b8b96" fontSize={8.5} fontFamily="monospace">
              {seg.high - seg.low}
            </text>
          ))}
          {/* capacity brackets (right) */}
          {brackets.map((b, i) => {
            const x = BX1 + 14 + i * 26
            const yTop = yVol(b.high)
            const yBot = yVol(b.low)
            return (
              <g key={b.label}>
                <path d={`M${x - 4} ${yTop} H${x} V${yBot} H${x - 4}`} fill="none" stroke={b.color} strokeWidth={1.4} opacity={0.85} />
                <text x={x + 4} y={(yTop + yBot) / 2} fill={b.color} fontSize={9.5} fontWeight={700} dominantBaseline="middle">{b.label}</text>
                <text x={x + 4} y={(yTop + yBot) / 2 + 11} fill={b.color} fontSize={7.5} fontFamily="monospace" opacity={0.8} dominantBaseline="middle">{b.value}</text>
              </g>
            )
          })}
          {/* live volume marker */}
          <g>
            <line x1={BX0 - 2} y1={yVol(Math.min(vol, S.DIAGRAM_MAX))} x2={BX1 + 2} y2={yVol(Math.min(vol, S.DIAGRAM_MAX))} stroke="#f4f4f2" strokeWidth={1.6} strokeDasharray="4 3" />
            <path d={`M${BX0 - 6} ${yVol(Math.min(vol, S.DIAGRAM_MAX))} l-7 -4 v8 Z`} fill="#f4f4f2" />
            <text x={BX0 - 16} y={yVol(Math.min(vol, S.DIAGRAM_MAX)) + 3} textAnchor="end" fill="#f4f4f2" fontSize={9.5} fontWeight={700} fontFamily="monospace">{Math.round(vol)}</text>
          </g>
          <text x={20} y={BY_BOT + 16} fill="#5c5c66" fontSize={8.5} fontFamily="monospace">0 ml</text>
        </g>

        {/* ---------------- Right: volume–time spirogram ---------------- */}
        <g>
          <text x={SX0} y={26} fill="#f4f4f2" fontSize={11} fontWeight={600}>
            {mode === 'calm' ? 'Respiration quiet — volume/temps' : 'Manœuvre forced — volume/temps'}
          </text>

          {/* reference lines */}
          {[
            { v: S.CPT, label: 'CPT 6000', color: '#fbbf24' },
            { v: S.CRF, label: 'CRF 2400', color: '#a78bfa' },
            { v: S.VR, label: 'VR 1200', color: '#6b7280' },
          ].map((r) => (
            <g key={r.label}>
              <line x1={SX0} y1={syVol(r.v)} x2={SX1} y2={syVol(r.v)} stroke={r.color} strokeWidth={0.8} strokeDasharray="4 3" opacity={0.45} />
              <text x={SX1 - 4} y={syVol(r.v) - 3} textAnchor="end" fill={r.color} fontSize={8} opacity={0.9}>{r.label}</text>
            </g>
          ))}
          {/* y grid */}
          {[2000, 3000, 4000, 5000].map((v) => (
            <g key={v}>
              <line x1={SX0} y1={syVol(v)} x2={SX1} y2={syVol(v)} stroke="#232329" strokeWidth={0.6} />
              <text x={SX0 - 6} y={syVol(v) + 3} textAnchor="end" fill="#5c5c66" fontSize={8} fontFamily="monospace">{v}</text>
            </g>
          ))}
          <text x={SX0 - 34} y={(SY0 + SY1) / 2} fill="#8b8b96" fontSize={9} transform={`rotate(-90 ${SX0 - 34} ${(SY0 + SY1) / 2})`} textAnchor="middle">volume (ml)</text>

          {/* FEV window (forced only) */}
          {mode === 'forced' && (
            <g>
              <rect x={sxP(S.FORCED_EXPIRATION_START)} y={SY0} width={sxP(S.FEV_PHASE) - sxP(S.FORCED_EXPIRATION_START)} height={SY1 - SY0} fill="#e0243a" opacity={0.1} />
              <line x1={sxP(S.FEV_PHASE)} y1={SY0} x2={sxP(S.FEV_PHASE)} y2={SY1} stroke="#e0243a" strokeWidth={1} strokeDasharray="3 3" opacity={0.7} />
              <text x={sxP(S.FEV_PHASE) + 4} y={SY0 + 14} fill="#e0243a" fontSize={8.5} fontWeight={600}>1 s · VEMS = 75–80 % CV</text>
            </g>
          )}

          {/* curve */}
          <path d={path} fill="none" stroke={mode === 'calm' ? '#34d399' : '#f4f4f2'} strokeWidth={2} strokeLinejoin="round" />

          {/* playhead + dot */}
          <line x1={sxP(phase)} y1={SY0} x2={sxP(phase)} y2={SY1} stroke="#f4f4f2" strokeWidth={1} opacity={0.6} />
          <circle cx={sxP(phase)} cy={syVol(vol)} r={4} fill={mode === 'calm' ? '#34d399' : '#e0243a'} stroke="#08080a" strokeWidth={1.2} />

          {/* x axis */}
          <line x1={SX0} y1={SY1} x2={SX1} y2={SY1} stroke="#232329" strokeWidth={1} />
          <text x={SX0} y={SY1 + 16} fill="#5c5c66" fontSize={8.5} fontFamily="monospace">0</text>
          <text x={SX1} y={SY1 + 16} textAnchor="end" fill="#5c5c66" fontSize={8.5} fontFamily="monospace">{cycleSeconds.toFixed(1)} s</text>
          <text x={(SX0 + SX1) / 2} y={SY1 + 30} textAnchor="middle" fill="#8b8b96" fontSize={9}>
            {mode === 'calm' ? 'un cycle respiratoire (Ttot)' : 'inspiration max → expiration forced (≥ 6 s)'}
          </text>
        </g>
      </svg>
    </VizFrame>
  )
}
