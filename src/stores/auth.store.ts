'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LoggedUser, LoginResponse } from '@/types/auth.types'
import { STORAGE_KEYS } from '@/types/auth.types'
import { clearAuthCookie, writeAuthCookie } from '@/lib/auth-cookie'

interface AuthState {
  token: string | null
  user: LoggedUser | null

  saveAuthData: (response: LoginResponse) => void
  setProfileImage: (url: string) => void
  logout: () => void
  hasRole: (role: string) => boolean
  hasAnyRole: (roles: string[]) => boolean
  isAuthenticated: () => boolean
}

const SAFE_USER_FIELDS = [
  'id', 'username', 'name', 'email', 'roles', 'role', 'type', 'userType', 'isEmailVerified', 'profileImage',
] as const

function pickSafeUser(raw: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const k of SAFE_USER_FIELDS) if (k in raw) out[k] = raw[k]
  return out
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,

      saveAuthData(response: LoginResponse) {
        const { token, ...rest } = response.data
        // Allowlist: a resposta de login pode trazer campos internos (ex.: googleId, apiKey, tokens de reset).
        // Só o necessário para a UI é persistido em localStorage.
        const user = pickSafeUser(rest as unknown as Record<string, unknown>) as unknown as LoggedUser
        set({ token, user })
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token)
          localStorage.setItem(STORAGE_KEYS.LOGGED_USER, JSON.stringify(user))
          writeAuthCookie(token)
        }
      },

      setProfileImage(url: string) {
        const current = get().user
        if (!current) return
        const updated = { ...current, profileImage: url }
        set({ user: updated })
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.LOGGED_USER, JSON.stringify(updated))
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
