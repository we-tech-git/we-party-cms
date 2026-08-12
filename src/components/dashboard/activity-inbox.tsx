'use client'

import { useRouter } from 'next/navigation'
import { useI18n } from '@/i18n/context'
import { ActivityListItem, ACTIVITY_TYPE_STYLE } from './activity-item'
import type { EventActivityDto } from '@/types/events.types'

interface ActivityInboxProps {
  activities?: EventActivityDto[]
  isLoading?: boolean
}

export function ActivityInbox({ activities, isLoading }: ActivityInboxProps) {
  const router = useRouter()
  const { t } = useI18n()

  // Guard against an unexpected payload shape and keep only known activity types
  // (the feed is backend-ordered most-recent-first).
  const items = Array.isArray(activities)
    ? activities.filter((a) => a && a.type in ACTIVITY_TYPE_STYLE).slice(0, 20)
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
        items.map((item, i) => (
          <ActivityListItem key={item.id} item={item} isLast={i === items.length - 1} />
        ))}
    </div>
  )
}
