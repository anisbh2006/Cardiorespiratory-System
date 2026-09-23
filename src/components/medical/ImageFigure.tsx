import { cn } from '@/lib/utils'

interface ImageFigureProps {
  src: string
  caption: string
  credit?: string
  className?: string
}

export function ImageFigure({ src, caption, credit, className }: ImageFigureProps) {
  return (
    <figure className={cn('my-6', className)}>
      <div className="overflow-hidden rounded-lg border border-border bg-elevated">
        <img src={src} alt={caption} loading="lazy" className="w-full object-contain" />
      </div>
      <figcaption className="mt-2 text-xs leading-relaxed text-muted">
        <span className="font-medium text-foreground/80">{caption}</span>
        {credit && <span className="ml-2 text-faint">{credit}</span>}
      </figcaption>
    </figure>
  )
}
