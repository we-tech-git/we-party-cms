"use client"

import { useEffect, useRef, useState } from "react"
import {
  Archive, CalendarDays, CheckCircle2, Check, Clock, Copy, Eye, FileText, MapPin, MessageCircle,
  EllipsisVertical, Pencil, Trash2, TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { useI18n } from "@/i18n/context"
import { cn } from "@/lib/utils"
import type { EventDto } from "@/types/events.types"
import {
  mapEventStatus,
  getCoverStyle,
  formatEventDate,
  STATUS_LABELS,
  type UiEventStatus,
} from "@/app/cms/producer/my-events/_utils"

export type EventCardProps = {
  event: EventDto
  view: "grid" | "list"
  popularityPct: number
  selected: boolean
  onSelect: (id: string) => void
  onArchive: (event: EventDto) => void
  onDelete: (event: EventDto) => void
  onComments: (event: EventDto) => void
  onActivities: (event: EventDto) => void
  onEdit: (event: EventDto) => void
}

const STATUS_NOTE: Record<UiEventStatus, { icon: React.ReactNode; text: string } | null> = {
  ativo: null,
  rascunho: { icon: <FileText />, text: "Ainda não publicado — publique para ganhar alcance" },
  agendado: { icon: <Clock />, text: "Agendado — vai ao ar em breve" },
  encerrado: { icon: <CheckCircle2 />, text: "Evento encerrado · resultado final" },
  arquivado: { icon: <Archive />, text: "Arquivado" },
}

function fmtNum(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(".", ",")}k`
  return String(n)
}

/**
 * Card de evento do CMS (Figma: CMS event card).
 * Capa com degradê da tinta #221A3D, status em vidro, métricas e ação Editar. Sem sombra rosa.
 */
export function EventCard({ event, view, popularityPct, selected, onSelect, onArchive, onDelete, onComments, onActivities, onEdit }: EventCardProps) {
  const { t } = useI18n()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const uiStatus = mapEventStatus(event.status, event.startDate)
  const note = STATUS_NOTE[uiStatus]
  const isList = view === "list"

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    if (menuOpen) document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [menuOpen])

  const stats = [
    { val: event.viewCount, label: t("myEvents.card.views") },
    { val: event._count.likes, label: t("myEvents.card.likes") },
    { val: event._count.attendances, label: t("myEvents.card.attendances") },
    { val: event.shareCount, label: t("myEvents.card.shares") },
  ]

  const menuItems = [
    { label: t("myEvents.card.edit"), icon: <Pencil />, act: () => onEdit(event) },
    { label: t("myEvents.card.boost"), icon: <TrendingUp />, disabled: true },
    { label: t("myEvents.card.manageComments"), icon: <MessageCircle />, act: () => onComments(event) },
    { label: t("myEvents.card.viewActivities"), icon: <Eye />, act: () => onActivities(event) },
    { label: t("myEvents.card.duplicate"), icon: <Copy />, disabled: true },
  ]

  return (
    <article
      data-testid="event-card"
      data-status={uiStatus}
      className={cn(
        "relative flex overflow-hidden rounded-panel border border-wp-line bg-white shadow-card transition-shadow hover:shadow-dark/20",
        isList ? "flex-row" : "flex-col"
      )}
    >
      {/* Capa */}
      <div
        className={cn("relative flex items-end p-3.5", isList ? "min-h-32.5 w-[clamp(110px,28%,230px)] shrink-0" : "h-37.5")}
        style={{ ...getCoverStyle(event), backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-linear-to-t from-ink/85 via-ink/35 to-ink/20" />

        <button
          type="button"
          role="checkbox"
          aria-checked={selected}
          aria-label={event.title}
          data-testid="event-select"
          onClick={() => onSelect(event.id)}
          className={cn(
            "absolute top-3 left-3 z-10 grid size-6 place-items-center rounded-md border-2 border-white outline-none backdrop-blur-sm focus-visible:ring-3 focus-visible:ring-white/60",
            selected ? "bg-wp-primary" : "bg-white/25"
          )}
        >
          {selected && <Check className="size-3.5 text-white" strokeWidth={3} />}
        </button>

        <Chip tone="glass" className="absolute top-3 left-11 z-10" data-testid="event-status">
          {STATUS_LABELS[uiStatus]}
        </Chip>

        <div className="absolute top-2.5 right-2.5 z-20" ref={menuRef}>
          <button
            type="button"
            aria-label="Menu"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            data-testid="event-menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="grid size-8 place-items-center rounded-[10px] bg-white/90 text-ink outline-none backdrop-blur-sm focus-visible:ring-3 focus-visible:ring-white/60"
          >
            <EllipsisVertical className="size-[18px]" />
          </button>
          {menuOpen && (
            <div role="menu" className="absolute top-10 right-0 z-20 min-w-51.5 rounded-[14px] border border-wp-line bg-white p-1.5 shadow-card">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => { setMenuOpen(false); item.act?.() }}
                  className="flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2.5 text-left text-sm font-medium text-neutral-600 transition-colors hover:bg-wp-bg disabled:cursor-not-allowed disabled:opacity-40 [&_svg]:size-4"
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
              <div className="mx-1 my-1.5 h-px bg-wp-line" />
              <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); onArchive(event) }} className="flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2.5 text-left text-sm font-medium text-neutral-600 hover:bg-wp-bg [&_svg]:size-4">
                <Archive />{t("myEvents.card.archive")}
              </button>
              <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); onDelete(event) }} className="flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2.5 text-left text-sm font-medium text-wp-danger hover:bg-tint-pink [&_svg]:size-4" data-testid="event-delete">
                <Trash2 />{t("myEvents.card.delete")}
              </button>
            </div>
          )}
        </div>

        <h3 className="relative z-2 line-clamp-3 text-lg leading-tight font-bold text-white" data-testid="event-title">
          {event.title}
        </h3>
      </div>

      {/* Corpo */}
      <div className={cn("flex flex-1 flex-col gap-3", isList ? "px-5 py-4.5" : "px-4.5 py-4")}>
        <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 text-xs font-medium text-neutral-600">
          <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5 text-wp-magenta" />{formatEventDate(event.startDate)}</span>
          <span className="inline-flex min-w-0 items-center gap-1.5"><MapPin className="size-3.5 shrink-0 text-wp-magenta" /><span className="truncate">{event.location}</span></span>
        </div>

        {event.eventInterests.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {event.eventInterests.map((ei) => (
              <Chip key={ei.interestId} tone="pink" className="px-2.5 py-0.5 text-[10.5px] uppercase">
                {ei.interest.name}
              </Chip>
            ))}
          </div>
        )}

        <div className="grid grid-cols-4 gap-2 border-y border-wp-line py-3">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <b className="font-heading block text-[15px] leading-none text-ink">{s.val > 0 ? fmtNum(s.val) : "—"}</b>
              <small className="text-[11px] text-wp-sub">{s.label}</small>
            </div>
          ))}
        </div>

        {uiStatus === "ativo" ? (
          <div className="flex items-center gap-2.5 text-xs font-semibold text-neutral-600">
            <div className="h-1.75 flex-1 overflow-hidden rounded-full bg-tint-pink">
              <div className="h-full rounded-full bg-(image:--wp-gradient)" style={{ width: `${popularityPct}%` }} />
            </div>
            <span className="whitespace-nowrap text-wp-magenta">pop. {popularityPct}</span>
          </div>
        ) : note ? (
          <p className="flex items-center gap-1.5 text-xs font-semibold text-ink [&_svg]:size-3.5 [&_svg]:text-wp-purple">
            {note.icon}
            {note.text}
          </p>
        ) : null}

        <div className="mt-0.5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onComments(event)}
            aria-label={t("myEvents.card.manageComments")}
            className="inline-flex h-[38px] items-center gap-1.5 rounded-[10px] border border-wp-line bg-white px-3 text-[13px] font-semibold text-ink outline-none hover:bg-wp-bg focus-visible:ring-3 focus-visible:ring-wp-primary/30"
          >
            <MessageCircle className="size-4 text-wp-sub" />
            {event._count.comments}
          </button>
          <Button type="button" variant="primary" size="compact" className="ml-auto" onClick={() => onEdit(event)} data-testid="event-edit">
            <Pencil /> {t("myEvents.card.editShort")}
          </Button>
        </div>
      </div>
    </article>
  )
}
