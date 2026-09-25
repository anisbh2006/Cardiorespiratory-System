import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-white hover:bg-primary-hover shadow-[0_1px_2px_rgba(0,0,0,0.4),0_0_0_1px_rgba(224,36,58,0.15)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.45),0_0_16px_rgba(224,36,58,0.18)]',
        secondary:
          'bg-elevated text-foreground border border-border-strong hover:bg-overlay hover:border-muted/40',
        ghost: 'hover:bg-elevated hover:text-foreground text-muted',
        outline:
          'border border-border-strong bg-transparent text-foreground hover:bg-elevated hover:border-primary/50',
        link: 'text-primary underline-offset-4 hover:underline active:translate-y-0',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-md px-6 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
)
Button.displayName = 'Button'

export { Button, buttonVariants }
