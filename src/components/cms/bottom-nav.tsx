'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useI18n } from '@/i18n/context'
import { useIsAdmin } from '@/hooks/use-is-admin'
import { ADMIN_NAV, PRODUCER_NAV } from '@/components/cms/nav-items'
import { cn } from '@/lib/utils'

/**
 * Barra inferior do mobile (Figma: Bottom nav / Bottom nav item). Até 5 destinos.
 * Admin ganha Painel e Usuários; o restante da administração fica no desktop.
 */
export function CmsBottomNav() {
  const pathname = usePathname()
  const { t } = useI18n()
  const { isAdmin } = useIsAdmin()
  const items = [...PRODUCER_NAV, ...(isAdmin ? ADMIN_NAV.slice(0, 2) : [])]

  return (
    <nav
      aria-label="Menu"
      data-testid="cms-bottom-nav"
      className="fixed inset-x-0 bottom-0 z-50 flex justify-between border-t border-wp-line bg-white px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden"
    >
      {items.map((item) => {
        const active = pathname === item.href
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex min-h-13 flex-1 flex-col items-center justify-center gap-0.5 rounded-[14px] text-[11px] font-semibold outline-none focus-visible:ring-3 focus-visible:ring-wp-primary/30',
              active ? 'bg-tint-pink text-wp-magenta' : 'text-wp-sub',
            )}
          >
            <Icon className="size-6" aria-hidden />
            <span className="max-w-full truncate px-1">{t(item.labelKey)}</span>
          </Link>
        )
      })}
    </nav>
  )
}
