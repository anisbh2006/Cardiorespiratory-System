import * as React from 'react'
import { cn } from '@/lib/utils'

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  indicatorClassName?: string
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, indicatorClassName, ...props }, ref) => (
    <div
      ref={ref}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      className={cn(
        'relative h-1.5 w-full overflow-hidden rounded-full bg-overlay shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'h-full rounded-full bg-primary shadow-[0_0_8px_rgba(224,36,58,0.35)] transition-[width] duration-700 ease-out',
          indicatorClassName
        )}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
)
Progress.displayName = 'Progress'

export { Progress }
