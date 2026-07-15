'use client'

import { useRouter } from 'next/navigation'
import { useI18n } from '@/i18n/context'
import type { TKey } from '@/i18n/types'
import type { ProducerActivityDto, ProducerActivityType } from '@/types/events.types'

/** Visual treatment (icon glyph + colors) per activity type. */
const TYPE_STYLE: Record<ProducerActivityType, { symbol: string; bg: string; color: string; verbKey: TKey }> = {
  comment: { symbol: '💬', bg: '#E6F1FF', color: 'var(--blue)', verbKey: 'home.activityComment' },
  like: { symbol: '♥', bg: '#FFE9F2', color: 'var(--pink)', verbKey: 'home.activityLike' },
  attendance: { symbol: '✓', bg: '#EEEAFF', color: 'var(--violet)', verbKey: 'home.activityAttendance' },
  share: { symbol: '↗', bg: '#E6FBF3', color: 'var(--green)', verbKey: 'home.activityShare' },
}

/** "há 2 horas" / "2 hours ago", falling back to a short date for older items. */
function relativeTime(iso: string, locale: string): string {
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

interface ActivityInboxProps {
  activities?: ProducerActivityDto[]
  isLoading?: boolean
}

export function ActivityInbox({ activities, isLoading }: ActivityInboxProps) {
  const router = useRouter()
  const { t, locale } = useI18n()

  // Guard against an unexpected payload shape and keep only known activity types
  // (the feed is backend-ordered most-recent-first).
  const items = Array.isArray(activities)
    ? activities.filter((a) => a && a.type in TYPE_STYLE).slice(0, 20)
    : []

  return (
    <div
      className="rounded-(--r) px-6 py-5.5"
      style={{ background: '#fff', border: '1px solid var(--line-2)', boxShadow: 'var(--shadow-sm)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.75 mb-1">
        <span
          className="w-9.5 h-9.5 rounded-[12px] grid place-items-center flex-none"
          style={{ background: '#E6F1FF', color: 'var(--blue)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M21 15a4 4 0 01-4 4H8l-5 4V7a4 4 0 014-4h10a4 4 0 014 4z" />
          </svg>
        </span>
        <h3 className="font-bold text-[18px]" style={{ fontFamily: 'var(--font-bricolage)' }}>
          {t('home.recentActivityTitle')}
        </h3>
        <button
          onClick={() => router.push('/cms/producer/my-events')}
          className="ml-auto font-extrabold text-[13px]"
          style={{ color: 'var(--pink)' }}
        >
          {t('common.all')}
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <p className="py-6 text-[13.5px] font-semibold text-center" style={{ color: 'var(--ink-soft)' }}>
          {t('home.activityLoading')}
        </p>
      )}

      {/* Empty */}
      {!isLoading && items.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-[14px] font-bold">{t('home.activityEmpty')}</p>
          <p className="text-[12.5px] font-semibold mt-1" style={{ color: 'var(--ink-soft)' }}>
            {t('home.activityEmptySub')}
          </p>
        </div>
      )}

      {/* Feed */}
      {!isLoading &&
        items.map((item, i) => {
          const style = TYPE_STYLE[item.type]
          const initial = (item.user?.name ?? '?').charAt(0).toUpperCase()
          const time = relativeTime(item.createdAt, locale)
          return (
            <div
              key={item.id ?? i}
              className="flex gap-3 py-3.25 items-start"
              style={{ borderBottom: i < items.length - 1 ? '1px solid var(--line-2)' : 'none' }}
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
                  <strong>{item.event?.title ?? '—'}</strong>
                </p>
                {item.type === 'comment' && item.content && (
                  <>
                    <p className="text-[13px] mt-0.5 truncate" style={{ color: 'var(--ink-soft)', fontWeight: 500 }}>
                      &ldquo;{item.content}&rdquo;
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
        })}
    </div>
  )
}
