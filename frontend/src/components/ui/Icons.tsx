import { SVGAttributes } from 'react'

type IconProps = SVGAttributes<SVGElement> & { className?: string }

export const Icons = {
  Grid: ({ className, ...props }: IconProps) => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden {...props}>
      <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1" />
      <rect x="9" y="1.5" width="5.5" height="5.5" rx="1" />
      <rect x="1.5" y="9" width="5.5" height="5.5" rx="1" />
      <rect x="9" y="9" width="5.5" height="5.5" rx="1" />
    </svg>
  ),

  Users: ({ className, ...props }: IconProps) => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden {...props}>
      <circle cx="5.5" cy="5" r="2.5" />
      <path d="M1 13.5c0-2.49 2.01-4.5 4.5-4.5s4.5 2.01 4.5 4.5" />
      <path d="M11.5 5.5a2 2 0 0 1 0 4" />
      <path d="M14 13.5a4 4 0 0 0-3-3.87" />
    </svg>
  ),

  Calendar: ({ className, ...props }: IconProps) => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden {...props}>
      <rect x="1.5" y="2.5" width="13" height="12" rx="1.5" />
      <path d="M1.5 6.5h13" />
      <path d="M5 1.5v2M11 1.5v2" />
      <circle cx="5" cy="10" r=".75" fill="currentColor" stroke="none" />
      <circle cx="8" cy="10" r=".75" fill="currentColor" stroke="none" />
      <circle cx="11" cy="10" r=".75" fill="currentColor" stroke="none" />
    </svg>
  ),

  Table: ({ className, ...props }: IconProps) => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden {...props}>
      <rect x="1.5" y="1.5" width="13" height="13" rx="1.5" />
      <path d="M1.5 6h13M1.5 10h13M6 1.5v13" />
    </svg>
  ),

  CreditCard: ({ className, ...props }: IconProps) => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden {...props}>
      <rect x="1" y="3.5" width="14" height="9" rx="1.5" />
      <path d="M1 7h14M4 10.5h2.5M10 10.5h2" />
    </svg>
  ),

  Settings: ({ className, ...props }: IconProps) => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden {...props}>
      <circle cx="8" cy="8" r="2.5" />
      <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M2.93 2.93l1.06 1.06M12.01 12.01l1.06 1.06M13.07 2.93l-1.06 1.06M3.99 12.01l-1.06 1.06" />
    </svg>
  ),

  Shield: ({ className, ...props }: IconProps) => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden {...props}>
      <path d="M8 1.5L2 4v4c0 3.31 2.67 6.41 6 7 3.33-.59 6-3.69 6-7V4L8 1.5z" />
    </svg>
  ),

  LogOut: ({ className, ...props }: IconProps) => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden {...props}>
      <path d="M10.5 5.5l3 2.5-3 2.5" />
      <path d="M13.5 8H6.5" />
      <path d="M6.5 13.5H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h3.5" />
    </svg>
  ),

  ChevronRight: ({ className, ...props }: IconProps) => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden {...props}>
      <path d="M6 4l4 4-4 4" />
    </svg>
  ),
}
