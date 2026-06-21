'use client'

import { useFormContext } from 'react-hook-form'
import { GRAD } from '@/lib/brand'
import { useI18n } from '@/i18n/context'
import type { CreateEventForm } from '../_schema'

type ActionBarProps = {
  mode: 'create' | 'edit'
  isSubmitting: boolean
  error: string | null
}

export function ActionBar({ mode, isSubmitting, error }: ActionBarProps) {
  const { t } = useI18n()
  const { watch } = useFormContext<CreateEventForm>()
  const title = watch('title')
  const startDate = watch('startDate')
  const isReady = !!(title?.trim() && startDate)
  const isEdit = mode === 'edit'

  return (
    <div
      className="sticky bottom-4 z-40 flex items-center gap-3.5 flex-wrap rounded-[20px] px-4.5 py-3.5 mt-1"
      style={{
        background: 'rgba(255,255,255,.86)',
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--line-2)',
        boxShadow: 'var(--shadow)',
      }}
    >
      <span className="flex items-center gap-2 font-semibold text-[13.5px]" style={{ color: 'var(--ink-soft)' }}>
        {error ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--pink)" strokeWidth="2.2">
              <circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" />
            </svg>
            <span style={{ color: 'var(--pink)' }}>{error}</span>
          </>
        ) : isReady ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.6">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <span>{isEdit ? t('newEvent.readySave') : t('newEvent.readyPublish')}</span>
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" />
            </svg>
            {isEdit ? t('newEvent.needNameDateEdit') : t('newEvent.needNameDate')}
          </>
        )}
      </span>

      <div className="ml-auto flex gap-3">
        {!isEdit && (
          <button
            type="button"
            disabled
            className="flex items-center gap-2 rounded-[14px] px-6 py-3.5 font-extrabold text-[14px] border transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: '#fff', border: '1px solid var(--line)', color: 'var(--ink)' }}
            title={`${t('newEvent.saveDraft')} — ${t('common.comingSoon')}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
              <path d="M17 21v-8H7v8M7 3v5h8" />
            </svg>
            {t('newEvent.saveDraft')}
          </button>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-[14px] px-6 py-3.5 font-extrabold text-[14px] text-white transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
          style={{ background: GRAD, boxShadow: '0 14px 28px -14px rgba(240,48,154,.7)' }}
        >
          {isSubmitting ? (
            isEdit ? t('newEvent.saving') : t('newEvent.publishing')
          ) : (
            <>
              {isEdit ? t('newEvent.saveChanges') : t('newEvent.publish')}
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
