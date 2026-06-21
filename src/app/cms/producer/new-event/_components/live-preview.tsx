'use client'

import { useState, useEffect } from 'react'
import { useFormContext, useController } from 'react-hook-form'
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
  const { watch } = useFormContext<CreateEventForm>()
  const { data: allInterests = [] } = useInterests()

  const title = watch('title')
  const startDate = watch('startDate')
  const startTime = watch('startTime')
  const city = watch('city')
  const interestIds = watch('interestIds') ?? []
  const faqs = (watch('faqs') ?? []).filter((f) => f.question.trim() && f.answer.trim())
  const photos = watch('photos') ?? []
  const existingPhotoUrls = watch('existingPhotoUrls') ?? []
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
    <div>
      <div
        className="text-[11px] font-extrabold tracking-widest uppercase flex items-center gap-2 mb-2.5"
        style={{ color: 'var(--wp-muted)' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        {t('newEvent.preview.kicker')}
      </div>

      <div
        className="rounded-[20px] overflow-hidden"
        style={{ background: '#fff', border: '1px solid var(--line-2)', boxShadow: 'var(--shadow)' }}
      >
        {/* Cover */}
        <div
          className="relative h-37.5 flex items-end p-3.5"
          style={{
            background: coverUrl
              ? `linear-gradient(to top,rgba(20,8,30,.6),transparent 60%), url(${coverUrl}) center/cover`
              : 'linear-gradient(120deg,#ff7e3d,#ff4d8d 55%,#a23bd6)',
          }}
        >
          <div
            className="absolute inset-0"
            style={!coverUrl ? { background: 'linear-gradient(to top,rgba(20,8,30,.6),transparent 60%)' } : undefined}
          />
          <span
            className="absolute top-3 left-3 z-10 text-[10px] font-extrabold tracking-wider uppercase rounded-full px-2.5 py-1.25"
            style={{ background: 'rgba(255,255,255,.9)', backdropFilter: 'blur(6px)', color: 'var(--violet)' }}
          >
            {isPublic ? t('newEvent.public') : t('newEvent.private')}
          </span>
          <div className="relative z-10 flex gap-1.5 flex-wrap">
            {previewInterests.map(i => (
              <span
                key={i.id}
                className="text-[10px] font-extrabold uppercase tracking-[.04em] rounded-full px-2.25 py-1 text-white"
                style={{ background: 'rgba(255,255,255,.2)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,.3)' }}
              >
                {i.name}
              </span>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-4">
          <h4
            className="font-extrabold text-[19px] leading-[1.1]"
            style={{ fontFamily: 'var(--font-bricolage)', color: 'var(--ink)' }}
          >
            {title || t('newEvent.preview.eventName')}
          </h4>
          <div className="flex flex-col gap-1.25 mt-2.25 font-semibold text-[13px]" style={{ color: 'var(--ink-soft)' }}>
            <span className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--pink)" strokeWidth="2.2">
                <rect x="3" y="4" width="18" height="18" rx="3" /><path d="M3 9h18M8 2v4M16 2v4" />
              </svg>
              {previewDate}
            </span>
            <span className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--pink)" strokeWidth="2.2">
                <path d="M12 21s-7-5.5-7-11a7 7 0 0114 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" />
              </svg>
              {city || t('newEvent.preview.city')}
            </span>
          </div>
          <div
            className="flex gap-4 mt-3.5 pt-3.25 font-bold text-[13px]"
            style={{ borderTop: '1px solid var(--line-2)', color: 'var(--wp-muted)' }}
          >
            <span>♥ 0</span>
            <span>{t('newEvent.preview.going')}</span>
            <span>{allowComments ? t('newEvent.preview.commentsOn') : t('newEvent.preview.commentsOff')}</span>
          </div>

          {faqs.length > 0 && (
            <div className="mt-3.5 pt-3.25" style={{ borderTop: '1px solid var(--line-2)' }}>
              <div
                className="text-[11px] font-extrabold tracking-[.06em] uppercase mb-2.25"
                style={{ color: 'var(--wp-muted)' }}
              >
                {t('newEvent.preview.faqTitle')}
              </div>
              <div className="flex flex-col gap-2.25">
                {faqs.map((f, i) => (
                  <div key={i}>
                    <div className="font-bold text-[13px]" style={{ color: 'var(--ink)' }}>
                      {f.question}
                    </div>
                    <div className="font-medium text-[12.5px] mt-0.5" style={{ color: 'var(--ink-soft)' }}>
                      {f.answer}
                    </div>
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
