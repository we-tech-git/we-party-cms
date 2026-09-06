'use client'

import Link from 'next/link'
import { GRAD } from '@/lib/brand'
import { usePathname } from 'next/navigation'
import { useI18n } from '@/i18n/context'
import { cn } from '@/lib/utils'
import { useMyEvents } from '@/hooks/use-my-events'
import { useIsAdmin } from '@/hooks/use-is-admin'
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

const devLinks: NavItem[] = [
  {
    href: '/cms/admin/control-panel',
    labelKey: 'nav.controlPanel',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M3 12h4l2 6 4-14 2 8h6" />
      </svg>
    ),
  },
  {
    href: '/cms/admin/users',
    labelKey: 'nav.users',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <circle cx="9" cy="8" r="3.5" /><path d="M3 21v-1a6 6 0 0112 0v1M16 4.5a3.5 3.5 0 010 7M21 21v-1a6 6 0 00-4-5.7" />
      </svg>
    ),
  },
  {
    href: '/cms/admin/reports',
    labelKey: 'nav.reports',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M12 22s-8-4.5-10.5-9.5C-.5 9 1.5 5 5 5c1.8 0 3.5.9 7 3.5C15.5 5.9 17.2 5 19 5c3.5 0 5.5 4 3.5 7.5C20 17.5 12 22 12 22z" /><path d="M7 13l3 3 7-7" />
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
        <span className="hidden lg:inline text-[14px] whitespace-nowrap">{label}</span>
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
      <span className="hidden lg:inline text-[14px] whitespace-nowrap">{label}</span>
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
  const { t } = useI18n()
  const { data: eventsData } = useMyEvents()
  const eventsTotal = eventsData?.total
  const comingSoon = t('common.comingSoon')
  const { isAdmin } = useIsAdmin()

  const rootLinks: NavItem[] = [
    ...staticRootLinks,
    { ...myEventsLink, badge: eventsTotal != null ? String(eventsTotal) : undefined },
  ]

  return (
    <aside
      className="sticky top-18.25 flex flex-col gap-2 p-3 sm:min-h-[calc(100vh-73px)]"
      style={{ alignSelf: 'start' }}
    >
      {rootLinks.map((item) => (
        <NavLink key={item.href} item={item} active={pathname === item.href} label={t(item.labelKey)} comingSoon={comingSoon} />
      ))}

      {/* Área de desenvolvimento/admin — visível apenas para usuários com a função admin */}
      {isAdmin && (
        <>
          <SectionLabel label={t('nav.sectionDev')} />
          {devLinks.map((item) => (
            <NavLink key={item.href} item={item} active={pathname === item.href} label={t(item.labelKey)} comingSoon={comingSoon} />
          ))}
        </>
      )}
    </aside>
  )
}
