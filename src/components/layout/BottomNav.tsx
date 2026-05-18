import { NavLink } from 'react-router-dom'

export function BottomNav({
  items,
}: {
  items: { to: string; label: string; icon: string }[]
}) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-[480px] bg-white border-t border-primary-light flex">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-2 text-xs min-h-11 ${
              isActive ? 'text-primary font-semibold' : 'text-gray-500'
            }`
          }
        >
          <span className="text-lg" aria-hidden>
            {item.icon}
          </span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
