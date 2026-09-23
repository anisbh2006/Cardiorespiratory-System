import { AlertTriangle, Stethoscope, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CalloutProps {
  variant: 'important' | 'clinical' | 'key-point'
  title?: string
  children: React.ReactNode
  className?: string
}

const config = {
  important: {
    icon: AlertTriangle,
    label: 'Important',
    classes: 'border-primary/40 bg-primary/[0.06]',
    iconClasses: 'text-primary',
    labelClasses: 'text-primary',
  },
  clinical: {
    icon: Stethoscope,
    label: 'Corrélation clinique',
    classes: 'border-info/40 bg-info/[0.06]',
    iconClasses: 'text-info',
    labelClasses: 'text-info',
  },
  'key-point': {
    icon: Star,
    label: 'Point clé',
    classes: 'border-warning/40 bg-warning/[0.06]',
    iconClasses: 'text-warning',
    labelClasses: 'text-warning',
  },
}

export function Callout({ variant, title, children, className }: CalloutProps) {
  const c = config[variant]
  const Icon = c.icon
  return (
    <div className={cn('rounded-lg border p-4', c.classes, className)}>
      <div className="flex items-center gap-2">
        <Icon className={cn('h-4 w-4', c.iconClasses)} />
        <span className={cn('text-xs font-semibold uppercase tracking-wider', c.labelClasses)}>
          {title ?? c.label}
        </span>
      </div>
      <div className="mt-2 text-sm leading-relaxed text-foreground/90">{children}</div>
    </div>
  )
}
