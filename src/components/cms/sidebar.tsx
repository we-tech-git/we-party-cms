'use client'

import Link from 'next/link'
import { GRAD } from '@/lib/brand'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'
import { cn } from '@/lib/utils'

const rootLinks = [
  {
    href: '/cms/home',
    label: 'Início',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" />
      </svg>
    ),
  },
  {
    href: '/cms/producer/new-event',
    label: 'Novo evento',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <rect x="3" y="4" width="18" height="18" rx="3" /><path d="M3 9h18M8 2v4M16 2v4M12 14v3M10.5 15.5h3" />
      </svg>
    ),
  },
  {
    href: '/cms/producer/my-events',
    label: 'Meus eventos',
    badge: '3',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <rect x="3" y="4" width="18" height="18" rx="3" /><path d="M3 9h18M8 2v4M16 2v4" />
      </svg>
    ),
  },
]

const growthLinks = [
  {
    href: '#',
    label: 'Impulsionar',
    placeholder: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M3 17l6-6 4 4 8-8M21 7v5h-5" />
      </svg>
    ),
  },
  {
    href: '#',
    label: 'Insights',
    placeholder: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      </svg>
    ),
  },
  {
    href: '#',
    label: 'Descoberta',
    badge: '#3',
    placeholder: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M12 21s-7-5.5-7-11a7 7 0 0114 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" />
      </svg>
    ),
  },
]

const audienceLinks = [
  {
    href: '#',
    label: 'Audiência',
    placeholder: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <circle cx="9" cy="8" r="3.5" /><path d="M3 21v-1a6 6 0 0112 0v1M16 4.5a3.5 3.5 0 010 7M21 21v-1a6 6 0 00-4-5.7" />
      </svg>
    ),
  },
  {
    href: '#',
    label: 'Engajamento',
    placeholder: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M21 15a4 4 0 01-4 4H8l-5 4V7a4 4 0 014-4h10a4 4 0 014 4z" />
      </svg>
    ),
  },
]

type NavItem = {
  href: string
  label: string
  badge?: string
  placeholder?: boolean
  icon: React.ReactNode
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const baseClass = 'flex items-center gap-[13px] px-4 py-[13px] rounded-[15px] font-bold transition-[color,background,box-shadow]'

  const GRAD = 'linear-gradient(120deg,#FF9D3D 0%,#FF5F8D 52%,#F0309A 100%)'
  const style = active
    ? { background: GRAD, color: '#fff', boxShadow: '0 14px 28px -14px rgba(240,48,154,.65)' }
    : {}

  const hoverClass = active ? '' : 'hover:bg-white hover:text-[var(--ink)]'

  if (item.placeholder) {
    return (
      <span
        className={cn(baseClass, 'text-[var(--ink-soft)] opacity-50 cursor-not-allowed')}
        title={`${item.label} — em breve`}
      >
        <span className="w-[22px] h-[22px] grid place-items-center flex-none">{item.icon}</span>
        <span className="hidden sm:inline">{item.label}</span>
        {item.badge && (
          <span
            className="ml-auto text-[10px] font-extrabold px-2 py-0.5 rounded-[8px]"
            style={{ background: '#EEEAFF', color: 'var(--violet)' }}
          >
            {item.badge}
          </span>
        )}
      </span>
    )
  }

  return (
    <Link
      href={item.href}
      className={cn(baseClass, hoverClass, active ? '' : 'text-[var(--ink-soft)]')}
      style={style}
    >
      <span className="w-[22px] h-[22px] grid place-items-center flex-none">{item.icon}</span>
      <span className="hidden sm:inline">{item.label}</span>
      {item.badge && (
        <span
          className="ml-auto text-[10px] font-extrabold px-2 py-0.5 rounded-[8px]"
          style={
            active
              ? { background: 'rgba(255,255,255,.25)', color: '#fff' }
              : { background: '#EEEAFF', color: 'var(--violet)' }
          }
        >
          {item.badge}
        </span>
      )}
    </Link>
  )
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p
      className="hidden sm:block px-4 pb-1 pt-2 text-[11px] font-extrabold uppercase tracking-[.12em]"
      style={{ color: 'var(--wp-muted)' }}
    >
      {label}
    </p>
  )
}

export function CmsSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()

  function handleLogout() {
    logout()
    router.push('/login')
  }

  return (
    <aside
      className="sticky top-[73px] flex flex-col gap-2 p-3 sm:min-h-[calc(100vh-73px)]"
      style={{ alignSelf: 'start' }}
    >
      {rootLinks.map((item) => (
        <NavLink key={item.href} item={item} active={pathname === item.href} />
      ))}

      <SectionLabel label="Crescimento" />
      {growthLinks.map((item) => (
        <NavLink key={item.label} item={item} active={false} />
      ))}

      <SectionLabel label="Público" />
      {audienceLinks.map((item) => (
        <NavLink key={item.label} item={item} active={false} />
      ))}

      {/* AI Promo card */}
      <div
        className="hidden sm:block mt-2 rounded-[20px] p-[18px] text-white"
        style={{ background: 'linear-gradient(150deg,#2a1340,#4a1f5e)', boxShadow: 'var(--shadow)' }}
      >
        <p className="font-extrabold text-[15px]" style={{ fontFamily: 'var(--font-bricolage)' }}>
          ✨ Impulsione com IA
        </p>
        <p className="text-[12.5px] opacity-80 mt-1.5 mb-3">
          A IA do WeParty escolhe o melhor momento e público pra seu evento aparecer mais na descoberta.
        </p>
        <button
          className="w-full text-white font-extrabold rounded-[12px] py-2.5 text-[13px] transition hover:-translate-y-0.5"
          style={{ background: GRAD }}
        >
          Ativar agora
        </button>
      </div>

      {/* Logout at the bottom */}
      {user && (
        <button
          onClick={handleLogout}
          className="mt-auto text-left text-sm px-4 py-2 rounded-[12px] transition hover:bg-red-50 hover:text-red-600"
          style={{ color: 'var(--wp-muted)' }}
        >
          Sair
        </button>
      )}
    </aside>
  )
}
