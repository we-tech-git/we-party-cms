'use client'

import { useState, useRef, useEffect } from 'react'
import { GRAD } from '@/lib/brand'
import { useI18n } from '@/i18n/context'
import type { EventDto } from '@/types/events.types'
import {
  mapEventStatus,
  getCoverStyle,
  formatEventDate,
  STATUS_LABELS,
  STATUS_STYLES,
  type UiEventStatus,
} from '../_utils'

type EventCardProps = {
  event: EventDto
  view: 'grid' | 'list'
  popularityPct: number
  selected: boolean
  onSelect: (id: string) => void
  onArchive: (event: EventDto) => void
  onDelete: (event: EventDto) => void
  onComments: (event: EventDto) => void
  onActivities: (event: EventDto) => void
  onEdit: (event: EventDto) => void
}

const POPULARITY_MSG: Record<UiEventStatus, string> = {
  ativo: '',
  rascunho: '📝 Ainda não publicado — publique para ganhar alcance',
  agendado: '⏳ Agendado — vai ao ar em breve',
  encerrado: '✅ Evento encerrado · resultado final',
  arquivado: '🗄️ Arquivado',
}

export function EventCard({ event, view, popularityPct, selected, onSelect, onArchive, onDelete, onComments, onActivities, onEdit }: EventCardProps) {
  const { t } = useI18n()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const uiStatus = mapEventStatus(event.status, event.startDate)
  const statusStyle = STATUS_STYLES[uiStatus]

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  const coverStyle = {
    ...getCoverStyle(event),
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }

  const isListMode = view === 'list'

  return (
    <article
      className="bg-white rounded-[20px] overflow-hidden transition-[box-shadow,transform] duration-200 flex relative"
      style={{
        border: '1px solid var(--line-2)',
        boxShadow: 'var(--shadow-sm)',
        flexDirection: isListMode ? 'row' : 'column',
      }}
      onMouseEnter={e => e.currentTarget.style.cssText += ';box-shadow:var(--shadow);transform:translateY(-3px)'}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = '' }}
    >
      {/* Cover */}
      <div
        className="relative flex items-end p-3"
        style={{
          ...coverStyle,
          height: isListMode ? 'auto' : '150px',
          minHeight: isListMode ? '130px' : undefined,
          width: isListMode ? 'clamp(110px,28%,230px)' : 'auto',
          flexShrink: isListMode ? 0 : undefined,
        }}
      >
        {/* Overlay gradient */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(20,8,30,.55),transparent 60%)' }} />

        {/* Checkbox */}
        <button
          className="absolute top-3 left-3 z-10 w-6 h-6 rounded-[7px] flex items-center justify-center transition-opacity"
          style={{
            border: '2px solid #fff',
            background: selected ? GRAD : 'rgba(255,255,255,.25)',
            backdropFilter: 'blur(4px)',
            opacity: selected ? 1 : undefined,
          }}
          onClick={() => onSelect(event.id)}
        >
          {selected && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          )}
        </button>

        {/* Status badge */}
        <span
          className="absolute top-3 left-10 z-10 text-[10.5px] font-extrabold tracking-[.04em] uppercase px-2.75 py-1.25 rounded-full flex items-center gap-1.25"
          style={{ background: statusStyle.bg, color: statusStyle.color }}
        >
          {uiStatus === 'ativo' && (
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: 'var(--green)', animation: 'pulse 1.3s infinite' }}
            />
          )}
          {STATUS_LABELS[uiStatus]}
        </span>

        {/* 3-dot menu */}
        <div className="absolute top-2.5 right-2.5 z-20" ref={menuRef}>
          <button
            className="w-8.5 h-8.5 rounded-[10px] flex items-center justify-center transition-colors"
            style={{ background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(6px)', boxShadow: 'var(--shadow-sm)' }}
            onClick={() => setMenuOpen(v => !v)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
            </svg>
          </button>
          {menuOpen && (
            <div
              className="absolute top-11 right-0 z-20 bg-white rounded-[14px] p-1.5 min-w-51.5"
              style={{ border: '1px solid var(--line)', boxShadow: 'var(--shadow)' }}
            >
              {[
                { label: t('myEvents.card.edit'), icon: 'edit', act: 'edit' },
                { label: t('myEvents.card.boost'), icon: 'trend', act: 'boost', disabled: true },
                { label: t('myEvents.card.manageComments'), icon: 'comment', act: 'cmt' },
                { label: t('myEvents.card.viewActivities'), icon: 'eye', act: 'activities' },
                { label: t('myEvents.card.duplicate'), icon: 'copy', act: 'dup', disabled: true },
              ].map(item => (
                <button
                  key={item.act}
                  disabled={item.disabled}
                  className="w-full flex items-center gap-2.75 px-2.75 py-2.5 rounded-[10px] font-bold text-[14px] text-left transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#FBF4FA]"
                  style={{ color: 'var(--ink-soft)' }}
                  onClick={() => {
                    setMenuOpen(false)
                    if (item.act === 'edit') onEdit(event)
                    if (item.act === 'cmt') onComments(event)
                    if (item.act === 'activities') onActivities(event)
                  }}
                >
                  <MenuIcon name={item.icon} />
                  {item.label}
                </button>
              ))}
              <div className="h-px my-1.25 mx-1" style={{ background: 'var(--line-2)' }} />
              <button
                className="w-full flex items-center gap-2.75 px-2.75 py-2.5 rounded-[10px] font-bold text-[14px] text-left transition-colors hover:bg-[#FBF4FA]"
                style={{ color: 'var(--ink-soft)' }}
                onClick={() => { setMenuOpen(false); onArchive(event) }}
              >
                <MenuIcon name="archive" />{t('myEvents.card.archive')}
              </button>
              <button
                className="w-full flex items-center gap-2.75 px-2.75 py-2.5 rounded-[10px] font-bold text-[14px] text-left transition-colors hover:bg-[#FFF0F3]"
                style={{ color: 'var(--red, #E0476B)' }}
                onClick={() => { setMenuOpen(false); onDelete(event) }}
              >
                <MenuIcon name="trash" />{t('myEvents.card.delete')}
              </button>
            </div>
          )}
        </div>

        {/* Title overlay */}
        <div className="relative z-2">
          <h3
            className="font-extrabold text-[21px] leading-[1.05] text-white"
            style={{ fontFamily: 'var(--font-bricolage)', textShadow: '0 3px 14px rgba(0,0,0,.4)' }}
          >
            {event.title}
          </h3>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-3 flex-1 p-[16px_18px]" style={{ padding: isListMode ? '18px 20px' : '16px 18px' }}>
        {/* Meta */}
        <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 font-semibold text-[13px]" style={{ color: 'var(--ink-soft)' }}>
          <span className="flex items-center gap-1.5">📅 {formatEventDate(event.startDate)}</span>
          <span className="flex items-center gap-1.5">📍 {event.location}</span>
        </div>

        {/* Interest chips */}
        {event.eventInterests.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {event.eventInterests.map(ei => (
              <span
                key={ei.interestId}
                className="text-[10.5px] font-extrabold uppercase tracking-[.03em] px-2.25 py-0.75 rounded-[7px]"
                style={{ color: 'var(--pink)', background: '#FFEDF4' }}
              >
                {ei.interest.name}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div
          className="grid grid-cols-4 gap-2 py-3"
          style={{ borderTop: '1px solid var(--line-2)', borderBottom: '1px solid var(--line-2)' }}
        >
          {[
            { val: event.viewCount > 0 ? fmtNum(event.viewCount) : '—', label: t('myEvents.card.views') },
            { val: event._count.likes > 0 ? fmtNum(event._count.likes) : '—', label: t('myEvents.card.likes') },
            { val: event._count.attendances > 0 ? fmtNum(event._count.attendances) : '—', label: t('myEvents.card.attendances') },
            { val: event.shareCount > 0 ? fmtNum(event.shareCount) : '—', label: t('myEvents.card.shares') },
          ].map(s => (
            <div key={s.label} className="text-center">
              <b className="block text-[15px] leading-none" style={{ fontFamily: 'var(--font-bricolage)' }}>{s.val}</b>
              <small className="font-bold text-[11px]" style={{ color: 'var(--wp-muted)' }}>{s.label}</small>
            </div>
          ))}
        </div>

        {/* Popularity bar or status message */}
        {uiStatus === 'ativo' ? (
          <div className="flex items-center gap-2.5 text-[12.5px] font-bold" style={{ color: 'var(--ink-soft)' }}>
            <div className="flex-1 h-1.75 rounded-full overflow-hidden" style={{ background: '#F1ECF3' }}>
              <div className="h-full rounded-full" style={{ width: `${popularityPct}%`, background: GRAD }} />
            </div>
            <span style={{ color: 'var(--pink)', fontFamily: 'var(--font-bricolage)', whiteSpace: 'nowrap' }}>
              pop. {popularityPct}
            </span>
          </div>
        ) : (
          <div className="text-[12.5px] font-bold" style={{ color: 'var(--ink-soft)' }}>
            {POPULARITY_MSG[uiStatus]}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <button
            className="flex items-center gap-1.5 font-extrabold text-[13px] px-2.75 py-2 rounded-[11px] transition-colors"
            style={{ border: '1.5px solid var(--line)', color: 'var(--ink-soft)' }}
            onClick={() => onComments(event)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M21 15a4 4 0 01-4 4H8l-5 4V7a4 4 0 014-4h10a4 4 0 014 4z" />
            </svg>
            {event._count.comments}
          </button>
          <button
            className="ml-auto flex items-center gap-1.75 font-extrabold text-[13px] text-white px-4 py-2.25 rounded-[11px] transition-transform hover:-translate-y-0.5"
            style={{ background: GRAD, boxShadow: '0 10px 20px -12px rgba(240,48,154,.7)' }}
            onClick={() => onEdit(event)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" />
            </svg>
            {t('myEvents.card.editShort')}
          </button>
        </div>
      </div>
    </article>
  )
}

function fmtNum(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace('.', ',')}k`
  return String(n)
}

function MenuIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    eye: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>,
    edit: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg>,
    trend: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 17l6-6 4 4 8-8M21 7v5h-5"/></svg>,
    comment: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 15a4 4 0 01-4 4H8l-5 4V7a4 4 0 014-4h10a4 4 0 014 4z"/></svg>,
    copy: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 012-2h10"/></svg>,
    archive: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="3" width="18" height="5" rx="1"/><path d="M5 8v11a2 2 0 002 2h10a2 2 0 002-2V8M10 12h4"/></svg>,
    trash: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>,
  }
  return <span className="flex-none">{icons[name]}</span>
}
