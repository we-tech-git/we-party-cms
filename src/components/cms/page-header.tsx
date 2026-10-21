import * as React from "react"

import { IconTile } from "@/components/cms/icon-tile"
import { cn } from "@/lib/utils"

type PageHeaderProps = {
  title: React.ReactNode
  subtitle?: React.ReactNode
  icon?: React.ReactNode
  /** Ações (botões) à direita. Só uma ação Primary por página. */
  actions?: React.ReactNode
  className?: string
}

/** Cabeçalho de página (Figma: Page header): tile em gradiente + título 28 Bold + subtítulo. */
function PageHeader({ title, subtitle, icon, actions, className }: PageHeaderProps) {
  return (
    <header className={cn("flex flex-wrap items-center justify-between gap-4", className)}>
      <div className="flex min-w-0 items-center gap-4">
        {icon ? (
          <IconTile tone="brand" size="lg">
            {icon}
          </IconTile>
        ) : null}
        <div className="min-w-0">
          <h1 className="text-[26px] leading-tight font-bold text-ink sm:text-[28px]">{title}</h1>
          {subtitle ? <p className="mt-0.5 text-sm text-wp-sub">{subtitle}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2.5">{actions}</div> : null}
    </header>
  )
}

export { PageHeader }
