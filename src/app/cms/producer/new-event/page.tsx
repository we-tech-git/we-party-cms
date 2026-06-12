'use client'

import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import type { SubmitErrorHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { createEventSchema, buildPayload, type CreateEventForm } from './_schema'
import { useCreateEvent } from '@/hooks/use-create-event'
import { CoverDropzone } from './_components/cover-dropzone'
import { EventInfoForm } from './_components/event-info-form'
import { DateTimeForm } from './_components/date-time-form'
import { LocationForm } from './_components/location-form'
import { InterestsSelector } from './_components/interests-selector'
import { FaqEditor } from './_components/faq-editor'
import { LivePreview } from './_components/live-preview'
import { VisibilitySettings } from './_components/visibility-settings'
import { ActionBar } from './_components/action-bar'

const FIELD_LABELS: Partial<Record<keyof CreateEventForm, string>> = {
  title: 'Nome do evento',
  startDate: 'Data de início',
  faqs: 'FAQ incompleto',
}

export default function NewEventPage() {
  const router = useRouter()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 4500)
  }

  const methods = useForm<CreateEventForm>({
    resolver: zodResolver(createEventSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      startDate: '',
      startTime: '22:00',
      endDate: '',
      endTime: '06:00',
      zip: '',
      street: '',
      number: '',
      district: '',
      city: '',
      state: '',
      isPublic: true,
      allowComments: true,
      interestIds: [],
      faqs: [],
      photos: [],
    },
  })

  const createEvent = useCreateEvent()

  async function onSubmit(form: CreateEventForm) {
    setSubmitError(null)
    try {
      const payload = buildPayload(form)
      await createEvent.mutateAsync({ payload, photos: form.photos })
      router.push('/cms/producer/my-events')
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Erro ao publicar evento. Tente novamente.'
      setSubmitError(message)
    }
  }

  const onInvalid: SubmitErrorHandler<CreateEventForm> = (errors) => {
    const missing = (Object.keys(errors) as Array<keyof CreateEventForm>)
      .map(k => FIELD_LABELS[k])
      .filter((v): v is string => !!v)

    showToast(
      missing.length > 0
        ? `Preencha: ${missing.join(' e ')}`
        : 'Verifique os campos obrigatórios antes de publicar.'
    )

    // Scroll to first error field
    requestAnimationFrame(() => {
      const firstId = errors.title ? 'input-title' : errors.startDate ? 'input-startDate' : null
      if (firstId) {
        const el = document.getElementById(firstId)
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el?.focus()
      }
    })
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit, onInvalid)} noValidate>
        <div className="flex flex-col gap-5">
          {/* Page header */}
          <div>
            <h1
              className="font-extrabold text-[28px] leading-[1.05]"
              style={{ fontFamily: 'var(--font-bricolage)' }}
            >
              Criar novo evento ✨
            </h1>
            <p className="font-semibold mt-1 text-[14.5px]" style={{ color: 'var(--ink-soft)' }}>
              Capriche nos detalhes — eventos completos aparecem mais na descoberta e recebem mais curtidas.
            </p>
          </div>

          {/* Two-column grid */}
          <div
            className="grid gap-5 max-[1180px]:grid-cols-1"
            style={{ gridTemplateColumns: 'minmax(0,1fr) 372px', alignItems: 'start' }}
          >
            {/* Left column — form sections */}
            <div className="flex flex-col gap-5 min-w-0">
              {/* Cover upload */}
              <div
                className="rounded-[var(--r)] p-[18px]"
                style={{ background: '#fff', border: '1px solid var(--line-2)', boxShadow: 'var(--shadow-sm)' }}
              >
                <CoverDropzone />
              </div>

              <EventInfoForm />
              <DateTimeForm />
              <LocationForm />
              <InterestsSelector />
              <FaqEditor />
            </div>

            {/* Right column — preview + settings (sticky) */}
            <div
              className="flex flex-col gap-5 min-w-0 max-[1180px]:order-first"
              style={{ position: 'sticky', top: '90px' }}
            >
              <LivePreview />
              <VisibilitySettings />
            </div>
          </div>

          <ActionBar isSubmitting={createEvent.isPending} error={submitError} />
        </div>
      </form>

      {/* Validation toast */}
      {toast && (
        <div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-[16px] px-5 py-4 text-[14px] font-semibold text-white shadow-xl pointer-events-none"
          style={{ background: 'linear-gradient(135deg,#1a0b2e,#3a1060)', border: '1px solid rgba(255,77,141,.35)', whiteSpace: 'nowrap' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff4d8d" strokeWidth="2.4">
            <circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" />
          </svg>
          {toast}
        </div>
      )}
    </FormProvider>
  )
}
