import { MoonStar, SunMedium } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/context/ThemeContext'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      className={cn(
        'inline-flex h-9 items-center justify-center gap-1.5 rounded-md border px-2.5 text-sm font-medium transition-all duration-200 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        isDark
          ? 'border-border bg-elevated text-foreground hover:border-border-strong hover:text-foreground'
          : 'border-border bg-surface text-foreground hover:border-border-strong hover:text-foreground'
      )}
    >
      <span className="flex h-4 w-4 items-center justify-center" aria-hidden="true">
        {isDark ? <SunMedium className="h-3.5 w-3.5 text-primary" /> : <MoonStar className="h-3.5 w-3.5 text-primary" />}
      </span>
      <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
    </button>
  )
}
