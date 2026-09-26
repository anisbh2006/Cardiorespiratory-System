import { FileClock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/context/LanguageContext'

interface AwaitingContentProps {
  title?: string
  description?: string
  className?: string
}

/**
 * Rendered wherever lecturee source material has not yet been integrated.
 * Never replaced by invented medical content.
 */
export function AwaitingContent({
  title,
  description,
  className,
}: AwaitingContentProps) {
  const { t } = useLanguage()
  const safeTitle = title ?? t('common.awaitingContent')
  const safeDescription = description ?? t('common.notAvailableYet')

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
      <h3 className="mt-5 text-sm font-semibold tracking-tight text-foreground">{safeTitle}</h3>
      <p className="mt-2 max-w-md text-xs leading-relaxed text-muted">{safeDescription}</p>
    </div>
  )
}
