import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { TopBar } from '@/components/layout/TopBar'
import { Heart } from 'lucide-react'

export function AppLayout() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-background noise-bg">
      <TopBar />
      <AnimatePresence mode="wait">
        <motion.main
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
            <span className="text-muted">UEI / VEI 01</span>
            <span className="hidden h-3 w-px bg-border sm:block" />
            <span className="hidden sm:block">
              Cardiorespiratory System and Hematopoietic Organs
            </span>
          </span>
          <span className="text-faint">Plateforme d'apprentissage pour étudiants en médecine</span>
        </div>
      </footer>
    </div>
  )
}
