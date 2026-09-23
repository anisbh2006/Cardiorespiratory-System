import * as React from 'react'
import {
  Crosshair,
  Loader2,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  RotateCcw,
  Scan,
  ImageOff,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AnnotationLayer } from './AnnotationLayer'
import type { HistologySlide } from './types'

const MIN_ZOOM = 1
const MAX_ZOOM = 12

interface MicroscopeViewerProps {
  slide: HistologySlide
  className?: string
  /** Optional extra toolbar actions rendered on the left of the toolbar. */
  toolbarExtra?: React.ReactNode
}

interface Vec {
  x: number
  y: number
}

/**
 * High-resolution microscopy stage.
 *
 * The image is drawn at its natural pixel size inside a wrapper that is centered
 * in the viewport and transformed with `translate(t) scale(fitScale * zoom)`.
 * `zoom === 1` means "fit to viewport"; larger values magnify. Zoom is anchored
 * at the cursor, pan is drag-based and clamped so the image always covers the
 * viewport, and the whole stage can go fullscreen. Coordinate annotations from
 * the source data are overlaid and track the transform.
 */
export function MicroscopeViewer({ slide, className, toolbarExtra }: MicroscopeViewerProps) {
  const stageRef = React.useRef<HTMLDivElement>(null)

  const [box, setBox] = React.useState({ w: 0, h: 0 })
  const [natural, setNatural] = React.useState({ w: 0, h: 0 })
  const [zoom, setZoom] = React.useState(1)
  const [t, setT] = React.useState<Vec>({ x: 0, y: 0 })
  const [dragging, setDragging] = React.useState(false)
  const [loaded, setLoaded] = React.useState(false)
  const [error, setError] = React.useState(false)
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [showLabels, setShowLabels] = React.useState(true)
  const [showReticle, setShowReticle] = React.useState(false)
  const [activeLabel, setActiveLabel] = React.useState<string | null>(null)

  const dragStart = React.useRef({ x: 0, y: 0, tx: 0, ty: 0 })

  // Reset the transform whenever we move to a different image.
  React.useEffect(() => {
    setZoom(1)
    setT({ x: 0, y: 0 })
    setLoaded(false)
    setError(false)
    setActiveLabel(null)
  }, [slide.src])

  // Track the stage size so "fit" and pan bounds stay correct on resize.
  React.useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect
      setBox({ w: r.width, h: r.height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  React.useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  const fitScale = natural.w > 0 && box.w > 0 ? Math.min(box.w / natural.w, box.h / natural.h) : 1
  const scale = fitScale * zoom

  const clamp = React.useCallback(
    (v: Vec, s: number): Vec => {
      const maxX = Math.max(0, (s * natural.w - box.w) / 2)
      const maxY = Math.max(0, (s * natural.h - box.h) / 2)
      return { x: Math.min(maxX, Math.max(-maxX, v.x)), y: Math.min(maxY, Math.max(-maxY, v.y)) }
    },
    [natural.w, natural.h, box.w, box.h]
  )

  /** Zoom to `nextZoom` keeping the container-relative point `c` fixed. */
  const zoomAt = React.useCallback(
    (nextZoom: number, c: Vec) => {
      setZoom((z) => {
        const nz = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom))
        const r = nz / z
        setT((prev) => clamp({ x: c.x - r * (c.x - prev.x), y: c.y - r * (c.y - prev.y) }, fitScale * nz))
        return nz
      })
    },
    [clamp, fitScale]
  )

  const centerPoint = (clientX: number, clientY: number): Vec => {
    const r = stageRef.current?.getBoundingClientRect()
    if (!r) return { x: 0, y: 0 }
    return { x: clientX - r.left - r.width / 2, y: clientY - r.top - r.height / 2 }
  }

  // Non-passive wheel listener so we can preventDefault the page scroll.
  React.useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const c = centerPoint(e.clientX, e.clientY)
      setZoom((z) => {
        const nz = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z * Math.exp(-e.deltaY * 0.0015)))
        const r = nz / z
        setT((prev) => clamp({ x: c.x - r * (c.x - prev.x), y: c.y - r * (c.y - prev.y) }, fitScale * nz))
        return nz
      })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [clamp, fitScale])

  const onPointerDown = (e: React.PointerEvent) => {
    try {
      ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    } catch {
      // Capture can fail (e.g. synthetic events); dragging still works via move deltas.
    }
    setDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY, tx: t.x, ty: t.y }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return
    setT(
      clamp(
        { x: dragStart.current.tx + (e.clientX - dragStart.current.x), y: dragStart.current.ty + (e.clientY - dragStart.current.y) },
        scale
      )
    )
  }
  const endDrag = () => setDragging(false)

  const onDoubleClick = (e: React.MouseEvent) => {
    const c = centerPoint(e.clientX, e.clientY)
    zoomAt(e.shiftKey ? zoom / 1.8 : zoom * 1.8, c)
  }

  const reset = () => {
    setZoom(1)
    setT({ x: 0, y: 0 })
  }
  const actualPixels = () => {
    // zoom so that effective scale === 1 (1 image px = 1 screen px)
    setZoom(fitScale > 0 ? 1 / fitScale : 1)
    setT({ x: 0, y: 0 })
  }

  const toggleFullscreen = () => {
    const el = stageRef.current?.parentElement?.parentElement ?? stageRef.current
    if (!document.fullscreenElement) el?.requestFullscreen?.()
    else document.exitFullscreen?.()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    const c = { x: 0, y: 0 }
    if (e.key === '+' || e.key === '=') {
      e.preventDefault()
      zoomAt(zoom * 1.4, c)
    } else if (e.key === '-' || e.key === '_') {
      e.preventDefault()
      zoomAt(zoom / 1.4, c)
    } else if (e.key === '0') {
      e.preventDefault()
      reset()
    } else if (e.key === 'f' || e.key === 'F') {
      e.preventDefault()
      toggleFullscreen()
    }
  }

  const annotations = slide.annotations ?? []
  const zoomPct = Math.round(zoom * 100)

  const ToolButton = ({
    onClick,
    title,
    active,
    children,
  }: {
    onClick: () => void
    title: string
    active?: boolean
    children: React.ReactNode
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={cn(
        'rounded-md p-1.5 transition-colors cursor-pointer',
        active ? 'bg-primary/20 text-primary' : 'text-muted hover:bg-elevated hover:text-foreground'
      )}
    >
      {children}
    </button>
  )

  return (
    <div
      className={cn(
        'flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-[#07070a]',
        isFullscreen && 'rounded-none border-0',
        className
      )}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 border-b border-border bg-surface px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          {toolbarExtra}
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-foreground">{slide.title}</div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-faint">
              {slide.stain && <span className="text-info">{slide.stain}</span>}
              {slide.page != null && <span>diapo {slide.page}</span>}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          <ToolButton onClick={() => zoomAt(zoom / 1.4, { x: 0, y: 0 })} title="Dézoomer (−)">
            <Minus className="h-3.5 w-3.5" />
          </ToolButton>
          <button
            type="button"
            onClick={reset}
            title="Ajuster à l'écran"
            className="w-14 rounded-md py-1 text-center font-mono text-[11px] text-muted transition-colors hover:bg-elevated hover:text-foreground cursor-pointer"
          >
            {zoomPct}%
          </button>
          <ToolButton onClick={() => zoomAt(zoom * 1.4, { x: 0, y: 0 })} title="Zoomer (+)">
            <Plus className="h-3.5 w-3.5" />
          </ToolButton>
          <span className="mx-1 h-4 w-px bg-border" />
          <ToolButton onClick={actualPixels} title="Pixels réels (1:1)">
            <Scan className="h-3.5 w-3.5" />
          </ToolButton>
          <ToolButton onClick={reset} title="Réinitialiser (0)">
            <RotateCcw className="h-3.5 w-3.5" />
          </ToolButton>
          {annotations.length > 0 && (
            <ToolButton onClick={() => setShowLabels((v) => !v)} title="Annotations" active={showLabels}>
              <Crosshair className="h-3.5 w-3.5" />
            </ToolButton>
          )}
          <ToolButton onClick={() => setShowReticle((v) => !v)} title="Réticule" active={showReticle}>
            <Crosshair className="h-3.5 w-3.5" />
          </ToolButton>
          <ToolButton onClick={toggleFullscreen} title="Plein écran (F)">
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </ToolButton>
        </div>
      </div>

      {/* Stage */}
      <div
        ref={stageRef}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onDoubleClick={onDoubleClick}
        className={cn(
          'relative min-h-0 flex-1 touch-none overflow-hidden bg-[#07070a] outline-none',
          dragging ? 'cursor-grabbing' : 'cursor-grab',
          'focus-visible:ring-1 focus-visible:ring-primary/50'
        )}
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03), transparent 70%)',
        }}
      >
        {/* subtle grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="absolute left-1/2 top-1/2 h-0 w-0">
          <div
            className={cn('absolute', !dragging && 'transition-transform duration-100 ease-out')}
            style={{
              width: natural.w || undefined,
              height: natural.h || undefined,
              left: -(natural.w || 0) / 2,
              top: -(natural.h || 0) / 2,
              transform: `translate(${t.x}px, ${t.y}px) scale(${scale})`,
              transformOrigin: 'center center',
            }}
          >
            <img
              src={slide.src}
              alt={slide.title}
              draggable={false}
              onLoad={(e) => {
                const el = e.currentTarget
                setNatural({ w: el.naturalWidth, h: el.naturalHeight })
                setLoaded(true)
              }}
              onError={() => setError(true)}
              className={cn(
                'h-full w-full select-none object-contain',
                loaded ? 'opacity-100' : 'opacity-0'
              )}
            />
            <AnnotationLayer
              annotations={annotations}
              scale={scale}
              width={natural.w}
              height={natural.h}
              visible={showLabels}
              activeLabel={activeLabel}
              onHover={setActiveLabel}
            />
          </div>
        </div>

        {/* reticle */}
        {showReticle && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="absolute h-full w-px bg-primary/30" />
            <div className="absolute h-px w-full bg-primary/30" />
            <div className="h-16 w-16 rounded-full border border-primary/40" />
          </div>
        )}

        {/* vignette */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ boxShadow: 'inset 0 0 120px 30px rgba(0,0,0,0.55)' }}
        />

        {/* loading / error */}
        {!loaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#07070a]/80">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-faint">
            <ImageOff className="h-6 w-6" />
            <span className="text-xs">Image indisponible</span>
          </div>
        )}

        {/* zoom badge */}
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-md border border-border bg-black/60 px-2 py-1 font-mono text-[10px] text-muted backdrop-blur">
          {zoomPct}% · ×{scale.toFixed(2)} écran
        </div>
        {natural.w > 0 && (
          <div className="pointer-events-none absolute bottom-3 right-3 rounded-md border border-border bg-black/60 px-2 py-1 font-mono text-[10px] text-muted backdrop-blur">
            {natural.w}×{natural.h} px
          </div>
        )}
      </div>
    </div>
  )
}
