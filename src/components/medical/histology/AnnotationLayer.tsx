import type { SlideAnnotation } from './types'

interface AnnotationLayerProps {
  annotations: SlideAnnotation[]
  /** Current effective scale, used to counter-scale labels so text stays legible. */
  scale: number
  /** Natural (unscaled) pixel size of the image the annotations are relative to. */
  width: number
  height: number
  visible: boolean
  activeLabel?: string | null
  onHover?: (label: string | null) => void
}

/**
 * Renders supplied coordinate annotations as pins over the micrograph. The layer
 * lives inside the same transformed space as the image, so pins track pan/zoom;
 * each label is counter-scaled by `1/scale` to keep a constant on-screen size.
 *
 * Only annotations present in the source data are drawn — coordinates are never
 * synthesized. When `annotations` is empty this renders nothing.
 */
export function AnnotationLayer({
  annotations,
  scale,
  width,
  height,
  visible,
  activeLabel,
  onHover,
}: AnnotationLayerProps) {
  if (!visible || annotations.length === 0) return null
  const inv = 1 / scale
  return (
    <div className="pointer-events-none absolute inset-0">
      {annotations.map((a) => {
        const active = activeLabel === a.label
        return (
          <div
            key={`${a.label}-${a.x}-${a.y}`}
            className="absolute"
            style={{ left: a.x * width, top: a.y * height }}
          >
            <div
              className="pointer-events-auto -translate-x-1/2 -translate-y-1/2"
              style={{ transform: `translate(-50%,-50%) scale(${inv})`, transformOrigin: 'center' }}
              onMouseEnter={() => onHover?.(a.label)}
              onMouseLeave={() => onHover?.(null)}
            >
              <span
                className={`block h-3 w-3 rounded-full border-2 shadow-[0_0_8px_rgba(0,0,0,0.6)] transition-colors ${
                  active ? 'border-white bg-warning' : 'border-white/90 bg-primary'
                }`}
              />
            </div>
            <div
              className="pointer-events-none absolute left-0 top-0 origin-top-left"
              style={{ transform: `scale(${inv})` }}
            >
              <span
                className={`ml-2 inline-block whitespace-nowrap rounded border px-1.5 py-0.5 text-[11px] font-medium backdrop-blur-sm transition-colors ${
                  active
                    ? 'border-warning/60 bg-warning/20 text-warning'
                    : 'border-white/15 bg-black/70 text-white'
                }`}
              >
                {a.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
