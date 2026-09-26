import * as React from 'react'
import { Check, ChevronDown, Globe } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/context/LanguageContext'

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage()
  const [open, setOpen] = React.useState(false)

  const options = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' },
  ] as const

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={t('language.switcherLabel')}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-md border border-border bg-elevated px-2.5 py-1.5 text-sm text-muted transition-colors hover:border-border-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer"
      >
        <Globe className="h-3.5 w-3.5 text-primary" />
        <span className="hidden sm:inline">{language.toUpperCase()}</span>
        <span className="sm:hidden">{language === 'en' ? 'EN' : 'FR'}</span>
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-40 rounded-xl border border-border-strong bg-surface/95 p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.45)] backdrop-blur-md"
          >
            {options.map((option) => {
              const active = language === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  onClick={() => {
                    setLanguage(option.value)
                    setOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors cursor-pointer',
                    active ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-elevated hover:text-foreground'
                  )}
                >
                  <span>{option.label}</span>
                  {active && <Check className="h-3.5 w-3.5" />}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
