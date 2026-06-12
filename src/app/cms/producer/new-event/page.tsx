'use client'

import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
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

export default function NewEventPage() {
  const router = useRouter()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const methods = useForm<CreateEventForm>({
    resolver: zodResolver(createEventSchema),
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
      photo: null,
    },
  })

  const createEvent = useCreateEvent()

  async function onSubmit(form: CreateEventForm) {
    setSubmitError(null)
    try {
      const payload = buildPayload(form)
      await createEvent.mutateAsync({ payload, photo: form.photo })
      router.push('/cms/producer/my-events')
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Erro ao publicar evento. Tente novamente.'
      setSubmitError(message)
    }
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} noValidate>
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
    </FormProvider>
  )
}
