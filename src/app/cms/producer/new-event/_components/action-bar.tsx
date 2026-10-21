'use client'

import { ArrowRight, CircleAlert, CircleCheck, Info, Save } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n/context'
import type { CreateEventForm } from '../_schema'

type ActionBarProps = {
  mode: 'create' | 'edit'
  isSubmitting: boolean
  error: string | null
}

/** Barra de publicação (Figma: Novo evento › barra fixa). Botão com loading e bloqueio de duplo envio (AGENTS.md #2). */
export function ActionBar({ mode, isSubmitting, error }: ActionBarProps) {
  const { t } = useI18n()
  const { watch } = useFormContext<CreateEventForm>()
  const title = watch('title')
  const startDate = watch('startDate')
  const isReady = !!(title?.trim() && startDate)
  const isEdit = mode === 'edit'

  return (
    <div
      data-testid="action-bar"
      className="sticky bottom-20 z-40 mt-1 flex flex-wrap items-center gap-3.5 rounded-2xl border border-wp-line bg-white px-5 py-3 shadow-[0_6px_20px_rgba(16,24,40,.12)] lg:bottom-4"
    >
      <span className="flex items-center gap-2 text-[13.5px] text-wp-sub" role="status">
        {error ? (
          <><CircleAlert className="size-4 text-wp-danger" /><span className="font-medium text-wp-danger">{error}</span></>
        ) : isReady ? (
          <><CircleCheck className="size-4 text-wp-green" /><span>{isEdit ? t('newEvent.readySave') : t('newEvent.readyPublish')}</span></>
        ) : (
          <><Info className="size-4" />{isEdit ? t('newEvent.needNameDateEdit') : t('newEvent.needNameDate')}</>
        )}
      </span>

      <div className="ml-auto flex gap-2.5">
        {!isEdit && (
          <Button type="button" variant="line" size="compact" disabled title={`${t('newEvent.saveDraft')} — ${t('common.comingSoon')}`}>
            <Save /> {t('newEvent.saveDraft')}
          </Button>
        )}
        <Button type="submit" variant="primary" size="md" disabled={isSubmitting} data-testid="event-submit">
          {isSubmitting ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />
              {isEdit ? t('newEvent.saving') : t('newEvent.publishing')}
            </>
          ) : (
            <>{isEdit ? t('newEvent.saveChanges') : t('newEvent.publish')} <ArrowRight /></>
          )}
        </Button>
      </div>
    </div>
  )
}
