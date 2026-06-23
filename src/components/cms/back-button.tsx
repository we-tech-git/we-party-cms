'use client'

import { useRouter } from 'next/navigation'

/**
 * Botão "Voltar" reutilizável. Usa o histórico do navegador quando há para onde
 * voltar; caso contrário (ex.: acesso direto pela URL) navega para `fallback`.
 */
export function BackButton({ fallback = '/cms/home', label = 'Voltar' }: { fallback?: string; label?: string }) {
  const router = useRouter()

  function handleBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) router.back()
    else router.push(fallback)
  }

  return (
    <button
      onClick={handleBack}
      className="self-start flex items-center gap-1.5 rounded-[12px] pl-2.5 pr-3.5 py-2 text-[13.5px] font-extrabold transition hover:-translate-x-0.5"
      style={{ background: '#fff', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)', color: 'var(--ink-soft)' }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M15 18l-6-6 6-6" /></svg>
      {label}
    </button>
  )
}
