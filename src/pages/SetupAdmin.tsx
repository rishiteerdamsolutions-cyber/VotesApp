import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { apiPost } from '../api/client'

export function SetupAdmin() {
  const [password, setPassword] = useState('1KTR@1')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const setup = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiPost('/api/auth/setup-admin', { password })
      navigate('/login')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Setup failed'
      setError(
        msg.includes('Failed to fetch') || msg.includes('NetworkError')
          ? 'Cannot reach API. Run npm run dev (needs API on port 3001).'
          : msg
      )
    }
  }

  return (
    <div className="min-h-screen bg-primary-xlight flex flex-col items-center justify-center px-6 max-w-[480px] mx-auto">
      <h1 className="text-xl font-bold text-primary mb-2">Setup Super Admin</h1>
      <p className="text-sm text-gray-600 mb-6 text-center">
        First-time setup. Default username: <strong>admin</strong>
      </p>
      <form onSubmit={setup} className="w-full">
        <Input
          label="Admin password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <Button type="submit" fullWidth>
          Create admin
        </Button>
      </form>
    </div>
  )
}
