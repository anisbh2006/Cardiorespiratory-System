import { BookOpen } from 'lucide-react'

interface DefinitionBoxProps {
  term: string
  children: React.ReactNode
}

export function DefinitionBox({ term, children }: DefinitionBoxProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-primary" />
        <span className="font-serif text-sm font-semibold text-foreground">{term}</span>
      </div>
      <div className="mt-2 text-sm leading-relaxed text-muted">{children}</div>
    </div>
  )
}
