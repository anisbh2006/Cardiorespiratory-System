/**
 * Small helpers to turn lecturee-described waveform landmarks into SVG paths and
 * to sample them at the current animation phase.
 *
 * The control points are schematic shapes; the *landmarks* (peak timing, phase
 * boundaries, numeric values) come from the lecturee. These helpers only draw and
 * interpolate — they never add physiological data of their own.
 */
export interface WavePoint {
  /** Normalized position within the cycle, [0, 1]. */
  p: number
  /** Value at that position. */
  v: number
}

export interface WaveScale {
  min: number
  max: number
  /** Pixel top of the plot area (value = max). */
  top: number
  /** Pixel bottom of the plot area (value = min). */
  bottom: number
}

export function mapY(v: number, s: WaveScale): number {
  if (s.max === s.min) return s.bottom
  const t = (v - s.min) / (s.max - s.min)
  return s.bottom - t * (s.bottom - s.top)
}

/** Linear interpolation of a cyclic control-point series at `phase`. */
export function sampleWave(ctrl: WavePoint[], phase: number): number {
  const n = ctrl.length
  if (n === 0) return 0
  if (n === 1) return ctrl[0].v
  const p = ((phase % 1) + 1) % 1

  // Find the segment [i, i+1] that contains p, wrapping the last → first.
  let i = n - 1
  for (let k = 0; k < n - 1; k++) {
    if (p >= ctrl[k].p && p < ctrl[k + 1].p) {
      i = k
      break
    }
  }
  const a = ctrl[i]
  const b = ctrl[(i + 1) % n]
  const p0 = a.p
  const p1 = b.p <= a.p ? b.p + 1 : b.p
  const pp = p < p0 ? p + 1 : p
  const span = p1 - p0 || 1
  const t = (pp - p0) / span
  return a.v + (b.v - a.v) * t
}

export interface BuildWavePathOptions extends WaveScale {
  /** Pixel left edge (phase 0). */
  left: number
  /** Pixel right edge (phase 1). */
  right: number
  samples?: number
}

/** Build an SVG path string for a cyclic waveform across the plot area. */
export function buildWavePath(ctrl: WavePoint[], o: BuildWavePathOptions): string {
  const samples = o.samples ?? 240
  const width = o.right - o.left
  let d = ''
  for (let i = 0; i <= samples; i++) {
    const p = i / samples
    const x = o.left + p * width
    const y = mapY(sampleWave(ctrl, p), o)
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)} `
  }
  return d.trim()
}

/** Monotone cubic (Catmull-Rom → bezier) smoothing for open polylines. */
export function smoothPath(pts: { x: number; y: number }[], tension = 0.5): string {
  if (pts.length < 2) return ''
  let d = `M${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    const c1x = p1.x + ((p2.x - p0.x) / 6) * tension * 2
    const c1y = p1.y + ((p2.y - p0.y) / 6) * tension * 2
    const c2x = p2.x - ((p3.x - p1.x) / 6) * tension * 2
    const c2y = p2.y - ((p3.y - p1.y) / 6) * tension * 2
    d += ` C${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
  }
  return d
}
