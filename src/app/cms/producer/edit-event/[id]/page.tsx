'use client'

import { useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { EventForm } from '../../new-event/_components/event-form'
import { mapEventToForm } from '../../new-event/_schema'
import { useEvent } from '@/hooks/use-event'

export default function EditEventPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const router = useRouter()
  const { data: event, isLoading, isError } = useEvent(id)

  const defaultValues = useMemo(() => (event ? mapEventToForm(event) : null), [event])

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center h-64 rounded-[20px] bg-white"
        style={{ border: '1px solid var(--line-2)' }}
      >
        <p className="text-sm font-semibold" style={{ color: 'var(--wp-muted)' }}>
          Carregando evento…
        </p>
      </div>
    )
  }

  if (isError || !event || !defaultValues) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-3 h-64 rounded-[20px] bg-white text-center px-6"
        style={{ border: '1px solid var(--line-2)' }}
      >
        <p className="font-extrabold text-[18px]" style={{ fontFamily: 'var(--font-bricolage)' }}>
          Evento não encontrado
        </p>
        <p className="text-sm font-semibold" style={{ color: 'var(--wp-muted)' }}>
          Ele pode ter sido removido ou você não tem acesso.
        </p>
        <button
          onClick={() => router.push('/cms/producer/my-events')}
          className="mt-1 font-extrabold text-[14px]"
          style={{ color: 'var(--pink)' }}
        >
          ← Voltar para Meus eventos
        </button>
      </div>
    )
  }

  return <EventForm mode="edit" eventId={event.id} defaultValues={defaultValues} />
}
