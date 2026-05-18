import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost'
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  fullWidth,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const base =
    'min-h-11 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50'
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark',
    outline: 'border-2 border-primary text-primary hover:bg-primary-xlight',
    ghost: 'text-primary hover:bg-primary-xlight',
  }
  return (
    <button
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
