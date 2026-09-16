import { HTMLAttributes } from 'react'
import { clsx } from 'clsx'

type BadgeVariant = 'default' | 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'outline'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  dot?: boolean
}

const variants: Record<BadgeVariant, string> = {
  default:  'bg-subtle text-text-secondary',
  primary:  'bg-primary-100 text-primary-700',
  accent:   'bg-accent-100 text-accent-700',
  success:  'bg-accent-100 text-accent-700',
  warning:  'bg-warning-light text-warning border border-warning-border',
  danger:   'bg-danger-light text-danger border border-danger-border',
  outline:  'bg-surface text-text-secondary border border-border-base',
}

const dotColors: Record<BadgeVariant, string> = {
  default:  'bg-text-disabled',
  primary:  'bg-primary-700',
  accent:   'bg-accent-500',
  success:  'bg-accent-500',
  warning:  'bg-warning',
  danger:   'bg-danger',
  outline:  'bg-text-muted',
}

export function Badge({ variant = 'default', dot = false, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5',
        'text-xs font-medium px-2 py-0.5 rounded-xs',
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', dotColors[variant])} />
      )}
      {children}
    </span>
  )
}
