import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './components/ui/Toast'
import { useAuthStore } from './store/authStore'
import { Login } from './pages/Login'
import { SetupAdmin } from './pages/SetupAdmin'
import { AdminLayout } from './pages/admin/AdminLayout'
import { Dashboard } from './pages/admin/Dashboard'
import { Setup } from './pages/admin/Setup'
import { Representatives } from './pages/admin/Representatives'
import { Export } from './pages/admin/Export'
import { RepLayout } from './pages/rep/RepLayout'
import { RepHome } from './pages/rep/Home'
import { AddVoter } from './pages/rep/AddVoter'
import { VoterList } from './pages/rep/VoterList'
import { Search } from './pages/rep/Search'

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate)
  useEffect(() => {
    hydrate()
  }, [hydrate])

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/setup-admin" element={<SetupAdmin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="setup" element={<Setup />} />
            <Route path="reps" element={<Representatives />} />
            <Route path="export" element={<Export />} />
          </Route>
          <Route path="/rep" element={<RepLayout />}>
            <Route index element={<RepHome />} />
            <Route path="add" element={<AddVoter />} />
            <Route path="voters" element={<VoterList />} />
            <Route path="search" element={<Search />} />
          </Route>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}
