import * as React from 'react'
import { HeartHandshake } from 'lucide-react'
import { VizFrame } from '../VizFrame'
import { usePhysioClock } from '../usePhysioClock'
import { buildWavePath, mapY, sampleWave } from '../waveform'
import * as CR from '../data/coronaryCirculation'

const WX0 = 372
const WX1 = 700
const WY0 = 40
const WY1 = 210
const XP = (p: number) => WX0 + p * (WX1 - WX0)
const YP = (v: number) => mapY(v, { ...CR.FLOW_SCALE, top: WY0, bottom: WY1 })

export function CirculationViz() {
  const clock = usePhysioClock({ cycleSeconds: CR.CYCLE_SECONDS })
  const phase = ((clock.phase % 1) + 1) % 1

  const lvFlow = sampleWave(CR.LV_CORO_FLOW, phase)
  const rvFlow = sampleWave(CR.RV_CORO_FLOW, phase)
  const inSystole = phase < CR.SYSTOLE_END

  // Flow-integrated dash offsets: vessels "carry" blood faster when flow is high.
  const lvDash = React.useRef(0)
  const rvDash = React.useRef(0)
  lvDash.current = (lvDash.current - lvFlow * 3.2) % 1000
  rvDash.current = (rvDash.current - rvFlow * 3.2) % 1000

  const lvPath = React.useMemo(
    () => buildWavePath(CR.LV_CORO_FLOW, { left: WX0, right: WX1, top: WY0, bottom: WY1, min: CR.FLOW_SCALE.min, max: CR.FLOW_SCALE.max }),
    []
  )
  const rvPath = React.useMemo(
    () => buildWavePath(CR.RV_CORO_FLOW, { left: WX0, right: WX1, top: WY0, bottom: WY1, min: CR.FLOW_SCALE.min, max: CR.FLOW_SCALE.max }),
    []
  )

  const lvWidth = 2.5 + lvFlow * 3.5
  const rvWidth = 2.5 + rvFlow * 2.5

  return (
    <VizFrame
      title="Circulation coronaire — flux phasique au cours du cycle"
      subtitle="L’irrigation du VG est bloquée en systole (vaisseaux écrasés) et assurée à 70–80 % en diastole"
      icon={<HeartHandshake className="h-4 w-4" />}
      system="cardiovascular"
      clock={clock}
      cycleSeconds={CR.CYCLE_SECONDS}
      readout={`t = ${(phase * CR.CYCLE_SECONDS).toFixed(2)} s · ${inSystole ? 'SYSTOLE' : 'DIASTOLE'} · flux VG ${lvFlow.toFixed(2)} · flux VD ${rvFlow.toFixed(2)}`}
      marks={[
        { at: 0, label: 'B1' },
        { at: CR.SYSTOLE_END, label: 'B2' },
      ]}
      legend={[
        { color: '#e0243a', label: 'Flux coronaire VG' },
        { color: '#60a5fa', label: 'Flux coronaire VD' },
      ]}
      sources={CR.SOURCES}
      lesson={CR.LESSON}
      aside={
        <>
          <div className="rounded-lg border border-border bg-background/50 p-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">Anatomie (p. 4–8)</div>
            <ul className="mt-2 space-y-2">
              {CR.ANATOMY.map((a) => (
                <li key={a.label} className="text-[11px] leading-relaxed">
                  <span className="font-semibold text-foreground">{a.label}</span>
                  <span className="text-muted"> — {a.detail}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-border bg-background/50 p-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">Valeurs du cours</div>
            <dl className="mt-2 space-y-1.5">
              {CR.KEY_FACTS.map((f) => (
                <div key={f.label} className="flex items-baseline justify-between gap-2 text-[11px]">
                  <dt className="text-muted">{f.label}</dt>
                  <dd className="font-mono text-foreground">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-lg border border-border bg-background/50 p-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">Caractéristiques (p. 9–10)</div>
            <ul className="mt-2 list-disc space-y-1.5 pl-4 text-[11px] leading-relaxed text-muted">
              {CR.FUNCTIONAL.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        </>
      }
    >
      <svg viewBox="0 0 720 260" className="h-auto w-full select-none" role="img" aria-label="Circulation coronaire animée">
        {/* ---------------- Left: heart + coronary arteries ---------------- */}
        <g>
          {/* myocardium silhouette */}
          <path
            d="M168 58 C118 58 88 98 93 148 C98 208 138 248 172 264 C206 248 244 204 247 148 C250 98 218 58 168 58 Z"
            fill="#8e1b2a"
            opacity={0.92}
          />
          {/* aortic root */}
          <path d="M168 60 C168 40 176 30 190 26" fill="none" stroke="#b0505e" strokeWidth={16} strokeLinecap="round" />
          <path d="M168 60 C168 40 176 30 190 26" fill="none" stroke="#2a0d12" strokeWidth={8} strokeLinecap="round" />
          <text x={200} y={26} fill="#fbbf24" fontSize={10} fontWeight={600}>Racine de l’aorte</text>
          <text x={200} y={38} fill="#8b8b96" fontSize={9} fontFamily="monospace">{CR.AORTIC_PRESSURE}</text>

          {/* systole crush indicator */}
          {inSystole && (
            <g opacity={0.85}>
              <text x={170} y={150} textAnchor="middle" fill="#fbbf24" fontSize={10} fontWeight={700}>vaisseaux écrasés</text>
              <text x={170} y={164} textAnchor="middle" fill="#fbbf24" fontSize={9}>flux VG bloqué</text>
            </g>
          )}

          {/* left coronary (LAD) down the anterior groove */}
          <path
            d="M163 70 C148 108 156 180 170 250"
            fill="none"
            stroke="#e0243a"
            strokeWidth={lvWidth}
            strokeLinecap="round"
            strokeDasharray="11 9"
            strokeDashoffset={lvDash.current}
            opacity={0.45 + lvFlow * 0.55}
          />
          {/* right coronary (RCA) in the right AV groove */}
          <path
            d="M176 70 C208 88 234 126 230 178"
            fill="none"
            stroke="#60a5fa"
            strokeWidth={rvWidth}
            strokeLinecap="round"
            strokeDasharray="11 9"
            strokeDashoffset={rvDash.current}
            opacity={0.5 + rvFlow * 0.5}
          />

          <text x={96} y={210} fill="#e0243a" fontSize={9.5} fontWeight={600}>Coronaire G. (VG)</text>
          <text x={96} y={222} fill="#8b8b96" fontSize={9} fontFamily="monospace">{CR.FLOW_LV} ml/min/g</text>
          <text x={214} y={210} fill="#60a5fa" fontSize={9.5} fontWeight={600}>Coronaire D. (VD)</text>
          <text x={214} y={222} fill="#8b8b96" fontSize={9} fontFamily="monospace">{CR.FLOW_RV} ml/min/g</text>
        </g>

        {/* ---------------- Right: phasic flow waveform ---------------- */}
        <g>
          <text x={WX0} y={24} fill="#f4f4f2" fontSize={11} fontWeight={600}>Flux coronaire instantané au cours du cycle</text>
          {/* systole / diastole bands */}
          <rect x={WX0} y={WY0} width={XP(CR.SYSTOLE_END) - WX0} height={WY1 - WY0} fill="#e0243a" opacity={0.06} />
          <rect x={XP(CR.SYSTOLE_END)} y={WY0} width={WX1 - XP(CR.SYSTOLE_END)} height={WY1 - WY0} fill="#60a5fa" opacity={0.05} />
          <text x={WX0 + 5} y={WY0 + 12} fill="#e0243a" fontSize={9} fontWeight={600} opacity={0.85}>SYSTOLE · 0,3 s</text>
          <text x={XP(CR.SYSTOLE_END) + 5} y={WY0 + 12} fill="#60a5fa" fontSize={9} fontWeight={600} opacity={0.85}>DIASTOLE · 0,5 s</text>

          {/* y grid */}
          {[0, 0.5, 1.0].map((v) => (
            <g key={v}>
              <line x1={WX0} y1={YP(v)} x2={WX1} y2={YP(v)} stroke="#232329" strokeWidth={0.7} />
              <text x={WX0 - 6} y={YP(v) + 3} textAnchor="end" fill="#5c5c66" fontSize={8.5} fontFamily="monospace">{v.toFixed(1)}</text>
            </g>
          ))}
          <text x={WX0 - 34} y={(WY0 + WY1) / 2} fill="#8b8b96" fontSize={9} transform={`rotate(-90 ${WX0 - 34} ${(WY0 + WY1) / 2})`} textAnchor="middle">flux (u.a.)</text>

          {/* curves */}
          <path d={rvPath} fill="none" stroke="#60a5fa" strokeWidth={1.8} opacity={0.9} />
          <path d={lvPath} fill="none" stroke="#e0243a" strokeWidth={2} opacity={0.95} />

          {/* diastolic fraction annotation */}
          <text x={XP(0.62)} y={WY1 - 8} textAnchor="middle" fill="#34d399" fontSize={9} fontWeight={600}>70–80 % du flux VG</text>

          {/* playhead + dots */}
          <line x1={XP(phase)} y1={WY0} x2={XP(phase)} y2={WY1} stroke="#f4f4f2" strokeWidth={1} opacity={0.6} />
          <circle cx={XP(phase)} cy={YP(rvFlow)} r={3.4} fill="#60a5fa" stroke="#08080a" strokeWidth={1} />
          <circle cx={XP(phase)} cy={YP(lvFlow)} r={3.6} fill="#e0243a" stroke="#08080a" strokeWidth={1.2} />

          {/* x axis labels */}
          <text x={WX0} y={WY1 + 16} fill="#5c5c66" fontSize={8.5} fontFamily="monospace">0</text>
          <text x={WX1} y={WY1 + 16} textAnchor="end" fill="#5c5c66" fontSize={8.5} fontFamily="monospace">0,8 s</text>
        </g>
      </svg>
    </VizFrame>
  )
}
