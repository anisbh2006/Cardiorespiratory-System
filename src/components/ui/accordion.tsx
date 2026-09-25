import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AccordionItemProps {
  title: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
}

export function AccordionItem({ title, children, defaultOpen = false, className }: AccordionItemProps) {
  const [open, setOpen] = React.useState(defaultOpen)

  return (
    <div className={cn('rounded-lg border border-border bg-surface', className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-foreground transition-colors duration-200 hover:bg-elevated cursor-pointer rounded-lg"
      >
        <span>{title}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        >
          <ChevronDown className="h-4 w-4 text-muted" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-4 py-3 text-sm text-muted">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
