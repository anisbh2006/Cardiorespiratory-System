import { FileClock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AwaitingContentProps {
  title?: string
  description?: string
  className?: string
}

/**
 * Rendered wherever course source material has not yet been integrated.
 * Never replaced by invented medical content.
 */
export function AwaitingContent({
  title = 'Contenu en attente d\'intégration',
  description = 'Cette section affichera le contenu exact des fichiers de cours fournis. Aucune information médicale n\'est inventée : les noms de chapitres, leçons et contenus proviendront intégralement du matériel source.',
  className,
}: AwaitingContentProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-border-strong bg-surface/40 px-6 py-14 text-center',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-elevated shadow-[0_0_0_4px_rgba(224,36,58,0.04)]">
        <FileClock className="h-5 w-5 text-primary" />
      </div>
      <h3 className="mt-5 text-sm font-semibold tracking-tight text-foreground">{title}</h3>
      <p className="mt-2 max-w-md text-xs leading-relaxed text-muted">{description}</p>
    </div>
  )
}
