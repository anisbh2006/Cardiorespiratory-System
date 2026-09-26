import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, GraduationCap, Heart, Menu, X } from 'lucide-react'
import { disciplines } from '@/data/disciplines'
import { getDisciplineIcon } from '@/data/icons'
import { SearchOverlay } from './SearchOverlay'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/context/LanguageContext'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

const navLinks = [
  { to: '/anatomy', labelKey: 'nav.anatomy' },
  { to: '/histologie', labelKey: 'nav.histology' },
  { to: '/biophysique', labelKey: 'nav.biophysics' },
  { to: '/physiologie', labelKey: 'nav.physiology' },
]

const navLinkClass = (isActive: boolean) =>
  cn(
    'relative rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200',
    "after:absolute after:inset-x-3 after:bottom-1 after:h-px after:origin-center after:bg-primary after:transition-transform after:duration-300 after:ease-out",
    isActive
      ? 'text-foreground after:scale-x-100'
      : 'text-muted hover:text-foreground after:scale-x-0'
  )

function DisciplinesDropdown() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const { t } = useLanguage()
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
          'flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer',
          isDisciplineRoute ? 'text-foreground' : 'text-muted hover:text-foreground'
        )}
      >
        {t('nav.disciplines')}
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 transition-transform duration-200',
            open && 'rotate-180'
          )}
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
  const [scrolled, setScrolled] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 glass-strong transition-[border-color,box-shadow] duration-300',
        scrolled
          ? 'border-b border-border/80 shadow-[0_4px_24px_rgba(0,0,0,0.35)]'
          : 'border-b border-transparent'
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 transition-colors group-hover:bg-primary/25">
            <Heart className="h-4 w-4 text-primary" fill="currentColor" />
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-sm font-semibold tracking-tight text-foreground">
              {t('app.brand')}
            </span>
            <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-faint">
              {t('app.subtitle')}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex">
          <NavLink to="/" end className={({ isActive }) => navLinkClass(isActive)}>
            {t('nav.home')}
          </NavLink>
          <DisciplinesDropdown />
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => navLinkClass(isActive)}
            >
              {t(link.labelKey)}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <SearchOverlay />
          <LanguageSwitcher />
          <NavLink
            to="/study"
            className="hidden h-9 items-center gap-1.5 rounded-md border border-border bg-elevated px-3 text-sm font-medium text-muted transition-colors hover:border-primary/50 hover:text-foreground md:flex"
          >
            <GraduationCap className="h-3.5 w-3.5" />
            {t('nav.study')}
          </NavLink>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-elevated hover:text-foreground md:hidden cursor-pointer"
            aria-label={t('nav.menu')}
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
                {t('nav.home')}
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
                  {t(link.labelKey)}
                </Link>
              ))}
              <Link
                to="/study"
                onClick={() => setMobileOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-medium text-primary"
              >
                {t('nav.study')}
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
