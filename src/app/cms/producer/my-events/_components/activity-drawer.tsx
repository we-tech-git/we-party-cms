'use client'

import { useEventActivities } from '@/hooks/use-event-activities'
import { useI18n } from '@/i18n/context'
import { ActivityListItem } from '@/components/dashboard/activity-item'

type ActivityDrawerProps = {
  eventId: string | null
  eventTitle: string
  onClose: () => void
}

export function ActivityDrawer({ eventId, eventTitle, onClose }: ActivityDrawerProps) {
  const { t } = useI18n()
  const { items, isLoading, isLoadingMore, hasMore, loadMore } = useEventActivities(eventId)
  const open = !!eventId

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-80 transition-opacity duration-250"
        style={{
          background: 'rgba(34,26,61,.4)',
          backdropFilter: 'blur(2px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
        }}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className="fixed top-0 right-0 h-full z-90 flex flex-col"
        style={{
          width: '440px',
          maxWidth: '92vw',
          background: '#FBF7FA',
          boxShadow: '-20px 0 60px -20px rgba(34,26,61,.4)',
          transform: open ? 'none' : 'translateX(100%)',
          transition: 'transform .28s cubic-bezier(.3,.7,.3,1)',
        }}
      >
        {/* Header */}
        <div className="relative px-5.5 py-5 bg-white" style={{ borderBottom: '1px solid var(--line-2)' }}>
          <p className="text-[11px] font-extrabold tracking-widest uppercase" style={{ color: 'var(--pink)' }}>
            {t('myEvents.activityDrawer.kicker')}
          </p>
          <h3 className="font-extrabold text-[20px] mt-0.5" style={{ fontFamily: 'var(--font-bricolage)' }}>
            {eventTitle}
          </h3>
          <button
            className="absolute top-4.5 right-4.5 w-9.5 h-9.5 rounded-[11px] flex items-center justify-center bg-white"
            style={{ border: '1px solid var(--line-2)' }}
            onClick={onClose}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M6 6l12 12M18 6L6 18"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto px-5.5 py-3.5">
          {isLoading ? (
            <div className="flex items-center justify-center h-32 text-[14px] font-semibold" style={{ color: 'var(--wp-muted)' }}>
              {t('myEvents.activityDrawer.loading')}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center gap-2">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--wp-muted)" strokeWidth="1.5">
                <path d="M21 15a4 4 0 01-4 4H8l-5 4V7a4 4 0 014-4h10a4 4 0 014 4z"/>
              </svg>
              <p className="font-bold text-[14px]" style={{ color: 'var(--wp-muted)' }}>{t('myEvents.activityDrawer.empty')}</p>
            </div>
          ) : (
            <>
              {items.map((item, i) => (
                <ActivityListItem
                  key={item.id}
                  item={item}
                  showEventName={false}
                  isLast={i === items.length - 1 && !hasMore}
                />
              ))}
              {hasMore && (
                <button
                  className="w-full text-center font-extrabold text-[13px] py-3 mt-1 rounded-[12px] transition-colors hover:bg-white disabled:opacity-50"
                  style={{ color: 'var(--pink)', border: '1.5px dashed var(--line)' }}
                  disabled={isLoadingMore}
                  onClick={loadMore}
                >
                  {isLoadingMore ? t('myEvents.activityDrawer.loadingMore') : t('myEvents.activityDrawer.loadMore')}
                </button>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  )
}
