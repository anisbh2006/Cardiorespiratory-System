import * as React from 'react'
import { RefreshCw } from 'lucide-react'
import { VizFrame } from '../VizFrame'
import { usePhysioClock } from '../usePhysioClock'
import { buildWavePath, mapY, sampleWave } from '../waveform'
import * as G from '../data/gasExchange'

/* Anatomy geometry. */
const ALV_CX = 180
const ALV_CY = 74
const ALV_R = 54
const MEM_Y = 138
const MEM_H = 14
const CAP_Y0 = 168
const CAP_Y1 = 206
const CAP_X0 = 44
const CAP_X1 = 322

/* Equilibration plot geometry. */
const PX0 = 400
const PX1 = 706
const PY0 = 56
const PY1 = 214
const PSCALE = { min: 30, max: 115 }
const PXP = (p: number) => PX0 + p * (PX1 - PX0)
const PYP = (v: number) => mapY(v, { ...PSCALE, top: PY0, bottom: PY1 })

function lerpColor(t: number): string {
  // venous #3d5a80 → arterial #c22033
  const a = [61, 90, 128]
  const b = [194, 32, 51]
  const c = a.map((av, i) => Math.round(av + (b[i] - av) * t))
  return `rgb(${c[0]},${c[1]},${c[2]})`
}

const O2_OFFSETS = [0, 0.33, 0.66]
const CO2_OFFSETS = [0.16, 0.5, 0.83]

