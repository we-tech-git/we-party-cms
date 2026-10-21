'use client'

import { usePathname } from 'next/navigation'
import { useI18n } from '@/i18n/context'
import { useMyEvents } from '@/hooks/use-my-events'
import { useIsAdmin } from '@/hooks/use-is-admin'
import { ADMIN_NAV, PRODUCER_NAV, type NavItem } from '@/components/cms/nav-items'
import { NavLink } from '@/components/cms/nav-link'

/** Menu lateral do CMS (Figma: CMS sidebar) — painel branco único, 260px, só no desktop (lg+). */
export function CmsSidebar() {
  const pathname = usePathname()
  const { t } = useI18n()
  const { data: eventsData } = useMyEvents()
  const { isAdmin } = useIsAdmin()
  const eventsTotal = eventsData?.total

  const producer: NavItem[] = PRODUCER_NAV.map((item) =>
    item.href.endsWith('/my-events') && eventsTotal != null ? { ...item, badge: String(eventsTotal) } : item,
  )

  return (
    <aside
      aria-label="Menu"
      data-testid="cms-sidebar"
      className="sticky top-20 hidden w-65 flex-col gap-1 self-start rounded-panel border border-wp-line bg-white p-3 shadow-card lg:flex"
    >
      {producer.map((item) => (
        <NavLink key={item.href} item={item} active={pathname === item.href} label={t(item.labelKey)} />
      ))}

      {isAdmin && (
        <>
          <div className="mt-2 flex flex-col gap-2 border-t border-wp-line px-3 pt-3 pb-1">
            <p className="text-[10px] font-semibold tracking-[.08em] text-wp-faint uppercase">{t('nav.sectionDev')}</p>
          </div>
          {ADMIN_NAV.map((item) => (
            <NavLink key={item.href} item={item} active={pathname === item.href} label={t(item.labelKey)} />
          ))}
        </>
      )}
    </aside>
  )
}
