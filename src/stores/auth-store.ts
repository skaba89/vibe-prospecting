import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  name: string | null
  company: string | null
  avatar: string | null
  credits: number
  plan: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  updateCredits: (credits: number) => void
  logout: () => void
  
  // API Actions
  login: (email: string, password: string) => Promise<boolean>
  signup: (email: string, password: string, name: string, company?: string) => Promise<boolean>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      updateCredits: (credits) => set((state) => ({
        user: state.user ? { ...state.user, credits } : null
      })),
      logout: () => {
        set({ user: null, isAuthenticated: false, error: null })
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'login', email, password })
          })
          
          const data = await response.json()
          
          if (!response.ok) {
            set({ error: data.error || 'Login failed', isLoading: false })
            return false
          }
          
          set({ user: data.user, isAuthenticated: true, isLoading: false })
          return true
        } catch (error) {
          set({ error: 'Network error. Please try again.', isLoading: false })
          return false
        }
      },

      signup: async (email, password, name, company) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'signup', email, password, name, company })
          })
          
          const data = await response.json()
          
          if (!response.ok) {
            set({ error: data.error || 'Signup failed', isLoading: false })
            return false
          }
          
          set({ user: data.user, isAuthenticated: true, isLoading: false })
          return true
        } catch (error) {
          set({ error: 'Network error. Please try again.', isLoading: false })
          return false
        }
      },

      checkAuth: async () => {
        try {
          const response = await fetch('/api/auth')
          const data = await response.json()
          
          if (response.ok && data.user) {
            set({ user: data.user, isAuthenticated: true })
          } else {
            set({ user: null, isAuthenticated: false })
          }
        } catch (error) {
          set({ user: null, isAuthenticated: false })
        }
      }
    }),
    {
      name: 'vibe-auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
)
