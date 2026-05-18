import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id ?? label.replace(/\s/g, '-').toLowerCase()
  return (
    <div className={`mb-3 ${className}`}>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-800 mb-1">
        {label}
      </label>
      <input
        id={inputId}
        aria-label={label}
        className="w-full min-h-11 px-3 rounded-lg border border-primary-light focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
        {...props}
      />
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  )
}
