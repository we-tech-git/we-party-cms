import type { LucideIcon } from 'lucide-react'
import { Bell, CalendarDays, CalendarPlus, Flag, House, LayoutDashboard, Users } from 'lucide-react'
import type { TKey } from '@/i18n/types'

export type NavItem = {
  href: string
  labelKey: TKey
  icon: LucideIcon
  /** Contador opcional (ex.: total de eventos). */
  badge?: string
}

/** Itens do produtor — Figma: CMS sidebar / Bottom nav. */
export const PRODUCER_NAV: NavItem[] = [
  { href: '/cms/home', labelKey: 'nav.home', icon: House },
  { href: '/cms/producer/new-event', labelKey: 'nav.newEvent', icon: CalendarPlus },
  { href: '/cms/producer/my-events', labelKey: 'nav.myEvents', icon: CalendarDays },
]

/** Seção "Administração" — só aparece para admin (a autorização real continua no backend). */
export const ADMIN_NAV: NavItem[] = [
  { href: '/cms/admin/control-panel', labelKey: 'nav.controlPanel', icon: LayoutDashboard },
  { href: '/cms/admin/users', labelKey: 'nav.users', icon: Users },
  { href: '/cms/admin/reports', labelKey: 'nav.reports', icon: Flag },
  { href: '/cms/admin/updates', labelKey: 'nav.updates', icon: Bell },
]
