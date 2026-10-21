'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CalendarCheck, CalendarDays, Flame, LayoutGrid, MapPin, Pencil } from 'lucide-react'
import { EmptyState } from '@/components/cms/empty-state'
import { Panel, PanelHeader } from '@/components/cms/panel'
import { Button } from '@/components/ui/button'
import { Chip } from '@/components/ui/chip'
import { useI18n } from '@/i18n/context'
import { useMyEvents } from '@/hooks/use-my-events'
import {
  mapEventStatus,
  getCoverStyle,
  formatEventDate,
  calcEventScore,
  calcPopularity,
} from '@/app/cms/producer/my-events/_utils'
import type { EventDto } from '@/types/events.types'

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace('.', ',')}k`
  return String(n)
}

type ActiveEventsProps = {
  /** Event already shown in the spotlight hero — excluded from the grid to avoid duplication. */
  spotlightId?: string
  isLoading?: boolean
}

export function ActiveEvents({ spotlightId, isLoading }: ActiveEventsProps) {
  const router = useRouter()
  const { t } = useI18n()
  const { data, isLoading: eventsLoading } = useMyEvents()

  const events = useMemo(() => data?.events ?? [], [data])
  const maxScore = useMemo(() => Math.max(0, ...events.map(calcEventScore)), [events])

  // Every active event the producer has on air right now.
  const activeEvents = useMemo(
    () => events.filter((e) => mapEventStatus(e.status, e.startDate) === 'ativo'),
    [events],
  )
  // Spotlight is already featured above, so keep the grid focused on the rest.
  const gridEvents = useMemo(
    () => activeEvents.filter((e) => e.id !== spotlightId),
    [activeEvents, spotlightId],
  )

  const loading = isLoading || eventsLoading
  const totalActive = activeEvents.length

  return (
    <Panel as="section" className="flex flex-col gap-4" data-testid="active-events">
      <PanelHeader
        title={t('home.activeEventsTitle')}
        icon={<LayoutGrid />}
        tone="green"
        action={
          <Link href="/cms/producer/my-events" className="font-semibold">
            {t('home.activeEventsSeeAll')}
          </Link>
        }
      />
      <p className="-mt-2 text-xs text-wp-sub">
        {loading
          ? t('home.activeEventsLoading')
          : totalActive > 0
            ? <><b className="text-wp-green">{t('home.activeEventsOnAir', { count: totalActive })}</b> — {t('home.activeEventsOnAirSub')}</>
            : t('home.activeEventsNone')}
      </p>

      {loading ? (
        <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,250px),1fr))' }}>
          {[0, 1].map((i) => (
            <div key={i} className="h-49 animate-pulse rounded-2xl bg-wp-bg" />
          ))}
        </div>
      ) : gridEvents.length > 0 ? (
        <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,250px),1fr))' }}>
          {gridEvents.map((ev) => (
            <ActiveEventCard
              key={ev.id}
              event={ev}
              popularityPct={calcPopularity(ev, maxScore)}
              onEdit={() => router.push(`/cms/producer/edit-event/${ev.id}`)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<CalendarCheck />}
          title={spotlightId && totalActive > 0 ? t('home.activeEventsSpotlighted') : t('home.activeEventsOnlyOne')}
          description={spotlightId && totalActive > 0 ? t('home.activeEventsSpotlightedSub') : t('home.activeEventsOnlyOneSub')}
        />
      )}
    </Panel>
  )
}

type ActiveEventCardProps = {
  event: EventDto
  popularityPct: number
  onEdit: () => void
}

function ActiveEventCard({ event, popularityPct, onEdit }: ActiveEventCardProps) {
  const { t } = useI18n()
  const coverStyle = { ...getCoverStyle(event), backgroundSize: 'cover', backgroundPosition: 'center' }

  const stats = [
    { val: event.viewCount, label: 'views' },
    { val: event._count.likes, label: 'curtidas' },
    { val: event._count.attendances, label: 'confirm.' },
    { val: event.shareCount, label: 'compart.' },
  ]

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-wp-line bg-white shadow-card" data-testid="active-event-card">
      <div className="relative flex h-26 items-end p-3" style={coverStyle}>
        <div className="absolute inset-0 bg-linear-to-t from-ink/80 via-ink/20 to-transparent" />
        <Chip tone="glass" className="absolute top-2.5 left-2.5 z-10 text-[10px]">
          <Flame /> Em alta
        </Chip>
        <h4 className="relative z-2 line-clamp-2 text-[17px] leading-tight font-bold text-white">{event.title}</h4>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-4 py-3.5">
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium text-neutral-600">
          <span className="inline-flex items-center gap-1"><CalendarDays className="size-3.5 text-wp-magenta" /> {formatEventDate(event.startDate)}</span>
          <span className="inline-flex max-w-full items-center gap-1 truncate"><MapPin className="size-3.5 text-wp-magenta" /> {event.location}</span>
        </div>

        <div className="grid grid-cols-4 gap-2 border-y border-wp-line py-2.5">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <b className="font-heading block text-[15px] leading-none text-ink">{s.val > 0 ? fmtNum(s.val) : '—'}</b>
              <small className="text-[10.5px] text-wp-sub">{s.label}</small>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2.5 text-xs font-semibold text-neutral-600">
          <div className="h-1.75 flex-1 overflow-hidden rounded-full bg-tint-pink">
            <div className="h-full rounded-full bg-(image:--wp-gradient)" style={{ width: `${popularityPct}%` }} />
          </div>
          <span className="whitespace-nowrap text-wp-magenta">pop. {popularityPct}</span>
        </div>

        <Button type="button" variant="primary" size="compact" onClick={onEdit} className="mt-auto w-full">
          <Pencil /> {t('home.editEvent')}
        </Button>
      </div>
    </article>
  )
}
