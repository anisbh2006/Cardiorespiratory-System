import { ImageIcon } from 'lucide-react'
import { cn, isRenderableImage } from '@/lib/utils'

interface ImageFigureProps {
  src: string
  caption: string
  credit?: string
  className?: string
}

export function ImageFigure({ src, caption, credit, className }: ImageFigureProps) {
  const renderable = isRenderableImage(src)
  return (
    <figure className={cn('my-7', className)}>
      <div className="overflow-hidden rounded-lg border border-border bg-elevated p-2 shadow-xs transition-colors duration-300 hover:border-border-strong">
        {renderable ? (
          <img src={src} alt={caption} loading="lazy" className="w-full rounded-md object-contain" />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 rounded-md bg-surface/60 px-6 py-12 text-center">
            <ImageIcon className="h-6 w-6 text-faint" />
            <p className="text-xs text-muted">
              Course figure in metafile format (
              <span className="font-mono text-faint">
                {src.split('.').pop()?.toUpperCase()}
              </span>
              ) non affichable dans le navigateur.
            </p>
            <p className="text-[11px] text-faint">
              It is preserved as supplied in the source material; no image of
              remplacement n'est générée.
            </p>
          </div>
        )}
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