export function GasExchangeViz() {
  const clock = usePhysioClock({ cycleSeconds: G.EQUILIBRATION_SECONDS })
  const phase = ((clock.phase % 1) + 1) % 1

  const bloodPo2 = sampleWave(G.BLOOD_PO2, phase)
  const bloodPco2 = sampleWave(G.BLOOD_PCO2, phase)
  const oxygenation = (bloodPo2 - G.VENOUS_PO2) / (G.ARTERIAL_PO2 - G.VENOUS_PO2)
  const bloodColor = lerpColor(Math.max(0, Math.min(1, oxygenation)))

  const po2Path = React.useMemo(
    () => buildWavePath(G.BLOOD_PO2, { left: PX0, right: PX1, top: PY0, bottom: PY1, min: PSCALE.min, max: PSCALE.max }),
    []
  )
  const pco2Path = React.useMemo(
    () => buildWavePath(G.BLOOD_PCO2, { left: PX0, right: PX1, top: PY0, bottom: PY1, min: PSCALE.min, max: PSCALE.max }),
    []
  )

  const rbcX = CAP_X0 + 18 + phase * (CAP_X1 - CAP_X0 - 36)
  const rbcY = (CAP_Y0 + CAP_Y1) / 2

  return (
    <VizFrame
      title="Alveolar-capillary gas exchange"
      subtitle="Diffusion of O2 and CO2 along the partial-pressure gradient ; equilibrium reached en 0,3–0,4 s"
      icon={<RefreshCw className="h-4 w-4" />}
      system="respiratory"
      clock={clock}
      cycleSeconds={G.EQUILIBRATION_SECONDS}
      readout={`transit capillaire t = ${(phase * G.EQUILIBRATION_SECONDS * 1000).toFixed(0)} ms · blood PO₂ ${bloodPo2.toFixed(0)} · PCO₂ ${bloodPco2.toFixed(1)} mmHg`}
      legend={[
        { color: '#7dd3fc', label: 'O₂ (alveolus → blood)' },
        { color: '#a1a1aa', label: 'CO₂ (blood → alveolus)' },
        { color: '#e0243a', label: 'PO₂ blooduine' },
        { color: '#60a5fa', label: 'PCO₂ blooduine' },
      ]}
      sources={G.SOURCES}
      lesson={G.LESSON}
      aside={
        <>
          <div className="rounded-lg border border-border bg-background/50 p-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">Gradients en direct</div>
            <dl className="mt-2 space-y-1.5 text-[11px]">
              <div className="flex items-baseline justify-between">
                <dt className="text-muted">Alvéole PO₂ / PCO₂</dt>
                <dd className="font-mono text-foreground">105 / 40</dd>
              </div>
              <div className="flex items-baseline justify-between">
                <dt className="text-muted">Blood PO₂ / PCO₂</dt>
                <dd className="font-mono text-primary">{bloodPo2.toFixed(0)} / {bloodPco2.toFixed(1)}</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-border/60 pt-1.5">
                <dt className="text-muted">ΔP O₂ (alveolus−blood)</dt>
                <dd className="font-mono text-success">{(G.ALVEOLAR_PO2 - bloodPo2).toFixed(0)} mmHg</dd>
              </div>
              <div className="flex items-baseline justify-between">
                <dt className="text-muted">ΔP CO₂ (blood−alveolus)</dt>
                <dd className="font-mono text-info">{(bloodPco2 - G.ALVEOLAR_PCO2).toFixed(1)} mmHg</dd>
              </div>
            </dl>
            <div className="mt-2 rounded-md bg-surface/70 p-2 text-[10px] leading-snug text-faint">
              Un gaz diffuse toujours d’une zone de partial pressure élevée vers une zone de
              partial pressure basse (p. 8).
            </div>
          </div>

          <div className="rounded-lg border border-border bg-background/50 p-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">Pressures partielles (mmHg)</div>
            <table className="mt-2 w-full text-[10.5px]">
              <thead>
                <tr className="text-faint">
                  <th className="text-left font-medium">Compartiment</th>
                  <th className="text-right font-medium">PO₂</th>
                  <th className="text-right font-medium">PCO₂</th>
                </tr>
              </thead>
              <tbody className="font-mono text-foreground">
                {G.PRESSURE_TABLE.map((r) => (
                  <tr key={r.compartment} className="border-t border-border/60">
                    <td className="py-0.5 pr-1 font-sans text-muted">{r.compartment}</td>
                    <td className="py-0.5 text-right text-success">{r.po2}</td>
                    <td className="py-0.5 text-right text-info">{r.pco2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-lg border border-border bg-background/50 p-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">Loi de Fick (p. 18)</div>
            <div className="mt-1.5 rounded-md bg-surface/70 px-2 py-1.5 text-center font-mono text-sm text-foreground">
              {G.FICK}
            </div>
            <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
              Membrane {G.MEMBRANE_THICKNESS} — 6 couches (p. 12)
            </div>
            <ol className="mt-1 space-y-0.5 text-[10px] text-muted">
              {G.MEMBRANE_LAYERS.map((l, i) => (
                <li key={l}><span className="font-mono text-primary">{i + 1}</span> {l}</li>
              ))}
            </ol>
          </div>

          <div className="rounded-lg border border-border bg-background/50 p-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">Valeurs the lesson</div>
            <dl className="mt-2 space-y-1.5">
              {G.KEY_FACTS.map((f) => (
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
      <svg viewBox="0 0 720 300" className="h-auto w-full select-none" role="img" aria-label="Alveolar-capillary gas exchange animés">
        <defs>
          <marker id="ge-o2" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#7dd3fc" />
          </marker>
          <marker id="ge-co2" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#a1a1aa" />
          </marker>
        </defs>

        {/* ---------------- Left: alveolus + membrane + capillary ---------------- */}
        <g>
          {/* alveolus */}
          <circle cx={ALV_CX} cy={ALV_CY} r={ALV_R} fill="#1b2a3a" stroke="#2f4a63" strokeWidth={2} />
          <circle cx={ALV_CX} cy={ALV_CY} r={ALV_R - 8} fill="none" stroke="#2f4a63" strokeWidth={1} opacity={0.5} />
          <text x={ALV_CX} y={ALV_CY - 8} textAnchor="middle" fill="#f4f4f2" fontSize={11} fontWeight={600}>Alvéole</text>
          <text x={ALV_CX} y={ALV_CY + 8} textAnchor="middle" fill="#7dd3fc" fontSize={10} fontFamily="monospace">PO₂ 105</text>
          <text x={ALV_CX} y={ALV_CY + 22} textAnchor="middle" fill="#a1a1aa" fontSize={10} fontFamily="monospace">PCO₂ 40</text>

          {/* membrane band with 6 layers */}
          <rect x={58} y={MEM_Y} width={250} height={MEM_H} fill="#2a2a32" stroke="#3a3a44" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line key={i} x1={58} y1={MEM_Y + (i + 0.5) * (MEM_H / 6)} x2={308} y2={MEM_Y + (i + 0.5) * (MEM_H / 6)} stroke="#4a4a55" strokeWidth={0.6} />
          ))}
          <text x={312} y={MEM_Y + 11} fill="#8b8b96" fontSize={8.5}>membrane {G.MEMBRANE_THICKNESS}</text>

          {/* O2 particles (alveolus → capillary) */}
          {O2_OFFSETS.map((off, i) => {
            const prog = (phase + off) % 1
            const x = 120 + i * 40
            const y = ALV_CY + 20 + prog * (rbcY - (ALV_CY + 20))
            return (
              <g key={`o2-${i}`} opacity={prog < 0.05 || prog > 0.95 ? 0.3 : 0.95}>
                <circle cx={x} cy={y} r={3.4} fill="#7dd3fc" />
                <text x={x} y={y + 2} textAnchor="middle" fill="#08131c" fontSize={5} fontWeight={700}>O₂</text>
              </g>
            )
          })}
          {/* CO2 particles (capillary → alveolus) */}
          {CO2_OFFSETS.map((off, i) => {
            const prog = (phase + off) % 1
            const x = 100 + i * 50
            const y = rbcY - prog * (rbcY - (ALV_CY + 20))
            return (
              <g key={`co2-${i}`} opacity={prog < 0.05 || prog > 0.95 ? 0.3 : 0.9}>
                <circle cx={x} cy={y} r={3.4} fill="#a1a1aa" />
                <text x={x} y={y + 2} textAnchor="middle" fill="#0a0a0c" fontSize={4.5} fontWeight={700}>CO₂</text>
              </g>
            )
          })}

          {/* capillary tube */}
          <rect x={CAP_X0} y={CAP_Y0} width={CAP_X1 - CAP_X0} height={CAP_Y1 - CAP_Y0} rx={16} fill="#16070a" stroke="#3a3a44" />
          {/* blood column with gradient (venous → arterial) */}
          <clipPath id="ge-cap">
            <rect x={CAP_X0 + 3} y={CAP_Y0 + 3} width={CAP_X1 - CAP_X0 - 6} height={CAP_Y1 - CAP_Y0 - 6} rx={13} />
          </clipPath>
          <g clipPath="url(#ge-cap)">
            <rect x={CAP_X0} y={CAP_Y0} width={rbcX - CAP_X0} height={CAP_Y1 - CAP_Y0} fill={bloodColor} opacity={0.85} />
            <rect x={rbcX} y={CAP_Y0} width={CAP_X1 - rbcX} height={CAP_Y1 - CAP_Y0} fill="#3d5a80" opacity={0.5} />
          </g>
          {/* travelling red blood cell */}
          <ellipse cx={rbcX} cy={rbcY} rx={9} ry={6.5} fill={bloodColor} stroke="#ffd9de" strokeWidth={1} />
          <ellipse cx={rbcX} cy={rbcY} rx={3.5} ry={2.4} fill="#000" opacity={0.25} />

          <text x={CAP_X0} y={CAP_Y1 + 16} fill="#60a5fa" fontSize={9} fontWeight={600}>Blood veinux · PO₂ 40 · PCO₂ 46</text>
          <text x={CAP_X1} y={CAP_Y1 + 16} textAnchor="end" fill="#e0243a" fontSize={9} fontWeight={600}>Blood artériel · PO₂ 105 · PCO₂ 40</text>
          <text x={CAP_X0} y={CAP_Y0 - 6} fill="#8b8b96" fontSize={8.5}>capillaire pulmonaire →</text>
        </g>

        {/* ---------------- Right: equilibration curves ---------------- */}
        <g>
          <text x={PX0} y={30} fill="#f4f4f2" fontSize={11} fontWeight={600}>Équilibration le long du capillaire</text>
          {/* alveolar reference lines */}
          <line x1={PX0} y1={PYP(G.ALVEOLAR_PO2)} x2={PX1} y2={PYP(G.ALVEOLAR_PO2)} stroke="#e0243a" strokeWidth={1} strokeDasharray="4 3" opacity={0.5} />
          <text x={PX1 - 4} y={PYP(G.ALVEOLAR_PO2) - 4} textAnchor="end" fill="#e0243a" fontSize={8.5}>PAO₂ 105</text>
          <line x1={PX0} y1={PYP(G.ALVEOLAR_PCO2)} x2={PX1} y2={PYP(G.ALVEOLAR_PCO2)} stroke="#60a5fa" strokeWidth={1} strokeDasharray="4 3" opacity={0.5} />
          <text x={PX1 - 4} y={PYP(G.ALVEOLAR_PCO2) + 12} textAnchor="end" fill="#60a5fa" fontSize={8.5}>PACO₂ 40</text>

          {/* y grid */}
          {[40, 60, 80, 100].map((v) => (
            <g key={v}>
              <line x1={PX0} y1={PYP(v)} x2={PX1} y2={PYP(v)} stroke="#232329" strokeWidth={0.6} />
              <text x={PX0 - 6} y={PYP(v) + 3} textAnchor="end" fill="#5c5c66" fontSize={8.5} fontFamily="monospace">{v}</text>
            </g>
          ))}
          <text x={PX0 - 30} y={(PY0 + PY1) / 2} fill="#8b8b96" fontSize={9} transform={`rotate(-90 ${PX0 - 30} ${(PY0 + PY1) / 2})`} textAnchor="middle">mmHg</text>

          {/* curves */}
          <path d={pco2Path} fill="none" stroke="#60a5fa" strokeWidth={1.8} opacity={0.9} />
          <path d={po2Path} fill="none" stroke="#e0243a" strokeWidth={2} opacity={0.95} />

          {/* equilibration zone marker (0.3–0.4 s = phase 0.75–1) */}
          <rect x={PXP(0.75)} y={PY0} width={PXP(1) - PXP(0.75)} height={PY1 - PY0} fill="#34d399" opacity={0.08} />
          <text x={PXP(0.78)} y={PY0 + 12} fill="#34d399" fontSize={8.5} fontWeight={600}>équilibre 0,3–0,4 s</text>

          {/* playhead + dots */}
          <line x1={PXP(phase)} y1={PY0} x2={PXP(phase)} y2={PY1} stroke="#f4f4f2" strokeWidth={1} opacity={0.6} />
          <circle cx={PXP(phase)} cy={PYP(bloodPco2)} r={3.2} fill="#60a5fa" stroke="#08080a" strokeWidth={1} />
          <circle cx={PXP(phase)} cy={PYP(bloodPo2)} r={3.6} fill="#e0243a" stroke="#08080a" strokeWidth={1.2} />

          {/* x axis */}
          <line x1={PX0} y1={PY1} x2={PX1} y2={PY1} stroke="#232329" strokeWidth={1} />
          <text x={PX0} y={PY1 + 16} fill="#5c5c66" fontSize={8.5} fontFamily="monospace">0</text>
          <text x={PX1} y={PY1 + 16} textAnchor="end" fill="#5c5c66" fontSize={8.5} fontFamily="monospace">0,4 s (transit)</text>
          <text x={(PX0 + PX1) / 2} y={PY1 + 30} textAnchor="middle" fill="#8b8b96" fontSize={9}>temps de transit capillaire</text>
        </g>
      </svg>
    </VizFrame>
  )
}
