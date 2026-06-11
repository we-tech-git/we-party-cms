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

function setAuthCookie(token: string) {
  // JWT só usa Base64URL + pontos — não precisa de encoding.
  // O proxy.ts lê este cookie no edge para proteger rotas /cms/*.
  document.cookie = `access_token=${token}; path=/; SameSite=Lax`
}

function clearAuthCookie() {
  document.cookie = 'access_token=; path=/; max-age=0; SameSite=Lax'
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,

      saveAuthData(response: LoginResponse) {
        const { token, ...user } = response.data
        set({ token, user })
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token)
          localStorage.setItem(STORAGE_KEYS.LOGGED_USER, JSON.stringify(user))
          setAuthCookie(token)
        }
      },

      logout() {
        set({ token: null, user: null })
        if (typeof window !== 'undefined') {
          Object.values(STORAGE_KEYS).forEach((key) =>
            localStorage.removeItem(key),
          )
          clearAuthCookie()
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
