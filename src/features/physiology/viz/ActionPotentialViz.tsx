import * as React from 'react'
import { Zap } from 'lucide-react'
import { VizFrame } from '../VizFrame'
import { usePhysioClock } from '../usePhysioClock'
import { buildWavePath, mapY, sampleWave, type WavePoint } from '../waveform'
import * as AP from '../data/actionPotential'
import { cn } from '@/lib/utils'

const X0 = 66
const X1 = 690
const Y0 = 30
const Y1 = 288
const XP = (p: number) => X0 + p * (X1 - X0)

const PHASE_COLORS: Record<string, string> = {
  '0': '#e0243a',
  '1': '#60a5fa',
  '2': '#fbbf24',
  '3': '#34d399',
  '4': '#a78bfa',
  '4b': '#a78bfa',
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

export function ActionPotentialViz() {
  const [kind, setKind] = React.useState<AP.ApKind>('rapid')
  const clock = usePhysioClock({ cycleSeconds: AP.WINDOW_MS / 1000 })
  const phase = clock.phase

  const ctrl: WavePoint[] = kind === 'rapid' ? AP.RAPID_AP : AP.SLOW_AP
  const scale = kind === 'rapid' ? AP.RAPID_SCALE : AP.SLOW_SCALE
  const phases = kind === 'rapid' ? AP.RAPID_PHASES : AP.SLOW_PHASES
  const active = kind === 'rapid' ? AP.rapidPhaseAt(phase) : AP.slowPhaseAt(phase)
  const YP = (mv: number) => mapY(mv, { ...scale, top: Y0, bottom: Y1 })

  const path = React.useMemo(
    () => buildWavePath(ctrl, { left: X0, right: X1, top: Y0, bottom: Y1, min: scale.min, max: scale.max }),
    [ctrl, scale.min, scale.max]
  )

  const mv = sampleWave(ctrl, phase)
  const ticks = kind === 'rapid' ? [20, 0, -20, -40, -60, -80] : [20, 0, -20, -40, -65]
  const timeTicks = [0, 100, 200, 300]

  const readout = `t = ${(phase * AP.WINDOW_MS).toFixed(0)} ms / ${AP.WINDOW_MS} ms · Vm = ${mv.toFixed(0)} mV`

  return (
    <VizFrame
      title="Electrical activity — potentiel d'action cardiaque"
      subtitle="PA rapide (cell ventriculaire) et PA lent (cell nodale), phases et courants ioniques"
      icon={<Zap className="h-4 w-4" />}
      system="cardiovascular"
      clock={clock}
      cycleSeconds={AP.WINDOW_MS / 1000}
      readout={readout}
      legend={[
        { color: '#e0243a', label: 'Phase 0 · depolarization' },
        { color: '#fbbf24', label: 'Phase 2 · plateau' },
        { color: '#34d399', label: 'Phase 3 · repolarization' },
        { color: '#a78bfa', label: 'Phase 4 · rest / DDL' },
      ]}
      sources={AP.SOURCES}
      lesson={AP.LESSON}
      aside={
        <>
          <div className="rounded-lg border border-border bg-background/50 p-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">Phase actuelle</div>
            <div className="mt-1 text-sm font-semibold text-foreground">{active.label}</div>
            <div
              className="mt-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px]"
              style={{ background: `${PHASE_COLORS[active.id]}22`, color: PHASE_COLORS[active.id] }}
            >
              {active.ion}
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-muted">{active.detail}</p>
          </div>

          <div className="rounded-lg border border-border bg-background/50 p-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
              Distribution ionique (p. 14)
            </div>
            <table className="mt-2 w-full text-[11px]">
              <thead>
                <tr className="text-faint">
                  <th className="text-left font-medium">Ion</th>
                  <th className="text-right font-medium">Ext.</th>
                  <th className="text-right font-medium">Int.</th>
                  <th className="text-right font-medium">Eq.</th>
                </tr>
              </thead>
              <tbody className="font-mono text-foreground">
                {AP.ION_TABLE.map((r) => (
                  <tr key={r.ion} className="border-t border-border/60">
                    <td className="py-0.5 text-left">{r.ion}</td>
                    <td className="py-0.5 text-right">{r.extracellular}</td>
                    <td className="py-0.5 text-right">{r.intracellular}</td>
                    <td className="py-0.5 text-right text-primary">{r.equilibrium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-1 font-mono text-[9px] text-faint">concentrations en mM · E en mV</div>
          </div>

          <div className="rounded-lg border border-border bg-background/50 p-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">Valeurs the lesson</div>
            <dl className="mt-2 space-y-1.5">
              {AP.KEY_FACTS.map((f) => (
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
      {/* rapid / slow selector */}
      <div className="mb-2 flex flex-wrap gap-1.5">
        {(
          [
            { id: 'rapid', label: 'PA rapide — cell ventriculaire' },
            { id: 'slow', label: 'PA lent — cell nodale' },
          ] as const
        ).map((o) => (
          <button
            key={o.id}
            onClick={() => {
              setKind(o.id)
              clock.reset()
            }}
            className={cn(
              'rounded-md border px-3 py-1.5 text-[11px] font-medium transition-colors cursor-pointer',
              kind === o.id
                ? 'border-primary/60 bg-primary/15 text-primary'
                : 'border-border-strong bg-elevated text-muted hover:text-foreground'
            )}
          >
            {o.label}
          </button>
        ))}
      </div>

      <svg viewBox="0 0 720 320" className="h-auto w-full select-none" role="img" aria-label="Animated cardiac action potential">
        {/* phase bands */}
        {phases.map((ph) => (
          <g key={ph.id}>
            <rect
              x={XP(ph.start)}
              y={Y0}
              width={XP(ph.end) - XP(ph.start)}
              height={Y1 - Y0}
              fill={PHASE_COLORS[ph.id]}
              opacity={0.06}
            />
            <text
              x={(XP(ph.start) + XP(ph.end)) / 2}
              y={Y0 - 8}
              textAnchor="middle"
              fill={PHASE_COLORS[ph.id]}
              fontSize={11}
              fontWeight={700}
              opacity={0.9}
            >
              {ph.id.replace('b', '')}
            </text>
          </g>
        ))}

        {/* refractory shading (rapid only) */}
        {kind === 'rapid' && (
          <g>
            <rect x={XP(0)} y={Y0} width={XP(AP.REFRACTORY.praEnd) - XP(0)} height={Y1 - Y0} fill="#e0243a" opacity={0.05} />
            <rect x={XP(AP.REFRACTORY.praEnd)} y={Y0} width={XP(AP.REFRACTORY.prrEnd) - XP(AP.REFRACTORY.praEnd)} height={Y1 - Y0} fill="#fbbf24" opacity={0.06} />
            <line x1={XP(0)} y1={YP(AP.REFRACTORY_END_MV)} x2={XP(AP.REFRACTORY.praEnd)} y2={YP(AP.REFRACTORY_END_MV)} stroke="#e0243a" strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />
            <text x={XP(0.02)} y={Y1 + 14} fill="#e0243a" fontSize={9} fontWeight={600}>PRA (0 → ≈−50 mV)</text>
            <text x={XP(AP.REFRACTORY.praEnd) + 4} y={Y1 + 14} fill="#fbbf24" fontSize={9} fontWeight={600}>PRR</text>
            <text x={XP(AP.REFRACTORY.prrEnd) + 6} y={Y1 + 14} fill="#8b8b96" fontSize={9}>pas de tétanos possible</text>
          </g>
        )}

        {/* threshold / diastolic lines (slow only) */}
        {kind === 'slow' && (
          <g>
            <line x1={X0} y1={YP(AP.NODAL_THRESHOLD)} x2={X1} y2={YP(AP.NODAL_THRESHOLD)} stroke="#e0243a" strokeWidth={1} strokeDasharray="4 3" opacity={0.55} />
            <text x={X1 - 4} y={YP(AP.NODAL_THRESHOLD) - 4} textAnchor="end" fill="#e0243a" fontSize={9}>Seuil −45 mV</text>
            <line x1={X0} y1={YP(AP.NODAL_MAX_DIASTOLIC)} x2={X1} y2={YP(AP.NODAL_MAX_DIASTOLIC)} stroke="#a78bfa" strokeWidth={1} strokeDasharray="4 3" opacity={0.5} />
            <text x={X1 - 4} y={YP(AP.NODAL_MAX_DIASTOLIC) + 12} textAnchor="end" fill="#a78bfa" fontSize={9}>Max diastolique −65 mV</text>
          </g>
        )}

        {/* grid + axes */}
        {ticks.map((mv) => (
          <g key={mv}>
            <line x1={X0} y1={YP(mv)} x2={X1} y2={YP(mv)} stroke="#232329" strokeWidth={mv === 0 ? 1.2 : 0.7} />
            <text x={X0 - 8} y={YP(mv) + 3} textAnchor="end" fill="#5c5c66" fontSize={9} fontFamily="monospace">{mv}</text>
          </g>
        ))}
        {timeTicks.map((ms) => (
          <g key={ms}>
            <line x1={XP(ms / AP.WINDOW_MS)} y1={Y0} x2={XP(ms / AP.WINDOW_MS)} y2={Y1} stroke="#232329" strokeWidth={0.7} />
            <text x={XP(ms / AP.WINDOW_MS)} y={Y1 + 26} textAnchor="middle" fill="#5c5c66" fontSize={9} fontFamily="monospace">{ms} ms</text>
          </g>
        ))}
        <text x={20} y={(Y0 + Y1) / 2} fill="#8b8b96" fontSize={10} fontWeight={600} transform={`rotate(-90 20 ${(Y0 + Y1) / 2})`} textAnchor="middle">Vm (mV)</text>

        {/* AP curve */}
        <path d={path} fill="none" stroke={kind === 'rapid' ? '#f4f4f2' : '#f4f4f2'} strokeWidth={2.2} strokeLinejoin="round" />

        {/* playhead + dot */}
        <line x1={XP(phase)} y1={Y0} x2={XP(phase)} y2={Y1} stroke="#f4f4f2" strokeWidth={1} opacity={0.6} />
        <circle cx={XP(phase)} cy={YP(mv)} r={4} fill={PHASE_COLORS[active.id]} stroke="#08080a" strokeWidth={1.2} />

        {/* ionic-current annotation near the dot */}
        <g>
          <rect
            x={clamp(XP(phase) + 10, X0, X1 - 120)}
            y={clamp(YP(mv) - 30, Y0, Y1 - 20)}
            width={112}
            height={18}
            rx={5}
            fill="#08080a"
            stroke={PHASE_COLORS[active.id]}
            strokeWidth={1}
            opacity={0.95}
          />
          <text
            x={clamp(XP(phase) + 10, X0, X1 - 120) + 8}
            y={clamp(YP(mv) - 30, Y0, Y1 - 20) + 12.5}
            fill={PHASE_COLORS[active.id]}
            fontSize={9.5}
            fontWeight={600}
          >
            {active.ion}
          </text>
        </g>
      </svg>

      {/* conduction pathway strip */}
      <div className="mt-2">
        <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
          Conduction de l’influx (NSA → Purkinje)
        </div>
        <div className="flex flex-wrap items-stretch gap-1.5">
          {AP.CONDUCTION.map((s, i) => (
            <React.Fragment key={s.structure}>
              {i > 0 && <span className="self-center text-faint">→</span>}
              <div className="min-w-[128px] flex-1 rounded-md border border-border bg-surface/60 p-2">
                <div className="text-[10px] font-semibold leading-tight text-foreground">{s.structure}</div>
                <div className="mt-0.5 font-mono text-[10px] text-primary">{s.velocity}</div>
                <div className="mt-0.5 text-[9px] leading-snug text-faint">{s.note}</div>
              </div>
            </React.Fragment>
          ))}
        </div>
        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted">
          <span className="font-mono text-[9px] uppercase tracking-wider text-faint">Automatisme (p. 47) :</span>
          {AP.PACEMAKER_RATES.map((r) => (
            <span key={r.site}>
              {r.site} <span className="font-mono text-foreground">{r.rate}</span>
            </span>
          ))}
        </div>
      </div>
    </VizFrame>
  )
}
