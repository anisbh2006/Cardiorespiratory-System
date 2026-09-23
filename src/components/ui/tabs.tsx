import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TabItem {
  value: string
  label: string
  icon?: React.ReactNode
}

interface TabsProps {
  items: TabItem[]
  value: string
  onValueChange: (value: string) => void
  className?: string
}

export function Tabs({ items, value, onValueChange, className }: TabsProps) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center gap-1 rounded-lg border border-border bg-surface p-1',
        className
      )}
    >
      {items.map((item) => (
        <button
          key={item.value}
          role="tab"
          aria-selected={value === item.value}
          onClick={() => onValueChange(item.value)}
          className={cn(
            'relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer',
            value === item.value ? 'text-white' : 'text-muted hover:text-foreground'
          )}
        >
          {value === item.value && (
            <motion.span
              layoutId="tab-indicator"
              className="absolute inset-0 rounded-md bg-primary/90"
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            {item.icon}
            {item.label}
          </span>
        </button>
      ))}
    </div>
  )
}
