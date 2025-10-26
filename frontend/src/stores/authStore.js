import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.post('/auth/login', { email, password })
          const { user, token } = response.data
          console.log('Login successful:', { user, hasToken: !!token })
          set({ user, token, isLoading: false })
          return { success: true }
        } catch (error) {
          console.error('Login error:', error.response?.data || error)
          const errorMessage = error.response?.data?.error?.message || 'Login failed'
          set({ error: errorMessage, isLoading: false })
          return { success: false, error: errorMessage }
        }
      },

      signup: async (email, password, name) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.post('/auth/signup', { email, password, name })
          const { user, token } = response.data
          set({ user, token, isLoading: false })
          return { success: true }
        } catch (error) {
          const errorMessage = error.response?.data?.error?.message || 'Signup failed'
          set({ error: errorMessage, isLoading: false })
          return { success: false, error: errorMessage }
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout')
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          set({ user: null, token: null, error: null })
        }
      },

      checkAuth: async () => {
        const { token } = get()
        console.log('checkAuth called, token exists:', !!token)
        if (!token) {
          set({ isLoading: false })
          return
        }

        set({ isLoading: true })
        try {
          const response = await api.get('/auth/me')
          console.log('Auth verified, user:', response.data)
          set({ user: response.data, isLoading: false })
        } catch (error) {
          console.error('Auth check failed:', error)
          set({ user: null, token: null, isLoading: false })
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
)

export { useAuthStore }

