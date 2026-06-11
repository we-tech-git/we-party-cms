'use client'

import { useAuthStore } from '@/stores/auth.store'
import { GRAD, SHADOW_SM } from '@/lib/brand'

export function CmsTopbar() {
  const user = useAuthStore((s) => s.user)
  const initial = (user?.name ?? 'U')[0].toUpperCase()

  return (
    <header
      className="sticky top-0 z-60 flex items-center gap-[18px] px-[clamp(16px,3vw,34px)] py-[14px]"
      style={{
        background: 'rgba(255,244,247,.78)',
        backdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(34,26,61,.06)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-[11px]"
        style={{ fontFamily: 'var(--font-bricolage)', fontWeight: 800, fontSize: 21, letterSpacing: '.02em' }}
      >
        <span
          className="w-9 h-9 rounded-[11px] grid place-items-center text-white text-[18px]"
          style={{ background: GRAD, boxShadow: SHADOW_SM }}
        >
          🤘
        </span>
        <span>WE&nbsp;</span>
        <span style={{ background: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
          PARTY
        </span>
        <span className="w-px h-[26px] mx-1" style={{ background: 'rgba(34,26,61,.08)' }} />
        <span
          className="text-[16px]"
          style={{ fontWeight: 700, background: 'linear-gradient(120deg,#7C5CFF,#D81B7E)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}
        >
          Espaço do produtor
        </span>
      </div>

      {/* Search pill */}
      <div
        className="ml-auto hidden sm:flex items-center gap-[9px] rounded-[13px] px-[15px] py-[10px] text-[14px] font-medium min-w-[230px]"
        style={{ background: '#fff', border: '1px solid rgba(34,26,61,.08)', color: '#8C85A2', boxShadow: SHADOW_SM }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
          <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
        </svg>
        Buscar nos seus eventos...
      </div>

      {/* Notification bell */}
      <button
        className="relative w-[42px] h-[42px] rounded-[12px] grid place-items-center transition-colors hover:text-[#D81B7E]"
        style={{ background: '#fff', border: '1px solid rgba(34,26,61,.08)', boxShadow: SHADOW_SM }}
        aria-label="Notificações"
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 01-3.4 0" />
        </svg>
        <span className="absolute top-[9px] right-[9px] w-2 h-2 rounded-full border-2 border-white bg-[#D81B7E]" />
      </button>

      {/* User avatar */}
      <div
        className="w-[44px] h-[44px] rounded-[13px] grid place-items-center text-white font-extrabold border-2 border-white"
        style={{ background: 'linear-gradient(135deg,#7b5cff,#c54bff)', boxShadow: SHADOW_SM, fontFamily: 'var(--font-bricolage)' }}
        aria-label={`Avatar de ${user?.name}`}
      >
        {initial}
      </div>
    </header>
  )
}
