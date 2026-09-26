import * as React from 'react'
import { motion } from 'framer-motion'
import { RotateCcw, Wind } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface InteractiveEquationProps {
  title: string
  subtitle: string
  formula: string
  variables: { name: string; min: number; max: number; step: number; unit: string; description: string }[]
  compute: (values: number[]) => number
  label: (value: number) => string
}

export function InteractiveEquation({
  title,
  subtitle,
  formula,
  variables,
  compute,
  label,
}: InteractiveEquationProps) {
  const defaults = variables.map((v) => (v.min + v.max) / 2)
  const [values, setValues] = React.useState<number[]>(defaults)

  React.useEffect(() => {
    setValues(defaults)
  }, [formula])

  const result = compute(values)

  const updateValue = (index: number, rawValue: number) => {
    setValues((prev) => {
      const next = [...prev]
      next[index] = rawValue
      return next
    })
  }

  const reset = () => setValues(defaults)

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
      <div className="border-b border-border bg-elevated/40 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.23em] text-primary">Interactive equation</p>
            <h3 className="mt-1 font-serif text-2xl font-semibold text-foreground">{title}</h3>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
            <Wind className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-2 text-sm text-muted">{subtitle}</p>
      </div>

      <div className="grid gap-6 p-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-background/60 p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">Equation</div>
            <div className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{formula}</div>
          </div>

          <div className="space-y-4">
            {variables.map((variable, index) => (
              <label key={variable.name} className="block">
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-foreground">{variable.name}</span>
                  <span className="font-mono text-primary">
                    {values[index].toFixed(variable.step < 1 ? 2 : 0)} {variable.unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={variable.min}
                  max={variable.max}
                  step={variable.step}
                  value={values[index]}
                  onChange={(event) => updateValue(index, Number(event.target.value))}
                  className="h-2 w-full cursor-pointer accent-primary"
                  aria-label={`${variable.name} slider`}
                />
                <div className="mt-1 flex justify-between font-mono text-[10px] text-faint">
                  <span>{variable.min}</span>
                  <span>{variable.description}</span>
                  <span>{variable.max}</span>
                </div>
              </label>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={reset} className="gap-2">
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </Button>
            <div className="rounded-full border border-border bg-elevated px-3 py-1.5 font-mono text-[11px] text-muted">
              {variables.map((variable, index) => `${variable.name} = ${values[index].toFixed(variable.step < 1 ? 2 : 0)} ${variable.unit}`).join(' · ')}
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-xl border border-border bg-gradient-to-b from-primary/10 to-transparent p-4"
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">Calculated result</div>
          <div className="mt-3 text-4xl font-bold tracking-tight text-primary">{label(result)}</div>
          <div className="mt-4 space-y-2 text-sm text-muted">
            <p>
              <span className="font-medium text-foreground">What changed?</span> The flow response is driven by the pressure difference, radius, viscosity and vessel length described in the course material.
            </p>
            <p>
              <span className="font-medium text-foreground">Why?</span> A larger radius strongly increases flow because the radius enters to the fourth power in Poiseuille’s relationship.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
