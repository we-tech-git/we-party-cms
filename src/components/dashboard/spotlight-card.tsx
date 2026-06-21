import Link from 'next/link'
import { GRAD } from '@/lib/brand'
import type { TopEventDto } from '@/types/events.types'

type SpotlightStat = {
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  value: string
  label: string
}

type SpotlightCardProps = {
  topEvent?: TopEventDto | null
}

function fmtReach(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace('.', ',')}k`
  return String(n)
}

function fmtNum(n: number): string {
  if (n >= 1_000) return n.toLocaleString('pt-BR')
  return String(n)
}

function formatEventDate(iso: string): string {
  const d = new Date(iso)
  const day = d.getDate()
  const month = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
  return `${day} ${month.charAt(0).toUpperCase() + month.slice(1)}`
}

function engagementScore(ev: TopEventDto): number {
  const engagement = ev.totalLikes + ev.totalComments + ev.totalSaves + ev.totalConfirmed
  return Math.min(100, Math.round((engagement / Math.max(ev.viewCount, 1)) * 100))
}

export function SpotlightCard({ topEvent }: SpotlightCardProps) {
  if (!topEvent) {
    return (
      <div
        className="overflow-hidden rounded-(--r) flex flex-col items-center justify-center gap-4 py-14 px-6 text-center"
        style={{ background: '#fff', border: '1px solid var(--line-2)', boxShadow: 'var(--shadow-sm)' }}
      >
        <div className="text-[44px]">🎉</div>
        <div>
          <p className="font-extrabold text-[18px]" style={{ fontFamily: 'var(--font-bricolage)' }}>
            Nenhum evento em destaque ainda
          </p>
          <p className="font-semibold text-[14px] mt-1" style={{ color: 'var(--wp-muted)' }}>
            Crie seu primeiro evento e comece a acumular alcance
          </p>
        </div>
        <Link
          href="/cms/producer/new-event"
          className="flex items-center gap-2 rounded-[14px] px-5 py-3 font-extrabold text-white"
          style={{ background: GRAD, boxShadow: '0 12px 24px -12px rgba(240,48,154,.65)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Criar evento
        </Link>
      </div>
    )
  }

  const score = engagementScore(topEvent)
  const reachCount = fmtReach(topEvent.totalPeopleReached)
  const date = formatEventDate(topEvent.startDate)

  const stats: SpotlightStat[] = [
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>,
      iconBg: '#E6F1FF', iconColor: 'var(--blue)', value: fmtNum(topEvent.viewCount), label: 'views',
    },
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.6-10-9C.6 9 2 5 5.5 5 8 5 9.4 6.6 12 9c2.6-2.4 4-4 6.5-4C22 5 23.4 9 22 12c-2.5 4.4-10 9-10 9z" /></svg>,
      iconBg: '#FFE9F2', iconColor: 'var(--pink)', value: fmtNum(topEvent.totalLikes), label: 'curtidas',
    },
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M20 6L9 17l-5-5" /></svg>,
      iconBg: '#EEEAFF', iconColor: 'var(--violet)', value: fmtNum(topEvent.totalConfirmed), label: 'confirmados',
    },
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" /></svg>,
      iconBg: '#E6FBF3', iconColor: 'var(--green)', value: fmtNum(topEvent.shareCount), label: 'compart.',
    },
  ]

  return (
    <div
      className="overflow-hidden rounded-(--r)"
      style={{ background: '#fff', border: '1px solid var(--line-2)', boxShadow: 'var(--shadow)' }}
    >
      {/* Hero banner */}
      <div
        className="relative h-39.5 flex items-end px-5.5 py-4.5"
        style={{
          background: 'linear-gradient(to top,rgba(20,8,30,.7),transparent 70%), linear-gradient(120deg,#ff7e3d,#ff4d8d 55%,#a23bd6)',
        }}
      >
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(400px 160px at 80% -20%,rgba(255,255,255,.35),transparent)' }}
        />

        <div className="absolute top-4 left-4.5 flex gap-2 z-10">
          <span
            className="text-[11px] font-extrabold tracking-[.04em] px-3 py-1.5 rounded-full uppercase flex items-center gap-1.5 bg-white"
            style={{ color: 'var(--pink)' }}
          >
            <span className="w-1.75 h-1.75 rounded-full animate-pulse" style={{ background: 'var(--pink)' }} />
            Em alta agora
          </span>
        </div>

        <div className="relative z-10 text-white">
          <div className="text-[12px] font-extrabold tracking-widest uppercase opacity-85">Seu evento em destaque</div>
          <h2
            className="font-extrabold text-[28px] leading-[1.05]"
            style={{ fontFamily: 'var(--font-bricolage)', textShadow: '0 3px 18px rgba(0,0,0,.35)' }}
          >
            {topEvent.title}
          </h2>
          <div className="flex gap-4 mt-1.5 font-semibold text-[13.5px] opacity-95">
            <span>📍 {topEvent.location}</span>
            <span>📅 {date}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-5.5 py-5">
        <div className="flex items-center gap-4.5 flex-wrap">
          <div className="flex-1 min-w-57.5">
            <div className="flex justify-between font-bold text-[14px] mb-2">
              <span>Índice de popularidade</span>
              <span style={{ color: 'var(--pink)', fontFamily: 'var(--font-bricolage)' }}>
                {score}/100
              </span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: '#F1ECF3' }}>
              <div className="h-full rounded-full" style={{ width: `${score}%`, background: GRAD }} />
            </div>
            <p className="text-[12.5px] font-semibold mt-1.5" style={{ color: 'var(--wp-muted)' }}>
              Taxa de engajamento sobre visualizações
            </p>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-extrabold tracking-[.08em] uppercase" style={{ color: 'var(--wp-muted)' }}>
              Alcance
            </div>
            <div
              className="text-[26px] font-extrabold leading-none"
              style={{ fontFamily: 'var(--font-bricolage)', color: 'var(--violet)' }}
            >
              {reachCount}
            </div>
            <div className="text-[12px] font-semibold" style={{ color: 'var(--wp-muted)' }}>pessoas</div>
          </div>
        </div>

        <div
          className="grid grid-cols-4 gap-3 mt-5 pt-4.5"
          style={{ borderTop: '1px solid var(--line-2)' }}
        >
          {stats.map((s, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <span
                className="w-9.5 h-9.5 rounded-[11px] grid place-items-center flex-none"
                style={{ background: s.iconBg, color: s.iconColor }}
              >
                {s.icon}
              </span>
              <div>
                <div className="font-extrabold text-[17px] leading-none" style={{ fontFamily: 'var(--font-bricolage)' }}>
                  {s.value}
                </div>
                <div className="text-[12px] font-semibold" style={{ color: 'var(--wp-muted)' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2.5 mt-4.5 flex-wrap">
          <button
            className="flex items-center gap-2 border-[1.5px] rounded-[13px] px-4 py-2.75 font-extrabold text-[14px] text-white transition hover:-translate-y-0.5"
            style={{ background: GRAD, borderColor: 'transparent', boxShadow: '0 12px 24px -12px rgba(240,48,154,.7)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M3 17l6-6 4 4 8-8M21 7v5h-5" />
            </svg>
            Impulsionar alcance
          </button>
          <Link
            href={`/cms/producer/edit-event/${topEvent.id}`}
            className="flex items-center gap-2 border-[1.5px] rounded-[13px] px-4 py-2.75 font-extrabold text-[14px] transition hover:border-pink hover:text-pink"
            style={{ border: '1.5px solid var(--line)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" />
            </svg>
            Editar
          </Link>
        </div>
      </div>
    </div>
  )
}
