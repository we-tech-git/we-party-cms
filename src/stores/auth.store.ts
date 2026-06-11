'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LoggedUser, LoginResponse } from '@/types/auth.types'
import { STORAGE_KEYS } from '@/types/auth.types'

interface AuthState {
  token: string | null
  user: LoggedUser | null

  saveAuthData: (response: LoginResponse) => void
  logout: () => void
  hasRole: (role: string) => boolean
  hasAnyRole: (roles: string[]) => boolean
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,

      saveAuthData(response: LoginResponse) {
        const { token, ...user } = response.data
        set({ token, user })
        // espelho no localStorage para o interceptor axios e middleware
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token)
          localStorage.setItem(STORAGE_KEYS.LOGGED_USER, JSON.stringify(user))
        }
      },

      logout() {
        set({ token: null, user: null })
        if (typeof window !== 'undefined') {
          Object.values(STORAGE_KEYS).forEach((key) =>
            localStorage.removeItem(key),
          )
        }
      },

      isAuthenticated() {
        return !!(get().token && get().user)
      },

      hasRole(role: string) {
        return get().user?.roles?.includes(role) ?? false
      },

      hasAnyRole(roles: string[]) {
        const userRoles = get().user?.roles ?? []
        return roles.some((r) => userRoles.includes(r))
      },
    }),
    {
      name: 'we-party-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
)
