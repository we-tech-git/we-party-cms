'use client'

import { useFormContext } from 'react-hook-form'
import { useInterests } from '@/hooks/use-interests'
import type { CreateEventForm } from '../_schema'

function formatPreviewDate(date: string, time: string): string {
  if (!date) return 'Data e horário'
  const d = new Date(`${date}T00:00:00`)
  const s = d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
  const label = s.charAt(0).toUpperCase() + s.slice(1)
  return time ? `${label} · ${time}` : label
}

export function LivePreview() {
  const { watch } = useFormContext<CreateEventForm>()
  const { data: allInterests = [] } = useInterests()

  const title = watch('title')
  const startDate = watch('startDate')
  const startTime = watch('startTime')
  const city = watch('city')
  const isPublic = watch('isPublic')
  const allowComments = watch('allowComments')
  const interestIds = watch('interestIds') ?? []
  const photo = watch('photo')

  const previewInterests = allInterests.filter(i => interestIds.includes(i.id)).slice(0, 3)
  const previewDate = formatPreviewDate(startDate, startTime)
  const coverUrl = photo ? URL.createObjectURL(photo) : null

  return (
    <div>
      <div
        className="text-[11px] font-extrabold tracking-[.1em] uppercase flex items-center gap-2 mb-[10px]"
        style={{ color: 'var(--wp-muted)' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        Prévia no feed · ao vivo
      </div>

      <div
        className="rounded-[20px] overflow-hidden"
        style={{ background: '#fff', border: '1px solid var(--line-2)', boxShadow: 'var(--shadow)' }}
      >
        {/* Cover */}
        <div
          className="relative h-[150px] flex items-end p-[14px]"
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
            className="absolute top-3 left-3 z-10 text-[10px] font-extrabold tracking-[.05em] uppercase rounded-full px-[10px] py-[5px]"
            style={{ background: 'rgba(255,255,255,.9)', backdropFilter: 'blur(6px)', color: 'var(--violet)' }}
          >
            {isPublic ? 'Público' : 'Privado'}
          </span>
          <div className="relative z-10 flex gap-[6px] flex-wrap">
            {previewInterests.map(i => (
              <span
                key={i.id}
                className="text-[10px] font-extrabold uppercase tracking-[.04em] rounded-full px-[9px] py-1 text-white"
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
            {title || 'Nome do evento'}
          </h4>
          <div className="flex flex-col gap-[5px] mt-[9px] font-semibold text-[13px]" style={{ color: 'var(--ink-soft)' }}>
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
              {city || 'Cidade'}
            </span>
          </div>
          <div
            className="flex gap-4 mt-[14px] pt-[13px] font-bold text-[13px]"
            style={{ borderTop: '1px solid var(--line-2)', color: 'var(--wp-muted)' }}
          >
            <span>♥ 0</span>
            <span>✓ 0 vão</span>
            <span>{allowComments ? '💬 ativado' : '💬 desativado'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
