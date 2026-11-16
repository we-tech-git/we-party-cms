'use client'

import { Suspense, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { EventForm } from './_components/event-form'
import { EMPTY_EVENT_FORM, mapEventToDuplicateForm } from './_schema'
import { useEvent } from '@/hooks/use-event'
import { useI18n } from '@/i18n/context'
import { useAuthStore } from '@/stores/auth.store'

const PANEL_STYLE = { border: '1px solid var(--line-2)' }

/** Cria um evento a partir de outro (?from=<id>): carrega a origem e só então monta o formulário. */
function DuplicateEvent({ from }: { from: string }) {
  const { t } = useI18n()
  const router = useRouter()
  const userId = useAuthStore((s) => s.user?.id)
  const { data: event, isLoading, isError } = useEvent(from)

  const isOwner = !!event && !!userId && event.creator?.id === userId
  const suffix = t('newEvent.duplicateSuffix')
  const defaultValues = useMemo(
    () => (event && isOwner ? mapEventToDuplicateForm(event, suffix) : null),
    [event, isOwner, suffix]
  )

  if (isLoading) {
    return (
      <div
        data-testid="duplicate-loading"
        className="flex items-center justify-center h-64 rounded-[20px] bg-white"
        style={PANEL_STYLE}
      >
        <p className="text-sm font-semibold" style={{ color: 'var(--wp-muted)' }}>
          {t('common.loading')}
        </p>
      </div>
    )
  }

  if (isError || !defaultValues) {
    return (
      <div
        data-testid="duplicate-not-found"
        className="flex flex-col items-center justify-center gap-3 h-64 rounded-[20px] bg-white text-center px-6"
        style={PANEL_STYLE}
      >
        <p className="font-extrabold text-[18px]" style={{ fontFamily: 'var(--font-bricolage)' }}>
          {t('newEvent.sourceNotFound')}
        </p>
        <button
          onClick={() => router.push('/cms/producer/my-events')}
          className="mt-1 font-extrabold text-[14px]"
          style={{ color: 'var(--pink)' }}
        >
          {t('newEvent.backToMyEvents')}
        </button>
      </div>
    )
  }

  return <EventForm mode="create" defaultValues={defaultValues} asDraft />
}

function NewEventContent() {
  const from = useSearchParams().get('from')
  if (from) return <DuplicateEvent from={from} />
  return <EventForm mode="create" defaultValues={EMPTY_EVENT_FORM} />
}

export default function NewEventPage() {
  return (
    <Suspense fallback={null}>
      <NewEventContent />
    </Suspense>
  )
}
