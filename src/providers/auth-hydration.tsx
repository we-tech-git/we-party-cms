'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import { writeAuthCookie } from '@/lib/auth-cookie'

/**
 * Garante que o cookie `access_token` exista sempre que o Zustand tiver um
 * token em memória. Necessário porque o Zustand persist usa localStorage
 * (invisível para o proxy/edge) e cookies de sessão são apagados ao fechar
 * o browser, mas o localStorage persiste.
 */
export function AuthHydration() {
  const token = useAuthStore((s) => s.token)

  useEffect(() => {
    if (token) {
      writeAuthCookie(token)
    }
  }, [token])

  return null
}
