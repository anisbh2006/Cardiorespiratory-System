import { Pause, Play, RotateCcw, Timer } from 'lucide-react'
import type { PhysioClock } from './usePhysioClock'
import { cn } from '@/lib/utils'

const SPEEDS = [0.5, 1, 2]

interface TransportControlsProps {
  clock: PhysioClock
  cycleSeconds: number
  className?: string
  /** Optional labelled marks rendered under the scrubber at a phase [0,1]. */
  marks?: { at: number; label: string }[]
  /**
   * Optional override for the time readout, for visualizations whose x-axis is
   * not a real cycle duration (e.g. a membrane potential sweep or a forced
   * expiratory manoeuvre). When omitted the readout shows seconds.
   */
  readout?: string
}

/**
 * Shared transport for every visualization: PLAY / PAUSE / RESET / SLOW MOTION
 * plus speed presets and a scrubbable timeline. The timeline maps to the real
 * cycle duration so the time readout is in the same seconds the lecturee states.
 */
export function TransportControls({
  clock,
  cycleSeconds,
  className,
  marks,
  readout,
}: TransportControlsProps) {
  const { t, phase, playing, speed, slowMo } = clock

  return (
    <div className={cn('space-y-2.5', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={clock.toggle}
          className={cn(
            'inline-flex h-9 items-center gap-2 rounded-md px-3.5 text-sm font-semibold transition-all cursor-pointer',
            playing
              ? 'border border-border-strong bg-elevated text-foreground hover:bg-overlay'
              : 'bg-primary text-white shadow-[0_0_20px_rgba(224,36,58,0.3)] hover:bg-primary-hover'
          )}
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {playing ? 'Pause' : 'Lecture'}
        </button>

        <button
          onClick={clock.reset}
          title="Reset"
          className="inline-flex h-9 items-center gap-2 rounded-md border border-border-strong bg-elevated px-3 text-sm font-medium text-foreground transition-colors hover:bg-overlay cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>

        <button
          onClick={clock.toggleSlowMo}
          title="Slow motion (×0.25)"
          className={cn(
            'inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors cursor-pointer',
            slowMo
              ? 'border-primary/60 bg-primary/15 text-primary'
              : 'border-border-strong bg-elevated text-foreground hover:bg-overlay'
          )}
        >
          <Timer className="h-4 w-4" />
          Slow motion
        </button>

        <div className="ml-auto flex items-center gap-1 rounded-md border border-border bg-surface p-1">
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => clock.setSpeed(s)}
              className={cn(
                'rounded px-2 py-1 font-mono text-[11px] transition-colors cursor-pointer',
                !slowMo && speed === s
                  ? 'bg-primary/20 text-primary'
                  : 'text-muted hover:text-foreground'
              )}
            >
              ×{s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <div className="relative">
          <input
            type="range"
            min={0}
            max={1000}
            value={Math.round(phase * 1000)}
            onChange={(e) => clock.seekPhase(Number(e.target.value) / 1000)}
            aria-label="Position dans le cycle"
            className="w-full cursor-pointer accent-[#e0243a]"
          />
          {marks && (
            <div className="pointer-events-none relative mt-0.5 h-3 w-full">
              {marks.map((m) => (
                <span
                  key={m.label}
                  className="absolute -translate-x-1/2 font-mono text-[9px] text-faint"
                  style={{ left: `${m.at * 100}%` }}
                >
                  {m.label}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between font-mono text-[11px] text-faint">
          <span>
            {readout ??
              `t = ${t.toFixed(2)} s / ${cycleSeconds.toFixed(cycleSeconds < 1 ? 2 : 1)} s`}
          </span>
          <span>{slowMo ? '×0.25 ralenti' : `×${speed}`}</span>
        </div>
      </div>
    </div>
  )
}
