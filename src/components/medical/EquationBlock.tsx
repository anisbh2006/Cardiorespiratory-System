import { Sigma } from 'lucide-react'

interface EquationBlockProps {
  text: string
  variables?: { symbol: string; meaning: string }[]
}

export function EquationBlock({ text, variables }: EquationBlockProps) {
  return (
    <div className="my-6 rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center gap-2">
        <Sigma className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">Équation</span>
      </div>
      <div className="mt-3 rounded-md bg-background/60 px-4 py-3 text-center font-mono text-base text-foreground">
        {text}
      </div>
      {variables && variables.length > 0 && (
        <dl className="mt-3 grid gap-1.5 sm:grid-cols-2">
          {variables.map((v) => (
            <div key={v.symbol} className="flex items-baseline gap-2 text-xs">
              <dt className="font-mono font-medium text-primary">{v.symbol}</dt>
              <dd className="text-muted">{v.meaning}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}
