import { GRAD } from '@/lib/brand'

type EventStatus = 'ativo' | 'rascunho' | 'agendado'

type EventRowProps = {
  day: string
  month: string
  name: string
  status: EventStatus
  location: string
  views: string
  likes: string
  confirmed: string
  popularityPct: number
  popularityLabel: string
  rankLabel: string
}

const statusStyles: Record<EventStatus, { bg: string; color: string; label: string }> = {
  ativo: { bg: '#E6FBF3', color: '#0c9c8c', label: 'Em alta' },
  rascunho: { bg: '#FFF1DD', color: '#E8920C', label: 'Rascunho' },
  agendado: { bg: '#EEEAFF', color: '#7C5CFF', label: 'Agendado' },
}

export function EventRow({ day, month, name, status, location, views, likes, confirmed, popularityPct, popularityLabel, rankLabel }: EventRowProps) {
  const s = statusStyles[status]

  return (
    <div
      className="flex items-center gap-3.5 p-3.5 rounded-[16px] transition hover:shadow-[var(--shadow-sm)] hover:-translate-y-0.5"
      style={{ border: '1px solid var(--line-2)' }}
    >
      {/* Date chip */}
      <div
        className="w-[54px] h-[54px] rounded-[14px] grid place-content-center text-center flex-none text-white"
        style={{ background: 'linear-gradient(150deg,var(--violet),var(--violet-2))' }}
      >
        <div className="font-extrabold text-[20px] leading-none" style={{ fontFamily: 'var(--font-bricolage)' }}>
          {day}
        </div>
        <div className="text-[10px] font-extrabold tracking-[.06em] uppercase opacity-90">
          {month}
        </div>
      </div>

      {/* Meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5">
          <strong className="text-[15px]">{name}</strong>
          <span
            className="text-[10px] font-extrabold tracking-[.04em] uppercase px-2.5 py-0.5 rounded-[8px]"
            style={{ background: s.bg, color: s.color }}
          >
            {s.label}
          </span>
        </div>
        <div
          className="flex gap-3.5 flex-wrap mt-0.5 font-semibold text-[13px]"
          style={{ color: 'var(--wp-muted)' }}
        >
          <span>📍 {location}</span>
          {views && <span>👁 {views}</span>}
          {likes && <span>♥ {likes}</span>}
          {confirmed && <span>✓ {confirmed}</span>}
        </div>
      </div>

      {/* Mini progress */}
      <div className="text-right flex-none">
        <div className="h-[7px] w-[120px] rounded-full overflow-hidden ml-auto" style={{ background: '#F1ECF3' }}>
          <div
            className="h-full rounded-full"
            style={{ width: `${popularityPct}%`, background: GRAD }}
          />
        </div>
        <div className="text-[12px] font-bold mt-1" style={{ color: 'var(--wp-muted)' }}>
          {popularityLabel}
        </div>
        <div
          className="font-extrabold text-[15px] block mt-1"
          style={{ fontFamily: 'var(--font-bricolage)', color: 'var(--pink)' }}
        >
          {rankLabel}
        </div>
      </div>
    </div>
  )
}
