import * as React from 'react'
import { IconTile } from '@/components/cms/icon-tile'
import { cn } from '@/lib/utils'

type EmptyStateProps = {
  icon: React.ReactNode
  title: string
  description?: string
  className?: string
}

/** Estado vazio (Figma: bloco "Vazio"): tile rosa, título e descrição sobre fundo #FFF6F8. */
export function EmptyState({ icon, title, description, className }: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn('flex flex-col items-center gap-1.5 rounded-2xl bg-wp-bg px-6 py-8 text-center', className)}
    >
      <IconTile tone="pink" size="md">
        {icon}
      </IconTile>
      <p className="mt-1 text-sm font-semibold text-ink">{title}</p>
      {description ? <p className="max-w-65 text-xs text-wp-sub">{description}</p> : null}
    </div>
  )
}
