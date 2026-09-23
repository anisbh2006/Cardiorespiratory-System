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
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 text-xs text-faint sm:flex-row">
          <span className="flex items-center gap-1.5">
            <Heart className="h-3 w-3 text-primary" />
            UEI / VEI 01 — Cardiorespiratory System and Hematopoietic Organs
          </span>
          <span>Plateforme d'apprentissage pour étudiants en médecine</span>
        </div>
      </footer>
    </div>
  )
}
