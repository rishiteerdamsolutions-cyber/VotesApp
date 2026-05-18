import { Outlet, Navigate } from 'react-router-dom'
import { BottomNav } from '../../components/layout/BottomNav'
import { useAuthStore } from '../../store/authStore'

const nav = [
  { to: '/admin', label: 'Dashboard', icon: '📊' },
  { to: '/admin/setup', label: 'Setup', icon: '⚙️' },
  { to: '/admin/reps', label: 'Reps', icon: '👥' },
  { to: '/admin/export', label: 'Export', icon: '📤' },
]

export function AdminLayout() {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'superadmin') return <Navigate to="/rep" replace />

  return (
  <>
      <Outlet />
      <BottomNav items={nav} />
    </>
  )
}
