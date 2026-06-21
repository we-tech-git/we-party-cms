'use client'

import { useI18n } from '@/i18n/context'

type BulkBarProps = {
  count: number
  isPending: boolean
  onArchive: () => void
  onDelete: () => void
  onClear: () => void
}

export function BulkBar({ count, isPending, onArchive, onDelete, onClear }: BulkBarProps) {
  const { t } = useI18n()
  return (
    <div
      className="fixed bottom-6 left-1/2 z-70 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-[18px] px-4 py-3 transition-transform duration-250 max-w-[calc(100vw-24px)]"
      style={{
        background: '#221A3D',
        color: '#fff',
        boxShadow: '0 20px 50px -16px rgba(34,26,61,.6)',
        transform: count > 0 ? 'translateX(-50%)' : 'translate(-50%, 140%)',
      }}
    >
      <b style={{ fontFamily: 'var(--font-bricolage)' }}>{t('myEvents.bulk.selected', { count })}</b>

      <button
        className="flex items-center gap-2 px-3.75 py-2.25 rounded-[12px] font-extrabold text-[14px] transition-colors"
        style={{ background: 'rgba(255,255,255,.12)' }}
        disabled={isPending}
        onClick={onArchive}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <rect x="3" y="3" width="18" height="5" rx="1"/><path d="M5 8v11a2 2 0 002 2h10a2 2 0 002-2V8M10 12h4"/>
        </svg>
        {t('myEvents.bulk.archive')}
      </button>

      <button
        className="flex items-center gap-2 px-3.75 py-2.25 rounded-[12px] font-extrabold text-[14px] transition-colors hover:bg-red"
        style={{ background: 'rgba(255,255,255,.12)' }}
        disabled={isPending}
        onClick={onDelete}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
        </svg>
        {t('myEvents.bulk.delete')}
      </button>

      <button
        className="font-bold text-[13px] opacity-60 hover:opacity-100 transition-opacity"
        onClick={onClear}
      >
        {t('myEvents.bulk.clear')}
      </button>
    </div>
  )
}
