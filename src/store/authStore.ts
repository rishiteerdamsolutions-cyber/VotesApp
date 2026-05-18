import { create } from 'zustand'
import type { SessionUser } from '../types'

const SESSION_KEY = 'voterMap_session'

interface AuthState {
  user: SessionUser | null
  token: string | null
  /** False until localStorage session has been read (avoids /admin → /login flash). */
  ready: boolean
  setSession: (user: SessionUser, token: string) => void
  logout: () => void
  hydrate: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  ready: false,
  hydrate: () => {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) {
      set({ user: null, token: null, ready: true })
      return
    }
    try {
      const parsed = JSON.parse(raw) as SessionUser & { token: string }
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        localStorage.removeItem(SESSION_KEY)
        set({ user: null, token: null, ready: true })
        return
      }
      set({ user: parsed, token: parsed.token, ready: true })
    } catch {
      localStorage.removeItem(SESSION_KEY)
      set({ user: null, token: null, ready: true })
    }
  },
  setSession: (user, token) => {
    const withExpiry = { ...user, token, expiresAt: Date.now() + 8 * 60 * 60 * 1000 }
    localStorage.setItem(SESSION_KEY, JSON.stringify(withExpiry))
    set({ user: withExpiry, token })
  },
  logout: () => {
    localStorage.removeItem(SESSION_KEY)
    set({ user: null, token: null, ready: true })
  },
}))

// Restore session before route guards run (direct /admin or refresh).
useAuthStore.getState().hydrate()
