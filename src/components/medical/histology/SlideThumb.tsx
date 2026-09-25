import * as React from 'react'
import { ImageOff } from 'lucide-react'
import { cn, isRenderableImage } from '@/lib/utils'

interface SlideThumbProps {
  src: string
  alt?: string
  className?: string
}

/**
 * Micrograph thumbnail that degrades gracefully. A few supplied figures are
 * Windows metafiles (.emf) that browsers cannot decode; instead of a broken
 * image icon we show a neutral placeholder. The underlying slide data is
 * untouched — nothing is replaced or invented.
 */
export function SlideThumb({ src, alt = '', className }: SlideThumbProps) {
  const [failed, setFailed] = React.useState(false)
  const renderable = isRenderableImage(src)

  React.useEffect(() => setFailed(false), [src])

  if (!renderable || failed) {
    return (
      <span
        className={cn(
          'flex h-full w-full items-center justify-center bg-elevated text-faint',
          className
        )}
      >
        <ImageOff className="h-3.5 w-3.5" />
      </span>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn('h-full w-full object-cover', className)}
    />
  )
}
