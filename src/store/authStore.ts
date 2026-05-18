import { create } from 'zustand'
import type { SessionUser } from '../types'

const SESSION_KEY = 'voterMap_session'

interface AuthState {
  user: SessionUser | null
  token: string | null
  setSession: (user: SessionUser, token: string) => void
  logout: () => void
  hydrate: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  hydrate: () => {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw) as SessionUser & { token: string }
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        localStorage.removeItem(SESSION_KEY)
        return
      }
      set({ user: parsed, token: parsed.token })
    } catch {
      localStorage.removeItem(SESSION_KEY)
    }
  },
  setSession: (user, token) => {
    const withExpiry = { ...user, token, expiresAt: Date.now() + 8 * 60 * 60 * 1000 }
    localStorage.setItem(SESSION_KEY, JSON.stringify(withExpiry))
    set({ user: withExpiry, token })
  },
  logout: () => {
    localStorage.removeItem(SESSION_KEY)
    set({ user: null, token: null })
  },
}))
