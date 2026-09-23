import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, GraduationCap, Heart, Menu, X } from 'lucide-react'
import { disciplines } from '@/data/disciplines'
import { getDisciplineIcon } from '@/data/icons'
import { SearchOverlay } from './SearchOverlay'
import { cn } from '@/lib/utils'

const navLinks = [
  { to: '/anatomy', label: 'Anatomie 3D' },
  { to: '/histologie', label: 'Histologie' },
  { to: '/biophysique', label: 'Biophysique' },
  { to: '/physiologie', label: 'Physiologie' },
]

function DisciplinesDropdown() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const isDisciplineRoute = location.pathname.startsWith('/discipline')

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer',
          isDisciplineRoute
            ? 'text-primary'
            : 'text-muted hover:text-foreground'
        )}
      >
        Disciplines
        <ChevronDown
          className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-50 w-72 pt-2"
          >
            <div className="glass-strong overflow-hidden rounded-xl p-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
              {disciplines.map((d) => {
                const Icon = getDisciplineIcon(d.icon)
                return (
                  <Link
                    key={d.id}
                    to={`/discipline/${d.slug}`}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
                      location.pathname === `/discipline/${d.slug}`
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted hover:bg-elevated hover:text-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{d.titleFr}</span>
                      <span className="block truncate text-xs text-faint">{d.titleEn}</span>
                    </span>
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function TopBar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-40 glass-strong">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 transition-colors group-hover:bg-primary/25">
            <Heart className="h-4 w-4 text-primary" fill="currentColor" />
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-sm font-semibold tracking-tight text-foreground">
              Cardiorespiratory System
            </span>
            <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-faint">
              UEI / VEI 01
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted hover:text-foreground'
              )
            }
          >
            Accueil
          </NavLink>
          <DisciplinesDropdown />
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted hover:text-foreground'
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <SearchOverlay />
          <NavLink
            to="/study"
            className="hidden h-9 items-center gap-1.5 rounded-md border border-border bg-elevated px-3 text-sm font-medium text-muted transition-colors hover:border-primary/50 hover:text-foreground md:flex"
          >
            <GraduationCap className="h-3.5 w-3.5" />
            Mon étude
          </NavLink>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-elevated hover:text-foreground md:hidden cursor-pointer"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border md:hidden"
          >
            <div className="space-y-0.5 bg-surface px-4 py-3">
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-medium text-muted hover:bg-elevated hover:text-foreground"
              >
                Accueil
              </Link>
              {disciplines.map((d) => (
                <Link
                  key={d.id}
                  to={`/discipline/${d.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-muted hover:bg-elevated hover:text-foreground"
                >
                  {d.titleFr}
                </Link>
              ))}
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-muted hover:bg-elevated hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/study"
                onClick={() => setMobileOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-medium text-primary"
              >
                Mon étude
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
