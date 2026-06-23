'use client'

/**
 * Guard de acesso da área administrativa (/cms/admin/*). Por enquanto o painel
 * de controle só é liberado para usuários com a função `admin`; os demais são
 * redirecionados para a home do CMS.
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useIsAdmin } from '@/hooks/use-is-admin'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAdmin, isLoading } = useIsAdmin()

  // Evita mismatch de hidratação: só decidimos após montar no cliente, quando o
  // estado persistido (zustand) já foi reidratado do localStorage.
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    // One-time flag flip after mount so SSR and first client render match.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  // Só redireciona quando já resolvemos o papel (sem fetch pendente).
  const resolved = mounted && !isLoading
  useEffect(() => {
    if (resolved && !isAdmin) router.replace('/cms/home')
  }, [resolved, isAdmin, router])

  if (!resolved) return null

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <span className="w-14 h-14 rounded-full grid place-items-center" style={{ background: '#FEE2E2', color: '#DC2626' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 018 0v3" /></svg>
        </span>
        <p className="text-[15px] font-extrabold" style={{ fontFamily: 'var(--font-bricolage)' }}>Acesso restrito</p>
        <p className="text-[13.5px] font-medium" style={{ color: 'var(--wp-muted)' }}>Esta área é exclusiva para administradores. Redirecionando…</p>
      </div>
    )
  }

  return <>{children}</>
}
