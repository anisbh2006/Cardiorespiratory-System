import { AlertTriangle, Stethoscope, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/context/LanguageContext'

interface CalloutProps {
  variant: 'important' | 'clinical' | 'key-point'
  title?: string
  children: React.ReactNode
  className?: string
}

const config = {
  important: {
    icon: AlertTriangle,
    classes: 'border-primary/30 border-l-primary bg-primary/[0.05]',
    iconClasses: 'text-primary',
    labelClasses: 'text-primary',
  },
  clinical: {
    icon: Stethoscope,
    classes: 'border-info/30 border-l-info bg-info/[0.05]',
    iconClasses: 'text-info',
    labelClasses: 'text-info',
  },
  'key-point': {
    icon: Star,
    classes: 'border-warning/30 border-l-warning bg-warning/[0.05]',
    iconClasses: 'text-warning',
    labelClasses: 'text-warning',
  },
}

export function Callout({ variant, title, children, className }: CalloutProps) {
  const { t } = useLanguage()
  const c = config[variant]
  const labels = {
    important: t('medical.important'),
    clinical: t('medical.clinicalCorrelation'),
    'key-point': t('medical.keyPoint'),
  }
  const Icon = c.icon
  return (
    <div className={cn('rounded-lg border border-l-2 p-4', c.classes, className)}>
      <div className="flex items-center gap-2">
        <Icon className={cn('h-4 w-4 shrink-0', c.iconClasses)} />
        <span className={cn('text-xs font-semibold uppercase tracking-wider', c.labelClasses)}>
          {title ?? labels[variant]}
        </span>
      </div>
      <div className="mt-2 text-sm leading-relaxed text-foreground/90">{children}</div>
    </div>
  )
}
