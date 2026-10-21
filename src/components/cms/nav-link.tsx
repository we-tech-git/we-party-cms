import Link from 'next/link'
import type { NavItem } from '@/components/cms/nav-items'
import { cn } from '@/lib/utils'

type Props = { item: NavItem; active: boolean; label: string }

/**
 * Item do menu lateral (Figma: Nav item › State=Active/Inactive).
 * Inativo: sem caixa. Ativo: fundo rosa claro, texto/ícone magenta e barra em gradiente à esquerda.
 */
export function NavLink({ item, active, label }: Props) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      data-testid={`nav-${item.href.split('/').pop()}`}
      className={cn(
        'relative flex items-center gap-3 rounded-xl px-3.5 py-2.75 text-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-wp-primary/30',
        active
          ? 'bg-tint-pink font-semibold text-wp-magenta'
          : 'font-medium text-neutral-600 hover:bg-wp-bg hover:text-ink'
      )}
    >
      {active && (
        <span aria-hidden className="absolute top-1/2 left-0 h-[22px] w-[3px] -translate-y-1/2 rounded-full bg-(image:--wp-gradient-v)" />
      )}
      <Icon className="size-5 shrink-0" aria-hidden />
      <span className="flex-1 truncate">{label}</span>
      {item.badge && (
        <span className={cn('rounded-full px-1.75 py-0.5 text-[11px] font-semibold', active ? 'bg-white text-wp-magenta' : 'bg-tint-pink text-wp-magenta')}>
          {item.badge}
        </span>
      )}
    </Link>
  )
}
