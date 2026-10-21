import * as React from "react"

import { IconTile } from "@/components/cms/icon-tile"
import { cn } from "@/lib/utils"

type StatCardProps = {
  icon: React.ReactNode
  tone?: React.ComponentProps<typeof IconTile>["tone"]
  /** `null`/`undefined` = métrica que o backend não sabe calcular → mostra "—" (regra AGENTS.md #3). */
  value: number | string | null | undefined
  label: string
  detail?: string
  className?: string
  "data-testid"?: string
}

/** Indicador do CMS (Figma: Stat card › Tom): tile tintado + valor + rótulo + detalhe. */
function StatCard({ icon, tone = "purple", value, label, detail, className, ...rest }: StatCardProps) {
  return (
    <div
      data-slot="stat-card"
      data-testid={rest["data-testid"]}
      className={cn(
        "flex items-center gap-3.5 rounded-2xl border border-wp-line bg-white px-[18px] py-4 shadow-card",
        className
      )}
    >
      <IconTile tone={tone} size="md">
        {icon}
      </IconTile>
      <div className="min-w-0">
        <p className="font-heading text-[26px] leading-none font-bold text-ink">{value ?? "—"}</p>
        <p className="mt-1 truncate text-[13px] font-medium text-neutral-600">{label}</p>
        {detail ? <p className="truncate text-xs text-wp-sub">{detail}</p> : null}
      </div>
    </div>
  )
}

export { StatCard }
