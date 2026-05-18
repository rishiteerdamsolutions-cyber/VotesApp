import { Outlet, Navigate } from 'react-router-dom'
import { BottomNav } from '../../components/layout/BottomNav'
import { useAuthStore } from '../../store/authStore'

const nav = [
  { to: '/rep', label: 'Home', icon: '🏠' },
  { to: '/rep/add', label: 'Add', icon: '➕' },
  { to: '/rep/voters', label: 'List', icon: '📋' },
  { to: '/rep/search', label: 'Search', icon: '🔍' },
]

export function RepLayout() {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'representative') return <Navigate to="/admin" replace />
  return (
    <>
      <Outlet />
      <BottomNav items={nav} />
    </>
  )
}
