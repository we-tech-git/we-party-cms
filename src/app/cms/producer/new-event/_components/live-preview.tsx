'use client'

import { useState, useEffect } from 'react'
import { useFormContext, useController, useWatch } from 'react-hook-form'
import { CalendarDays, Eye, Heart, MapPin } from 'lucide-react'
import { Chip } from '@/components/ui/chip'
import { useInterests } from '@/hooks/use-interests'
import { useI18n } from '@/i18n/context'
import type { Locale } from '@/i18n/types'
import type { CreateEventForm } from '../_schema'

function formatPreviewDate(date: string, time: string, locale: Locale, fallback: string): string {
  if (!date) return fallback
  const d = new Date(`${date}T00:00:00`)
  const s = d.toLocaleDateString(locale, { weekday: 'short', day: '2-digit', month: 'short' })
  const label = s.charAt(0).toUpperCase() + s.slice(1)
  return time ? `${label} · ${time}` : label
}

export function LivePreview() {
  const { t, locale } = useI18n()
  const { control } = useFormContext<CreateEventForm>()
  const { data: allInterests = [] } = useInterests()

  const title = useWatch({ control, name: 'title' })
  const startDate = useWatch({ control, name: 'startDate' })
  const startTime = useWatch({ control, name: 'startTime' })
  const city = useWatch({ control, name: 'city' })
  const interestIds = useWatch({ control, name: 'interestIds' }) ?? []
  const faqs = (useWatch({ control, name: 'faqs' }) ?? []).filter((f) => f.question.trim() && f.answer.trim())
  const photos = useWatch({ control, name: 'photos' }) ?? []
  const existingPhotoUrls = useWatch({ control, name: 'existingPhotoUrls' }) ?? []
  const { field: { value: isPublic } } = useController<CreateEventForm, 'isPublic'>({ name: 'isPublic' })
  const { field: { value: allowComments } } = useController<CreateEventForm, 'allowComments'>({ name: 'allowComments' })
  const firstPhoto = photos.length > 0 ? photos[0] : null
  const firstExistingUrl = existingPhotoUrls.length > 0 ? existingPhotoUrls[0] : null

  const [filePreview, setFilePreview] = useState<string | null>(null)

  // URL.createObjectURL requires a side-effect with cleanup — useEffect is the right tool here.
  useEffect(() => {
    let url: string | null = null
    if (firstPhoto) {
      url = URL.createObjectURL(firstPhoto)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFilePreview(url)
    } else {
      setFilePreview(null)
    }
    return () => { if (url) URL.revokeObjectURL(url) }
  }, [firstPhoto])

  // New upload wins; otherwise fall back to an already-stored photo (edit mode).
  const coverUrl = filePreview ?? firstExistingUrl

  const previewInterests = allInterests.filter(i => interestIds.includes(i.id)).slice(0, 3)
  const previewDate = formatPreviewDate(startDate, startTime, locale, t('newEvent.preview.dateTime'))

  return (
    <div data-testid="live-preview">
      <p className="mb-2.5 flex items-center gap-2 text-[11px] font-semibold tracking-[.08em] text-wp-sub uppercase">
        <Eye className="size-3.5" />
        {t('newEvent.preview.kicker')}
      </p>

      <div className="overflow-hidden rounded-panel border border-wp-line bg-white shadow-card">
        <div
          className="relative flex h-37.5 items-end p-3.5"
          style={{
            background: coverUrl
              ? `linear-gradient(to top,rgba(34,26,61,.75),transparent 60%), url(${coverUrl}) center/cover`
              : 'linear-gradient(135deg,#3a2a5e,#8a2f62)',
          }}
        >
          <Chip tone="glass" className="absolute top-3 left-3 z-10 text-[10px] tracking-wider uppercase">
            {isPublic ? t('newEvent.public') : t('newEvent.private')}
          </Chip>
          <div className="relative z-10 flex flex-wrap gap-1.5">
            {previewInterests.map((i) => (
              <Chip key={i.id} tone="glass" className="text-[10px] uppercase">{i.name}</Chip>
            ))}
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-[19px] leading-tight font-bold text-ink">{title || t('newEvent.preview.eventName')}</h3>
          <div className="mt-2.5 flex flex-col gap-1.5 text-[13px] text-neutral-600">
            <span className="flex items-center gap-2"><CalendarDays className="size-3.5 text-wp-magenta" />{previewDate}</span>
            <span className="flex items-center gap-2"><MapPin className="size-3.5 text-wp-magenta" />{city || t('newEvent.preview.city')}</span>
          </div>
          <div className="mt-3.5 flex flex-wrap gap-4 border-t border-wp-line pt-3 text-[13px] font-medium text-wp-sub">
            <span className="inline-flex items-center gap-1"><Heart className="size-3.5" /> 0</span>
            <span>{t('newEvent.preview.going')}</span>
            <span>{allowComments ? t('newEvent.preview.commentsOn') : t('newEvent.preview.commentsOff')}</span>
          </div>

          {faqs.length > 0 && (
            <div className="mt-3.5 border-t border-wp-line pt-3">
              <p className="mb-2 text-[11px] font-semibold tracking-[.06em] text-wp-sub uppercase">{t('newEvent.preview.faqTitle')}</p>
              <div className="flex flex-col gap-2.5">
                {faqs.map((f, i) => (
                  <div key={i}>
                    <div className="text-[13px] font-semibold text-ink">{f.question}</div>
                    <div className="mt-0.5 text-[12.5px] text-wp-sub">{f.answer}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
