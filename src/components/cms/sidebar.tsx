'use client'

import Link from 'next/link'
import { GRAD } from '@/lib/brand'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'
import { useI18n } from '@/i18n/context'
import { cn } from '@/lib/utils'
import { useMyEvents } from '@/hooks/use-my-events'
import type { TKey } from '@/i18n/types'

const homeIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" />
  </svg>
)
const newEventIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <rect x="3" y="4" width="18" height="18" rx="3" /><path d="M3 9h18M8 2v4M16 2v4M12 14v3M10.5 15.5h3" />
  </svg>
)
const myEventsIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <rect x="3" y="4" width="18" height="18" rx="3" /><path d="M3 9h18M8 2v4M16 2v4" />
  </svg>
)

const staticRootLinks: NavItem[] = [
  { href: '/cms/home', labelKey: 'nav.home', icon: homeIcon },
  { href: '/cms/producer/new-event', labelKey: 'nav.newEvent', icon: newEventIcon },
]

const myEventsLink: NavItem = { href: '/cms/producer/my-events', labelKey: 'nav.myEvents', icon: myEventsIcon }

const growthLinks: NavItem[] = [
  {
    href: '#',
    labelKey: 'nav.boost',
    placeholder: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M3 17l6-6 4 4 8-8M21 7v5h-5" />
      </svg>
    ),
  },
  {
    href: '#',
    labelKey: 'nav.insights',
    placeholder: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      </svg>
    ),
  },
  {
    href: '#',
    labelKey: 'nav.discovery',
    badge: '#3',
    placeholder: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M12 21s-7-5.5-7-11a7 7 0 0114 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" />
      </svg>
    ),
  },
]

const audienceLinks: NavItem[] = [
  {
    href: '#',
    labelKey: 'nav.audience',
    placeholder: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <circle cx="9" cy="8" r="3.5" /><path d="M3 21v-1a6 6 0 0112 0v1M16 4.5a3.5 3.5 0 010 7M21 21v-1a6 6 0 00-4-5.7" />
      </svg>
    ),
  },
  {
    href: '#',
    labelKey: 'nav.engagement',
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
  labelKey: TKey
  badge?: string
  placeholder?: boolean
  icon: React.ReactNode
}

function NavLink({ item, active, label, comingSoon }: { item: NavItem; active: boolean; label: string; comingSoon: string }) {
  const baseClass = 'flex items-center justify-center lg:justify-start gap-3.25 px-0 lg:px-4 py-3.25 rounded-[15px] font-bold transition-[color,background,box-shadow]'

  const style = active
    ? { background: GRAD, color: '#fff', boxShadow: '0 14px 28px -14px rgba(240,48,154,.65)' }
    : {}

  const hoverClass = active ? '' : 'hover:bg-white hover:text-ink'

  if (item.placeholder) {
    return (
      <span
        className={cn(baseClass, 'text-ink-soft opacity-50 cursor-not-allowed')}
        title={`${label} — ${comingSoon}`}
      >
        <span className="w-5.5 h-5.5 grid place-items-center flex-none">{item.icon}</span>
        <span className="hidden lg:inline">{label}</span>
        {item.badge && (
          <span
            className="ml-auto hidden lg:inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-[8px]"
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
      className={cn(baseClass, hoverClass, active ? '' : 'text-ink-soft')}
      style={style}
    >
      <span className="w-5.5 h-5.5 grid place-items-center flex-none">{item.icon}</span>
      <span className="hidden lg:inline">{label}</span>
      {item.badge && (
        <span
          className="ml-auto hidden lg:inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-[8px]"
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
      className="hidden lg:block px-4 pb-1 pt-2 text-[11px] font-extrabold uppercase tracking-[.12em]"
      style={{ color: 'var(--wp-muted)' }}
    >
      {label}
    </p>
  )
}

export function CmsSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useI18n()
  const { user, logout } = useAuthStore()
  const { data: eventsData } = useMyEvents()
  const eventsTotal = eventsData?.total
  const comingSoon = t('common.comingSoon')

  const rootLinks: NavItem[] = [
    ...staticRootLinks,
    { ...myEventsLink, badge: eventsTotal != null ? String(eventsTotal) : undefined },
  ]

  function handleLogout() {
    logout()
    router.push('/login')
  }

  return (
    <aside
      className="sticky top-18.25 flex flex-col gap-2 p-3 sm:min-h-[calc(100vh-73px)]"
      style={{ alignSelf: 'start' }}
    >
      {rootLinks.map((item) => (
        <NavLink key={item.href} item={item} active={pathname === item.href} label={t(item.labelKey)} comingSoon={comingSoon} />
      ))}

      <SectionLabel label={t('nav.sectionGrowth')} />
      {growthLinks.map((item) => (
        <NavLink key={item.labelKey} item={item} active={false} label={t(item.labelKey)} comingSoon={comingSoon} />
      ))}

      <SectionLabel label={t('nav.sectionAudience')} />
      {audienceLinks.map((item) => (
        <NavLink key={item.labelKey} item={item} active={false} label={t(item.labelKey)} comingSoon={comingSoon} />
      ))}

      {/* AI Promo card */}
      <div
        className="hidden lg:block mt-2 rounded-[20px] p-4.5 text-white"
        style={{ background: 'linear-gradient(150deg,#2a1340,#4a1f5e)', boxShadow: 'var(--shadow)' }}
      >
        <p className="font-extrabold text-[15px]" style={{ fontFamily: 'var(--font-bricolage)' }}>
          {t('nav.aiPromoTitle')}
        </p>
        <p className="text-[12.5px] opacity-80 mt-1.5 mb-3">
          {t('nav.aiPromoDesc')}
        </p>
        <button
          className="w-full text-white font-extrabold rounded-[12px] py-2.5 text-[13px] transition hover:-translate-y-0.5"
          style={{ background: GRAD }}
        >
          {t('nav.activateNow')}
        </button>
      </div>

      {/* Logout at the bottom */}
      {user && (
        <button
          onClick={handleLogout}
          className="mt-auto text-center lg:text-left text-sm px-2 lg:px-4 py-2 rounded-[12px] transition hover:bg-red-50 hover:text-red-600"
          style={{ color: 'var(--wp-muted)' }}
        >
          {t('nav.logout')}
        </button>
      )}
    </aside>
  )
}
