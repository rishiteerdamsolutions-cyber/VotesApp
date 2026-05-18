import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuthStore } from '../store/authStore'
import { apiPost, apiGet } from '../api/client'
import { getDeviceId } from '../utils/deviceId'
import { bootstrapDivision } from '../sync/syncService'

export function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [needsSetup, setNeedsSetup] = useState(false)
  const navigate = useNavigate()
  const { setSession, user, hydrate } = useAuthStore()

  useEffect(() => {
    hydrate()
    apiGet<{ hasAdmin: boolean }>('/api/auth/check')
      .then((r) => setNeedsSetup(!r.hasAdmin))
      .catch(() => setNeedsSetup(true))
  }, [hydrate])

  useEffect(() => {
    if (needsSetup) {
      navigate('/setup-admin', { replace: true })
      return
    }
    if (user?.role === 'superadmin') navigate('/admin', { replace: true })
    if (user?.role === 'representative') navigate('/rep', { replace: true })
  }, [user, needsSetup, navigate])

  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await apiPost<{
        token: string
        user: {
          userId: number
          role: 'superadmin' | 'representative'
          divisionId: number | null
          constituencyId: number | null
          name: string
          username: string
        }
      }>('/api/auth/login', {
        username,
        password,
        deviceId: getDeviceId(),
      })
      setSession(
        {
          ...res.user,
          expiresAt: Date.now() + 8 * 60 * 60 * 1000,
        },
        res.token
      )
      if (res.user.role === 'representative' && res.user.divisionId) {
        await bootstrapDivision(res.user.divisionId)
      }
      navigate(res.user.role === 'superadmin' ? '/admin' : '/rep')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  if (needsSetup) {
    return null
  }

  return (
    <div className="min-h-screen bg-primary-xlight flex flex-col items-center justify-center px-6 max-w-[480px] mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white text-3xl mb-4">
        🗳
      </div>
      <h1 className="text-2xl font-bold text-primary-dark">VoterMap</h1>
      <p className="text-gray-600 text-sm mb-8">Election Management System</p>
      <form onSubmit={login} className="w-full">
        <Input
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <Button type="submit" fullWidth disabled={loading}>
          {loading ? 'Signing in…' : 'Login'}
        </Button>
      </form>
    </div>
  )
}
