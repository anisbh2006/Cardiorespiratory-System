import * as React from 'react'
import { motion } from 'framer-motion'
import { Gauge, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScientificGraph } from '@/components/biophysics/ScientificGraph'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export function PoiseuilleLab() {
  const [pressure, setPressure] = React.useState(40)
  const [radius, setRadius] = React.useState(2.5)
  const [length, setLength] = React.useState(12)
  const [viscosity, setViscosity] = React.useState(3.5)

  const flow = (pressure * Math.pow(radius, 4)) / (8 * viscosity * length)

  const reset = () => {
    setPressure(40)
    setRadius(2.5)
    setLength(12)
    setViscosity(3.5)
  }

  const vesselWidth = 120 + radius * 18
  const vesselOpacity = clamp(0.45 + radius / 5, 0.4, 1)

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
      <div className="border-b border-border bg-elevated/40 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.23em] text-primary">Flow experiment</p>
            <h3 className="mt-1 font-serif text-2xl font-semibold text-foreground">Hemodynamics laboratory</h3>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
            <Gauge className="h-4 w-4" />
          </span>
        </div>
      </div>

      <div className="grid gap-6 p-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-background/60 p-4">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>Pressure gradient</span>
              <span className="font-mono text-primary">{pressure.toFixed(0)} mmHg</span>
            </div>
            <input type="range" min={10} max={80} value={pressure} onChange={(e) => setPressure(Number(e.target.value))} className="mt-2 w-full accent-primary" aria-label="Pressure gradient" />

            <div className="mt-4 flex items-center justify-between text-xs text-muted">
              <span>Radius</span>
              <span className="font-mono text-primary">{radius.toFixed(2)} mm</span>
            </div>
            <input type="range" min={1} max={5} step={0.1} value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="mt-2 w-full accent-primary" aria-label="Vessel radius" />

            <div className="mt-4 flex items-center justify-between text-xs text-muted">
              <span>Vessel length</span>
              <span className="font-mono text-primary">{length.toFixed(1)} cm</span>
            </div>
            <input type="range" min={5} max={25} step={0.5} value={length} onChange={(e) => setLength(Number(e.target.value))} className="mt-2 w-full accent-primary" aria-label="Vessel length" />

            <div className="mt-4 flex items-center justify-between text-xs text-muted">
              <span>Viscosity</span>
              <span className="font-mono text-primary">{viscosity.toFixed(1)} cP</span>
            </div>
            <input type="range" min={1} max={8} step={0.1} value={viscosity} onChange={(e) => setViscosity(Number(e.target.value))} className="mt-2 w-full accent-primary" aria-label="Blood viscosity" />

            <div className="mt-6 flex items-center justify-between rounded-lg border border-border bg-elevated p-3">
              <span className="text-sm text-muted">Calculated flow</span>
              <span className="font-mono text-xl font-semibold text-primary">{flow.toFixed(2)} AU</span>
            </div>

            <div className="mt-4 flex justify-start">
              <Button variant="outline" size="sm" onClick={reset} className="gap-2">
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-background/60 p-4">
            <div className="mb-3 flex items-center justify-between text-xs text-muted">
              <span>Vessel visualization</span>
              <span className="font-mono text-primary">Q ∝ ΔP × r^4 / ηL</span>
            </div>
            <div className="relative flex h-32 items-center justify-center overflow-hidden rounded-xl border border-border bg-[radial-gradient(circle_at_center,_rgba(224,36,58,0.08),_transparent_50%)]">
              <motion.div
                initial={false}
                animate={{ width: vesselWidth, opacity: vesselOpacity }}
                transition={{ duration: 0.5 }}
                className="relative h-20 rounded-full border border-primary/60 bg-primary/20"
              >
                {[...Array(9)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-y-0 w-1.5 rounded-full bg-primary/70"
                    style={{ left: `${10 + i * 10}%` }}
                    animate={{ opacity: [0.25, 1, 0.25], scaleY: [0.85, 1.2, 0.85] }}
                    transition={{ duration: 1.1 + i * 0.1, repeat: Infinity }}
                  />
                ))}
              </motion.div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <ScientificGraph
            title="Flow-pressure relationship"
            xLabel="Pressure gradient"
            yLabel="Flow"
            xValue={pressure}
            flowValue={flow}
            minX={10}
            maxX={80}
            minY={0}
            maxY={Math.max(60, flow * 2)}
          />

          <div className="rounded-xl border border-border bg-background/60 p-4">
            <h4 className="font-serif text-xl font-semibold text-foreground">What happened?</h4>
            <div className="mt-3 space-y-3 text-sm text-muted">
              <p><span className="font-medium text-foreground">What changed?</span> Pressure difference, vessel radius, viscosity and length were adjusted.</p>
              <p><span className="font-medium text-foreground">What happened?</span> Flow changes immediately because the radius affects the result to the fourth power, while viscosity and length oppose flow.</p>
              <p><span className="font-medium text-foreground">Key takeaway:</span> In the course material, vascular resistance is strongly modulated by vessel caliber.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
