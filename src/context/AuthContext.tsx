import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { User } from '../types'
import { api, ApiError } from '../api/client'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
}

interface AuthResponse {
  token: string
  user: User
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const STORAGE_KEY = 'finguard.session'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // On mount, restore the session from a stored token by re-validating it
  // against the API rather than trusting stale localStorage data.
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      setIsLoading(false)
      return
    }
    api
      .get<{ user: User }>('/auth/me')
      .then(({ user }) => setUser(user))
      .catch(() => localStorage.removeItem(STORAGE_KEY))
      .finally(() => setIsLoading(false))
  }, [])

  function persistSession(res: AuthResponse) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(res))
    setUser(res.user)
  }

  async function login(email: string, password: string) {
    const res = await api.post<AuthResponse>('/auth/login', { email, password })
    persistSession(res)
  }

  async function signup(name: string, email: string, password: string) {
    const res = await api.post<AuthResponse>('/auth/register', { name, email, password })
    persistSession(res)
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  function updateUser(nextUser: User) {
    setUser(nextUser)
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const session = JSON.parse(raw)
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...session, user: nextUser }))
      } catch {
        // ignore corrupt session, next reload will re-fetch from /auth/me
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, signup, logout, setUser: updateUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export { ApiError }
