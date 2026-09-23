import * as React from 'react'

/**
 * A single requestAnimationFrame clock that drives every physiology
 * visualization. It exposes a normalized `phase` in [0, 1) that loops over the
 * real cycle duration taken from the course (e.g. 0.8 s for the cardiac cycle,
 * ~4.5 s for the respiratory cycle), plus transport controls.
 *
 * The loop reads its parameters from refs, so toggling play / speed / slow-mo
 * never restarts it and never drops a frame.
 */
export interface UsePhysioClockOptions {
  /** Real duration of one cycle, in seconds (must come from the course). */
  cycleSeconds: number
  autoplay?: boolean
  /** Speed multiplier applied when slow motion is engaged. */
  slowMoFactor?: number
}

export interface PhysioClock {
  /** Elapsed seconds within the current cycle, [0, cycleSeconds). */
  t: number
  /** Normalized progress through the cycle, [0, 1). */
  phase: number
  playing: boolean
  speed: number
  slowMo: boolean
  play: () => void
  pause: () => void
  toggle: () => void
  reset: () => void
  setSpeed: (s: number) => void
  toggleSlowMo: () => void
  /** Jump to an arbitrary normalized position (used by the scrubber). */
  seekPhase: (p: number) => void
}

export function usePhysioClock({
  cycleSeconds,
  autoplay = true,
  slowMoFactor = 0.25,
}: UsePhysioClockOptions): PhysioClock {
  const [t, setT] = React.useState(0)
  const [playing, setPlaying] = React.useState(autoplay)
  const [speed, setSpeedState] = React.useState(1)
  const [slowMo, setSlowMo] = React.useState(false)

  const tRef = React.useRef(0)
  const rafRef = React.useRef<number | null>(null)
  const lastRef = React.useRef<number | null>(null)
  const playingRef = React.useRef(playing)
  const speedRef = React.useRef(speed)
  const slowMoRef = React.useRef(slowMo)
  const cycleRef = React.useRef(cycleSeconds)

  playingRef.current = playing
  speedRef.current = speed
  slowMoRef.current = slowMo
  cycleRef.current = cycleSeconds > 0 ? cycleSeconds : 1

  React.useEffect(() => {
    if (!playing) {
      lastRef.current = null
      return
    }
    const step = (now: number) => {
      if (lastRef.current == null) lastRef.current = now
      // Clamp large gaps (tab was backgrounded) so the animation never jumps.
      const dt = Math.min(0.05, (now - lastRef.current) / 1000)
      lastRef.current = now
      const eff = slowMoRef.current ? slowMoFactor : speedRef.current
      const cyc = cycleRef.current
      tRef.current = (tRef.current + dt * eff) % cyc
      setT(tRef.current)
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      lastRef.current = null
    }
  }, [playing, slowMoFactor])

  const seek = (seconds: number) => {
    const cyc = cycleRef.current
    const wrapped = ((seconds % cyc) + cyc) % cyc
    tRef.current = wrapped
    setT(wrapped)
  }

  return {
    t,
    phase: t / cycleRef.current,
    playing,
    speed,
    slowMo,
    play: () => setPlaying(true),
    pause: () => setPlaying(false),
    toggle: () => setPlaying((p) => !p),
    reset: () => seek(0),
    setSpeed: (s: number) => {
      setSpeedState(s)
      setSlowMo(false)
    },
    toggleSlowMo: () => setSlowMo((m) => !m),
    seekPhase: (p: number) => seek(p * cycleRef.current),
  }
}
