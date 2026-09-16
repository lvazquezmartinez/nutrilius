import { forwardRef, InputHTMLAttributes, ReactNode } from 'react'
import { clsx } from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, leadingIcon, trailingIcon, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leadingIcon && (
            <span className="absolute left-3 text-text-muted">{leadingIcon}</span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={clsx(
              'w-full h-9 rounded border bg-surface text-sm text-text-primary',
              'placeholder:text-text-disabled',
              'transition-colors duration-fast',
              'focus:outline-none focus:ring-2 focus:ring-primary-700 focus:ring-offset-0 focus:border-primary-700',
              error
                ? 'border-danger focus:ring-danger'
                : 'border-border-base hover:border-border-strong',
              leadingIcon  ? 'pl-9'  : 'pl-3',
              trailingIcon ? 'pr-9'  : 'pr-3',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-subtle',
              className
            )}
            {...props}
          />

          {trailingIcon && (
            <span className="absolute right-3 text-text-muted">{trailingIcon}</span>
          )}
        </div>

        {error && (
          <p className="text-xs text-danger">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-text-muted">{hint}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
