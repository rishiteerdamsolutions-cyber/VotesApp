import type { ReactNode } from 'react'

export function PageWrapper({
  children,
  title,
  action,
}: {
  children: ReactNode
  title?: string
  action?: ReactNode
}) {
  return (
    <div className="min-h-screen bg-primary-xlight mx-auto max-w-[480px] shadow-xl">
      {(title || action) && (
        <header className="sticky top-0 z-40 bg-primary text-white px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold truncate">{title}</h1>
          {action}
        </header>
      )}
      <main className="pb-20 px-4 pt-4">{children}</main>
    </div>
  )
}
