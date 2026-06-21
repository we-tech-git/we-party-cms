'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { GRAD } from '@/lib/brand'
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
    <div
      className="rounded-(--r) px-6 py-5.5"
      style={{ background: '#fff', border: '1px solid var(--line-2)', boxShadow: 'var(--shadow-sm)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.75 mb-4">
        <span
          className="w-9.5 h-9.5 rounded-[12px] grid place-items-center flex-none"
          style={{ background: '#E6FBF3', color: 'var(--green)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" />
            <rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" />
          </svg>
        </span>
        <div className="min-w-0">
          <h3 className="font-bold text-[18px] leading-tight" style={{ fontFamily: 'var(--font-bricolage)' }}>
            {t('home.activeEventsTitle')}
          </h3>
          <p className="text-[12.5px] font-semibold mt-0.5" style={{ color: 'var(--wp-muted)' }}>
            {loading
              ? t('home.activeEventsLoading')
              : totalActive > 0
                ? <><b style={{ color: 'var(--green)' }}>{t('home.activeEventsOnAir', { count: totalActive })}</b> — {t('home.activeEventsOnAirSub')}</>
                : t('home.activeEventsNone')}
          </p>
        </div>
        <Link
          href="/cms/producer/my-events"
          className="ml-auto flex-none font-extrabold text-[13px] transition-colors hover:text-pink"
          style={{ color: 'var(--pink)' }}
        >
          {t('home.activeEventsSeeAll')}
        </Link>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,250px),1fr))' }}>
          {[0, 1].map((i) => (
            <div key={i} className="rounded-[18px] h-49 animate-pulse" style={{ background: '#F4EEF6' }} />
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
        <div
          className="flex flex-col items-center text-center gap-1 py-9 px-5 rounded-[18px]"
          style={{ border: '1px dashed var(--line)', color: 'var(--wp-muted)' }}
        >
          <div className="text-[30px]">✨</div>
          <b className="text-[15px]" style={{ fontFamily: 'var(--font-bricolage)', color: 'var(--ink)' }}>
            {spotlightId && totalActive > 0 ? t('home.activeEventsSpotlighted') : t('home.activeEventsOnlyOne')}
          </b>
          <span className="text-[13px] font-semibold">
            {spotlightId && totalActive > 0
              ? t('home.activeEventsSpotlightedSub')
              : t('home.activeEventsOnlyOneSub')}
          </span>
        </div>
      )}
    </div>
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
    <article
      className="rounded-[18px] overflow-hidden flex flex-col transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-(--shadow)"
      style={{ background: '#fff', border: '1px solid var(--line-2)', boxShadow: 'var(--shadow-sm)' }}
    >
      {/* Cover */}
      <div className="relative flex items-end p-3 h-26" style={coverStyle}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(20,8,30,.6),transparent 62%)' }} />
        <span
          className="absolute top-2.5 left-2.5 z-10 text-[10px] font-extrabold tracking-[.04em] uppercase px-2.5 py-1 rounded-full flex items-center gap-1.25 bg-white"
          style={{ color: 'var(--green)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--green)' }} />
          Em alta
        </span>
        <h4
          className="relative z-2 font-extrabold text-[17px] leading-[1.08] text-white line-clamp-2"
          style={{ fontFamily: 'var(--font-bricolage)', textShadow: '0 3px 14px rgba(0,0,0,.4)' }}
        >
          {event.title}
        </h4>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-3 flex-1 px-4 py-3.5">
        <div className="flex flex-wrap gap-x-3 gap-y-1 font-semibold text-[12.5px]" style={{ color: 'var(--ink-soft)' }}>
          <span>📅 {formatEventDate(event.startDate)}</span>
          <span className="truncate max-w-full">📍 {event.location}</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 py-2.5" style={{ borderTop: '1px solid var(--line-2)', borderBottom: '1px solid var(--line-2)' }}>
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <b className="block text-[15px] leading-none" style={{ fontFamily: 'var(--font-bricolage)' }}>
                {s.val > 0 ? fmtNum(s.val) : '—'}
              </b>
              <small className="font-bold text-[10.5px]" style={{ color: 'var(--wp-muted)' }}>{s.label}</small>
            </div>
          ))}
        </div>

        {/* Popularity */}
        <div className="flex items-center gap-2.5 text-[12px] font-bold" style={{ color: 'var(--ink-soft)' }}>
          <div className="flex-1 h-1.75 rounded-full overflow-hidden" style={{ background: '#F1ECF3' }}>
            <div className="h-full rounded-full" style={{ width: `${popularityPct}%`, background: GRAD }} />
          </div>
          <span style={{ color: 'var(--pink)', fontFamily: 'var(--font-bricolage)', whiteSpace: 'nowrap' }}>
            pop. {popularityPct}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <button
            onClick={onEdit}
            className="flex items-center justify-center gap-1.75 font-extrabold text-[13px] text-white px-3 py-2.5 rounded-[12px] transition-transform hover:-translate-y-0.5 flex-1"
            style={{ background: GRAD, boxShadow: '0 10px 20px -12px rgba(240,48,154,.7)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" />
            </svg>
            {t('home.editEvent')}
          </button>
        </div>
      </div>
    </article>
  )
}
