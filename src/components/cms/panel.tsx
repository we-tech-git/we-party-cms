import * as React from "react"

import { IconTile } from "@/components/cms/icon-tile"
import { cn } from "@/lib/utils"

/**
 * Painel do CMS (Figma: "painel" = frame branco r20, borda #F6E1E9, shadow/card).
 * Substitui os cartões com sombra rosa. `as` permite usar <section>.
 */
function Panel({
  className,
  as: Tag = "div",
  ...props
}: React.ComponentProps<"div"> & { as?: React.ElementType }) {
  return (
    <Tag
      data-slot="panel"
      className={cn("rounded-panel border border-wp-line bg-white p-5 shadow-card", className)}
      {...props}
    />
  )
}

type PanelHeaderProps = {
  title: React.ReactNode
  icon?: React.ReactNode
  /** Ação opcional à direita (link/rótulo magenta). */
  action?: React.ReactNode
  tone?: React.ComponentProps<typeof IconTile>["tone"]
  className?: string
}

/** Cabeçalho de painel (Figma: Panel header): tile tintado + título 16 SemiBold + ação. */
function PanelHeader({ title, icon, action, tone = "purple", className }: PanelHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <div className="flex min-w-0 items-center gap-2.5">
        {icon ? <IconTile tone={tone}>{icon}</IconTile> : null}
        <h2 className="truncate text-base font-semibold text-ink">{title}</h2>
      </div>
      {action ? <div className="shrink-0 text-[13px] font-semibold text-wp-magenta">{action}</div> : null}
    </div>
  )
}

export { Panel, PanelHeader }
