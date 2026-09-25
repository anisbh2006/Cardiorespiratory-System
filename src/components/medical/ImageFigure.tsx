import { cn } from '@/lib/utils'

interface ImageFigureProps {
  src: string
  caption: string
  credit?: string
  className?: string
}

export function ImageFigure({ src, caption, credit, className }: ImageFigureProps) {
  return (
    <figure className={cn('my-7', className)}>
      <div className="overflow-hidden rounded-lg border border-border bg-elevated p-2 shadow-xs transition-colors duration-300 hover:border-border-strong">
        <img
          src={src}
          alt={caption}
          loading="lazy"
          className="w-full rounded-md object-contain"
        />
      </div>
      <figcaption className="mt-2.5 flex gap-2.5 text-xs leading-relaxed text-muted">
        <span className="mt-0.5 h-full w-px shrink-0 self-stretch bg-primary/40" />
        <span>
          <span className="font-medium text-foreground/85">{caption}</span>
          {credit && <span className="ml-2 text-faint">{credit}</span>}
        </span>
      </figcaption>
    </figure>
  )
}
