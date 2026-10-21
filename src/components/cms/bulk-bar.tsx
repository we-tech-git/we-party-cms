"use client"

import { Archive, Trash2 } from "lucide-react"
import { useI18n } from "@/i18n/context"
import { cn } from "@/lib/utils"

type BulkBarProps = {
  count: number
  isPending: boolean
  onArchive: () => void
  onDelete: () => void
  onClear: () => void
}

/** Barra flutuante de seleção em lote (Figma: Bulk bar). Tinta #221A3D, ações em vidro. */
export function BulkBar({ count, isPending, onArchive, onDelete, onClear }: BulkBarProps) {
  const { t } = useI18n()
  const glass = "inline-flex items-center gap-1.5 rounded-[10px] bg-white/12 px-3.5 py-2 text-[13px] font-semibold outline-none transition-colors hover:bg-white/20 focus-visible:ring-3 focus-visible:ring-white/50 disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:size-4"
  return (
    <div
      role="toolbar"
      aria-label={t("myEvents.bulk.selected", { count })}
      aria-hidden={count === 0}
      data-testid="bulk-bar"
      className={cn(
        "fixed bottom-20 left-1/2 z-70 flex max-w-[calc(100vw-24px)] flex-wrap items-center justify-center gap-x-3.5 gap-y-2 rounded-2xl bg-ink px-4 py-2.5 text-white shadow-dark transition-transform duration-200 lg:bottom-6",
        count > 0 ? "-translate-x-1/2" : "pointer-events-none -translate-x-1/2 translate-y-[160%]"
      )}
    >
      <b className="text-[13px] font-semibold" aria-live="polite">{t("myEvents.bulk.selected", { count })}</b>
      <button type="button" className={glass} disabled={isPending} onClick={onArchive} tabIndex={count > 0 ? 0 : -1} data-testid="bulk-archive">
        <Archive /> {t("myEvents.bulk.archive")}
      </button>
      <button type="button" className={glass} disabled={isPending} onClick={onDelete} tabIndex={count > 0 ? 0 : -1} data-testid="bulk-delete">
        <Trash2 /> {t("myEvents.bulk.delete")}
      </button>
      <button type="button" className="text-[13px] font-medium opacity-70 outline-none hover:opacity-100 focus-visible:underline" onClick={onClear} tabIndex={count > 0 ? 0 : -1}>
        {t("myEvents.bulk.clear")}
      </button>
    </div>
  )
}
