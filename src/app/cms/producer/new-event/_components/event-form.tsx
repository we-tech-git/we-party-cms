'use client'

import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import type { SubmitErrorHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { createEventSchema, buildPayload, type CreateEventForm } from '../_schema'
import { useI18n } from '@/i18n/context'
import { useCreateEvent } from '@/hooks/use-create-event'
import { useUpdateEvent } from '@/hooks/use-update-event'
import { CoverDropzone } from './cover-dropzone'
import { EventInfoForm } from './event-info-form'
import { DateTimeForm } from './date-time-form'
import { LocationForm } from './location-form'
import { InterestsSelector } from './interests-selector'
import { FaqEditor } from './faq-editor'
import { LivePreview } from './live-preview'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/cms/page-header'
import { Panel } from '@/components/cms/panel'
import { Toast } from '@/components/ui/toast'
import { VisibilitySettings } from './visibility-settings'
import { ActionBar } from './action-bar'

type EventFormProps =
  | { mode: 'create'; defaultValues: CreateEventForm }
  | { mode: 'edit'; eventId: string; defaultValues: CreateEventForm }

export function EventForm(props: EventFormProps) {
  const { mode, defaultValues } = props
  const isEdit = mode === 'edit'
  const router = useRouter()
  const { t } = useI18n()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const FIELD_LABELS: Partial<Record<keyof CreateEventForm, string>> = {
    title: t('newEvent.fieldTitle'),
    startDate: t('newEvent.fieldStartDate'),
    faqs: t('newEvent.fieldFaq'),
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 4500)
  }

  const methods = useForm<CreateEventForm>({
    resolver: zodResolver(createEventSchema),
    mode: 'onChange',
    defaultValues,
  })

  const createEvent = useCreateEvent()
  const updateEvent = useUpdateEvent()
  const isSubmitting = createEvent.isPending || updateEvent.isPending

  async function onSubmit(form: CreateEventForm) {
    setSubmitError(null)
    try {
      if (isEdit) {
        await updateEvent.mutateAsync({ eventId: props.eventId, form })
      } else {
        const payload = buildPayload(form)
        await createEvent.mutateAsync({ payload, photos: form.photos })
      }
      router.push('/cms/producer/my-events')
    } catch (err: unknown) {
      const fallback = isEdit ? t('newEvent.errorSave') : t('newEvent.errorPublish')
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback
      setSubmitError(message)
    }
  }

  const onInvalid: SubmitErrorHandler<CreateEventForm> = (errors) => {
    const missing = (Object.keys(errors) as Array<keyof CreateEventForm>)
      .map((k) => FIELD_LABELS[k])
      .filter((v): v is string => !!v)

    showToast(
      missing.length > 0
        ? t('newEvent.fillPrefix', { fields: missing.join(' / ') })
        : t('newEvent.fillFields')
    )

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
          <PageHeader
            icon={<Plus />}
            title={isEdit ? t('newEvent.editTitle') : t('newEvent.createTitle')}
            subtitle={isEdit ? t('newEvent.editSubtitle') : t('newEvent.createSubtitle')}
          />

          {/* Two-column grid */}
          <div className="grid gap-5 items-start grid-cols-1 min-[1181px]:grid-cols-[minmax(0,1fr)_340px]">
            {/* Left column — form sections */}
            <div className="flex flex-col gap-5 min-w-0">
              {/* Cover upload */}
              <Panel className="p-4">
                <CoverDropzone />
              </Panel>

              <EventInfoForm />
              <DateTimeForm />
              <LocationForm />
              <InterestsSelector />
              <FaqEditor />
            </div>

            {/* Right column — preview + settings (sticky) */}
            <div className="flex flex-col gap-5 min-w-0 max-[1180px]:order-first min-[1181px]:sticky min-[1181px]:top-20">
              <LivePreview />
              <VisibilitySettings />
            </div>
          </div>

          <ActionBar mode={mode} isSubmitting={isSubmitting} error={submitError} />
        </div>
      </form>

      {/* Toast de validação (role=alert) */}
      {toast && <Toast message={toast} type="warning" />}
    </FormProvider>
  )
}
