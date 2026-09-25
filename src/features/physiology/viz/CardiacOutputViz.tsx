import * as React from 'react'
import { Gauge } from 'lucide-react'
import { VizFrame } from '../VizFrame'
import { usePhysioClock } from '../usePhysioClock'
import * as CO from '../data/cardiacOutput'

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

/* Frank-Starling plot geometry. */
const FX0 = 56
const FX1 = 340
const FY0 = 26
const FY1 = 210
const EDV_DOM: [number, number] = [100, 180]
const SV_DOM: [number, number] = [30, 120]
const fxX = (edv: number) => FX0 + ((edv - EDV_DOM[0]) / (EDV_DOM[1] - EDV_DOM[0])) * (FX1 - FX0)
const fxY = (sv: number) => FY1 - ((sv - SV_DOM[0]) / (SV_DOM[1] - SV_DOM[0])) * (FY1 - FY0)

export function CardiacOutputViz() {
  const [hr, setHr] = React.useState(CO.REST_HR)
  const [edv, setEdv] = React.useState(CO.REST_EDV)

  const sv = CO.strokeVolume(edv)
  const co = CO.cardiacOutput(hr, edv)

  const clock = usePhysioClock({ cycleSeconds: 60 / hr })
  const phase = ((clock.phase % 1) + 1) % 1

  // Schematic beat: filling (0→0.45), ejection (0.45→0.85), rest (0.85→1).
  const vol =
    phase < 0.45
      ? CO.ESV + (edv - CO.ESV) * (phase / 0.45)
      : phase < 0.85
        ? edv - (edv - CO.ESV) * ((phase - 0.45) / 0.4)
        : CO.ESV
  const ejecting = phase >= 0.45 && phase < 0.85

  // Ventricular cavity geometry driven by current volume.
  const wallX = 470
  const wallW = 120
  const wallY = 60
  const wallH = 170
  const wall = 16
  const cavX = wallX + wall
  const cavY = wallY + wall
  const cavW = wallW - 2 * wall
  const cavH = wallH - wall * 1.4
  const fillFrac = clamp((vol - CO.ESV) / (edv - CO.ESV || 1), 0, 1)
  const bloodY = cavY + cavH * (1 - fillFrac)
  const bloodH = cavH * fillFrac
  const uid = React.useId().replace(/:/g, '')

  // CO gauge (0 → 35 L/min).
  const GAUGE_MAX = 35
  const gaugePct = clamp(co / GAUGE_MAX, 0, 1) * 100

  return (
    <VizFrame
      title="Flow cardiaque — DC = HR × VE"
      subtitle="Faites varier la fréquence et le volume télédiastolique ; le flow suit les formules the lesson"
      icon={<Gauge className="h-4 w-4" />}
      system="cardiovascular"
      clock={clock}
      cycleSeconds={60 / hr}
      readout={`DC = ${hr} × ${(sv / 1000).toFixed(3)} = ${co.toFixed(2)} L/min · 1 battement = ${(60 / hr).toFixed(2)} s`}
      sources={CO.SOURCES}
      lesson={CO.LESSON}
      schematicNote="Calculateur basé uniquement sur les formules the lesson (VE = VTD − VTS, p. 12 ; DC = HR × VE, p. 4) avec VTS = 65 ml (valeur citée). Le lecture décrit la relation de Frank-Starling qualitativement (VE augmente avec VTD) ; la droite tracée est cette relation, aucun coefficient numérique n’est inventé. L’animation du battement est schématique."
      aside={
        <>
          <div className="rounded-lg border border-border bg-background/50 p-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">Calculated values</div>
            <dl className="mt-2 space-y-1.5 text-[11px]">
              <div className="flex items-baseline justify-between">
                <dt className="text-muted">Frequency (HR)</dt>
                <dd className="font-mono text-foreground">{hr} batt/min</dd>
              </div>
              <div className="flex items-baseline justify-between">
                <dt className="text-muted">VTD (précharge)</dt>
                <dd className="font-mono text-foreground">{edv} ml</dd>
              </div>
              <div className="flex items-baseline justify-between">
                <dt className="text-muted">VTS</dt>
                <dd className="font-mono text-foreground">{CO.ESV} ml</dd>
              </div>
              <div className="flex items-baseline justify-between">
                <dt className="text-muted">VE = VTD − VTS</dt>
                <dd className="font-mono text-success">{sv} ml</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-border/60 pt-1.5">
                <dt className="font-semibold text-foreground">DC = HR × VE</dt>
                <dd className="font-mono text-base font-bold text-primary">{co.toFixed(2)} L/min</dd>
              </div>
              <div className="flex items-baseline justify-between">
                <dt className="text-muted">Index cardiaque</dt>
                <dd className="font-mono text-faint">DC / SC (p. 5)</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg border border-border bg-background/50 p-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">Determinants of SV (p. 13)</div>
            <ul className="mt-2 space-y-1.5">
              {CO.DETERMINANTS.map((d) => (
                <li key={d.id} className="text-[11px]">
                  <span className="font-semibold text-foreground">{d.label}</span>
                  <span className="text-muted"> — {d.definition}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-border bg-background/50 p-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">Heart rate control</div>
            <dl className="mt-2 space-y-1.5">
              {CO.HR_FACTS.map((f) => (
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
      {/* interactive sliders */}
      <div className="mb-3 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <div className="mb-1 flex items-center justify-between text-[11px]">
            <span className="font-medium text-muted">Frequency cardiaque (HR)</span>
            <span className="font-mono text-foreground">{hr} batt/min</span>
          </div>
          <input
            type="range"
            min={CO.HR_RANGE[0]}
            max={CO.HR_RANGE[1]}
            value={hr}
            onChange={(e) => setHr(Number(e.target.value))}
            className="w-full cursor-pointer accent-[#e0243a]"
          />
          <div className="mt-0.5 flex justify-between font-mono text-[9px] text-faint">
            <span>{CO.HR_RANGE[0]}</span>
            <span>rest 70 · intrinsèque 100</span>
            <span>{CO.HR_RANGE[1]}</span>
          </div>
        </label>
        <label className="block">
          <div className="mb-1 flex items-center justify-between text-[11px]">
            <span className="font-medium text-muted">Volume télédiastolique (VTD)</span>
            <span className="font-mono text-foreground">{edv} ml</span>
          </div>
          <input
            type="range"
            min={CO.EDV_RANGE[0]}
            max={CO.EDV_RANGE[1]}
            value={edv}
            onChange={(e) => setEdv(Number(e.target.value))}
            className="w-full cursor-pointer accent-[#34d399]"
          />
          <div className="mt-0.5 flex justify-between font-mono text-[9px] text-faint">
            <span>{CO.EDV_RANGE[0]}</span>
            <span>rest 135</span>
            <span>{CO.EDV_RANGE[1]}</span>
          </div>
        </label>
      </div>

      <svg viewBox="0 0 720 250" className="h-auto w-full select-none" role="img" aria-label="Frank-Starling et pompe ventriculaire">
        {/* ---- Left: Frank-Starling relationship VE = VTD − VTS ---- */}
        <g>
          <text x={FX0} y={16} fill="#f4f4f2" fontSize={11} fontWeight={600}>Relation de Frank-Starling (VE = VTD − VTS)</text>
          {/* axes */}
          <line x1={FX0} y1={FY1} x2={FX1} y2={FY1} stroke="#232329" strokeWidth={1.2} />
          <line x1={FX0} y1={FY0} x2={FX0} y2={FY1} stroke="#232329" strokeWidth={1.2} />
          {[100, 120, 140, 160, 180].map((e) => (
            <g key={e}>
              <line x1={fxX(e)} y1={FY1} x2={fxX(e)} y2={FY1 + 4} stroke="#5c5c66" strokeWidth={1} />
              <text x={fxX(e)} y={FY1 + 16} textAnchor="middle" fill="#5c5c66" fontSize={9} fontFamily="monospace">{e}</text>
            </g>
          ))}
          {[40, 60, 80, 100].map((s) => (
            <g key={s}>
              <line x1={FX0 - 4} y1={fxY(s)} x2={FX0} y2={fxY(s)} stroke="#5c5c66" strokeWidth={1} />
              <text x={FX0 - 7} y={fxY(s) + 3} textAnchor="end" fill="#5c5c66" fontSize={9} fontFamily="monospace">{s}</text>
              <line x1={FX0} y1={fxY(s)} x2={FX1} y2={fxY(s)} stroke="#232329" strokeWidth={0.5} opacity={0.5} />
            </g>
          ))}
          <text x={(FX0 + FX1) / 2} y={FY1 + 32} textAnchor="middle" fill="#8b8b96" fontSize={9.5}>VTD (ml)</text>
          <text x={20} y={(FY0 + FY1) / 2} fill="#8b8b96" fontSize={9.5} transform={`rotate(-90 20 ${(FY0 + FY1) / 2})`} textAnchor="middle">VE (ml)</text>

          {/* lecturee relationship line VE = VTD − 65 across the slider domain */}
          <line
            x1={fxX(EDV_DOM[0])}
            y1={fxY(CO.strokeVolume(EDV_DOM[0]))}
            x2={fxX(EDV_DOM[1])}
            y2={fxY(CO.strokeVolume(EDV_DOM[1]))}
            stroke="#34d399"
            strokeWidth={2}
            opacity={0.85}
          />
          {/* cited resting point (135 → 70) */}
          <circle cx={fxX(CO.REST_EDV)} cy={fxY(CO.REST_SV)} r={4} fill="none" stroke="#fbbf24" strokeWidth={1.6} />
          <text x={fxX(CO.REST_EDV) + 7} y={fxY(CO.REST_SV) - 6} fill="#fbbf24" fontSize={9}>lecture · 135→70</text>
          {/* current operating point */}
          <line x1={fxX(edv)} y1={FY1} x2={fxX(edv)} y2={fxY(sv)} stroke="#e0243a" strokeWidth={0.8} strokeDasharray="3 3" opacity={0.6} />
          <circle cx={fxX(edv)} cy={fxY(sv)} r={5} fill="#e0243a" stroke="#08080a" strokeWidth={1.2} />
          <text x={fxX(edv) + 8} y={fxY(sv) + 4} fill="#e0243a" fontSize={10} fontWeight={700} fontFamily="monospace">{sv} ml</text>
        </g>

        {/* ---- Right: beating ventricle ---- */}
        <g>
          <text x={wallX} y={40} fill="#f4f4f2" fontSize={11} fontWeight={600}>Pompe ventriculaire</text>
          <defs>
            <clipPath id={`co-cav-${uid}`}>
              <rect x={cavX} y={cavY} width={cavW} height={cavH} rx={14} />
            </clipPath>
            <marker id={`co-arrow-${uid}`} markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="#f4f4f2" />
            </marker>
          </defs>
          {/* myocardium */}
          <rect x={wallX} y={wallY} width={wallW} height={wallH} rx={26} fill="#8e1b2a" />
          <rect x={cavX} y={cavY} width={cavW} height={cavH} rx={14} fill="#16070a" />
          <g clipPath={`url(#co-cav-${uid})`}>
            <rect x={cavX} y={bloodY} width={cavW} height={bloodH} fill="#c22033" />
          </g>
          <text x={wallX + wallW / 2} y={wallY + wallH / 2} textAnchor="middle" fill="#f4f4f2" fontSize={18} fontWeight={700} fontFamily="monospace">
            {Math.round(vol)}
          </text>
          <text x={wallX + wallW / 2} y={wallY + wallH / 2 + 16} textAnchor="middle" fill="#f4f4f2" fontSize={9} opacity={0.8}>ml</text>
          {/* ejection arrow */}
          {ejecting && (
            <line
              x1={wallX + wallW / 2}
              y1={wallY - 6}
              x2={wallX + wallW / 2}
              y2={wallY - 30}
              stroke="#f4f4f2"
              strokeWidth={2.5}
              markerEnd={`url(#co-arrow-${uid})`}
              opacity={0.9}
            />
          )}
          <text x={wallX + wallW / 2} y={wallY + wallH + 18} textAnchor="middle" fill="#8b8b96" fontSize={9.5}>
            {ejecting ? 'ejection' : phase < 0.45 ? 'remplissage' : 'rest'}
          </text>
          <text x={wallX + wallW / 2} y={wallY + wallH + 32} textAnchor="middle" fill="#34d399" fontSize={10} fontFamily="monospace" fontWeight={600}>
            VE = {sv} ml
          </text>
        </g>
      </svg>

      {/* ---- CO gauge with lecturee reference markers ---- */}
      <div className="mt-1">
        <div className="mb-1 flex items-center justify-between text-[11px]">
          <span className="font-medium text-muted">Flow cardiaque (L/min)</span>
          <span className="font-mono text-base font-bold text-primary">{co.toFixed(2)}</span>
        </div>
        <div className="relative h-6 w-full overflow-hidden rounded-md border border-border bg-background/60">
          <div className="absolute inset-y-0 left-0 bg-primary/70 transition-[width] duration-150" style={{ width: `${gaugePct}%` }} />
          {[
            { v: CO.REST_CO, label: 'rest 5', color: '#fbbf24' },
            { v: CO.MAX_CO_LOW, label: 'max 20–25', color: '#60a5fa' },
            { v: CO.ATHLETE_CO, label: 'athlète 35', color: '#34d399' },
          ].map((m) => (
            <div key={m.label} className="absolute inset-y-0" style={{ left: `${(m.v / GAUGE_MAX) * 100}%` }}>
              <div className="h-full w-px" style={{ background: m.color }} />
              <span className="absolute top-0.5 left-1 whitespace-nowrap font-mono text-[8px]" style={{ color: m.color }}>{m.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-0.5 flex justify-between font-mono text-[9px] text-faint">
          <span>0</span>
          <span>réserve cardiaque = DC exercice − DC rest (p. 6)</span>
          <span>{GAUGE_MAX}</span>
        </div>
      </div>
    </VizFrame>
  )
}
