import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { TopBar } from '@/components/layout/TopBar'
import { Heart } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export function AppLayout() {
  const location = useLocation()
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-background noise-bg">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:border focus:border-primary/50 focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:text-foreground"
      >
        {t('app.skipToContent')}
      </a>
      <TopBar />
      <AnimatePresence mode="wait">
        <motion.main
          id="contenu"
          key={location.pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <footer className="border-t border-border py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-xs text-faint sm:flex-row">
          <span className="flex items-center gap-2">
            <Heart className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted">{t('app.subtitle')}</span>
            <span className="hidden h-3 w-px bg-border sm:block" />
            <span className="hidden sm:block">{t('app.footerAlt')}</span>
          </span>
          <span className="text-faint">{t('app.footer')}</span>
        </div>
      </footer>
    </div>
  )
}
