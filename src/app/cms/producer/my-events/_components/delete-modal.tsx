'use client'

import { useI18n } from '@/i18n/context'

type DeleteModalProps = {
  eventName: string
  isPending: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteModal({ eventName, isPending, onConfirm, onCancel }: DeleteModalProps) {
  const { t } = useI18n()
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-5">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(34,26,61,.45)', backdropFilter: 'blur(3px)' }}
        onClick={onCancel}
      />
      {/* Box */}
      <div
        className="relative bg-white rounded-[22px] p-7 w-full text-center"
        style={{ maxWidth: '400px', boxShadow: 'var(--shadow)' }}
      >
        <div
          className="w-15 h-15 rounded-4.5 flex items-center justify-center mx-auto mb-3.5"
          style={{ background: '#FFF0F3', color: 'var(--red, #E0476B)' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/>
          </svg>
        </div>
        <h3 className="font-extrabold text-[20px]" style={{ fontFamily: 'var(--font-bricolage)' }}>
          {t('myEvents.deleteModal.title')}
        </h3>
        <p className="font-medium mt-2 mb-5.5" style={{ color: 'var(--ink-soft)' }}>
          {t('myEvents.deleteModal.desc', { name: eventName })}
        </p>
        <div className="flex gap-2.5">
          <button
            className="flex-1 rounded-[14px] py-3.25 font-extrabold transition-colors hover:opacity-90"
            style={{ background: '#F4EFF6', color: 'var(--ink)' }}
            onClick={onCancel}
          >
            {t('myEvents.deleteModal.cancel')}
          </button>
          <button
            className="flex-1 rounded-[14px] py-3.25 font-extrabold text-white transition-opacity disabled:opacity-60"
            style={{ background: 'var(--red, #E0476B)' }}
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending ? t('myEvents.deleteModal.deleting') : t('myEvents.deleteModal.confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}
