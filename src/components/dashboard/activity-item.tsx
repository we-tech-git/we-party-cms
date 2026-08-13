'use client'

import { useRouter } from 'next/navigation'
import { useI18n } from '@/i18n/context'
import type { TKey } from '@/i18n/types'
import type { EventActivityDto, EventActivityType } from '@/types/events.types'

/** Visual treatment (icon glyph + colors) per activity type. */
export const ACTIVITY_TYPE_STYLE: Record<EventActivityType, { symbol: string; bg: string; color: string; verbKey: TKey }> = {
  comment: { symbol: '💬', bg: '#E6F1FF', color: 'var(--blue)', verbKey: 'home.activityComment' },
  like: { symbol: '♥', bg: '#FFE9F2', color: 'var(--pink)', verbKey: 'home.activityLike' },
  attendance: { symbol: '✓', bg: '#EEEAFF', color: 'var(--violet)', verbKey: 'home.activityAttendance' },
  share: { symbol: '↗', bg: '#E6FBF3', color: 'var(--green)', verbKey: 'home.activityShare' },
}

/** "há 2 horas" / "2 hours ago", falling back to a short date for older items. */
export function activityRelativeTime(iso: string, locale: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const diffMs = then - Date.now() // negative → in the past
  const abs = Math.abs(diffMs)
  const MIN = 60_000
  const HOUR = 3_600_000
  const DAY = 86_400_000
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  if (abs < HOUR) return rtf.format(Math.round(diffMs / MIN), 'minute')
  if (abs < DAY) return rtf.format(Math.round(diffMs / HOUR), 'hour')
  if (abs < 7 * DAY) return rtf.format(Math.round(diffMs / DAY), 'day')
  return new Date(iso).toLocaleDateString(locale, { day: '2-digit', month: 'short' })
}

interface ActivityListItemProps {
  item: EventActivityDto
  /** Show the event title inline (dashboard feed spans multiple events; a per-event drawer doesn't need it). */
  showEventName?: boolean
  isLast?: boolean
}

export function ActivityListItem({ item, showEventName = true, isLast = false }: ActivityListItemProps) {
  const router = useRouter()
  const { t, locale } = useI18n()
  const style = ACTIVITY_TYPE_STYLE[item.type]
  const initial = (item.user?.name ?? '?').charAt(0).toUpperCase()
  const time = activityRelativeTime(item.createdAt, locale)

  return (
    <div
      className="flex gap-3 py-3.25 items-start"
      style={{ borderBottom: isLast ? 'none' : '1px solid var(--line-2)' }}
    >
      {item.type === 'comment' && item.user?.profileImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.user.profileImage}
          alt={item.user.name}
          className="w-9.5 h-9.5 rounded-[11px] object-cover flex-none"
        />
      ) : item.type === 'comment' ? (
        <span
          className="w-9.5 h-9.5 rounded-[11px] grid place-items-center text-white font-extrabold flex-none text-[14px]"
          style={{ background: 'linear-gradient(135deg,#ff7a59,#ff4d8d)' }}
        >
          {initial}
        </span>
      ) : (
        <span
          className="w-9.5 h-9.5 rounded-[11px] grid place-items-center font-extrabold flex-none"
          style={{ background: style.bg, color: style.color }}
        >
          {style.symbol}
        </span>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-semibold">
          <strong>{item.user?.name ?? '—'}</strong> {t(style.verbKey)}{' '}
          {showEventName && <strong>{item.event?.title ?? '—'}</strong>}
        </p>
        {item.type === 'comment' && item.data && (
          <>
            <p className="text-[13px] mt-0.5 truncate" style={{ color: 'var(--ink-soft)', fontWeight: 500 }}>
              &ldquo;{item.data}&rdquo;
            </p>
            <button
              onClick={() => router.push('/cms/producer/my-events')}
              className="mt-1.5 font-extrabold text-[12.5px]"
              style={{ color: 'var(--blue)' }}
            >
              {t('common.reply')} →
            </button>
          </>
        )}
        {time && (
          <div className="text-[12px] font-semibold mt-0.5" style={{ color: 'var(--wp-muted)' }}>
            {time}
          </div>
        )}
      </div>
    </div>
  )
}
