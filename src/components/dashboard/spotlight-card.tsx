import { GRAD } from '@/lib/brand'

type SpotlightStat = {
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  value: string
  label: string
}

type SpotlightCardProps = {
  eventName: string
  location: string
  date: string
  audience: string
  popularityScore: number
  reachCount: string
  stats: SpotlightStat[]
}

export function SpotlightCard({ eventName, location, date, audience, popularityScore, reachCount, stats }: SpotlightCardProps) {
  const barWidth = `${popularityScore}%`

  return (
    <div
      className="overflow-hidden rounded-[var(--r)]"
      style={{ background: '#fff', border: '1px solid var(--line-2)', boxShadow: 'var(--shadow)' }}
    >
      {/* Hero banner */}
      <div
        className="relative h-[158px] flex items-end px-[22px] py-[18px]"
        style={{
          background: 'linear-gradient(to top,rgba(20,8,30,.7),transparent 70%), linear-gradient(120deg,#ff7e3d,#ff4d8d 55%,#a23bd6)',
        }}
      >
        {/* Shine overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(400px 160px at 80% -20%,rgba(255,255,255,.35),transparent)' }}
        />

        {/* Badges */}
        <div className="absolute top-4 left-[18px] flex gap-2 z-10">
          <span
            className="text-[11px] font-extrabold tracking-[.04em] px-3 py-1.5 rounded-full uppercase flex items-center gap-1.5 bg-white"
            style={{ color: 'var(--pink)' }}
          >
            <span
              className="w-[7px] h-[7px] rounded-full animate-pulse"
              style={{ background: 'var(--pink)' }}
            />
            Em alta agora
          </span>
          <span
            className="text-[11px] font-extrabold tracking-[.04em] px-3 py-1.5 rounded-full uppercase text-white border border-white/30"
            style={{ background: 'rgba(255,255,255,.2)', backdropFilter: 'blur(6px)' }}
          >
            🔥 #3 na descoberta
          </span>
        </div>

        {/* Title */}
        <div className="relative z-10 text-white">
          <div className="text-[12px] font-extrabold tracking-[.1em] uppercase opacity-85">Seu evento em destaque</div>
          <h2
            className="font-extrabold text-[28px] leading-[1.05]"
            style={{ fontFamily: 'var(--font-bricolage)', textShadow: '0 3px 18px rgba(0,0,0,.35)' }}
          >
            {eventName}
          </h2>
          <div className="flex gap-4 mt-1.5 font-semibold text-[13.5px] opacity-95">
            <span>📍 {location}</span>
            <span>📅 {date}</span>
            <span>👥 {audience}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-[22px] py-5">
        {/* Popularity + reach */}
        <div className="flex items-center gap-[18px] flex-wrap">
          <div className="flex-1 min-w-[230px]">
            <div className="flex justify-between font-bold text-[14px] mb-2">
              <span>Índice de popularidade</span>
              <span style={{ color: 'var(--pink)', fontFamily: 'var(--font-bricolage)' }}>
                {popularityScore}/100
              </span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: '#F1ECF3' }}>
              <div
                className="h-full rounded-full"
                style={{ width: barWidth, background: GRAD }}
              />
            </div>
            <p className="text-[12.5px] font-semibold mt-1.5" style={{ color: 'var(--wp-muted)' }}>
              Entre os <strong>5% mais populares</strong> de {location} esta semana 🔥
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

        {/* Stats row */}
        <div
          className="grid grid-cols-4 gap-3 mt-5 pt-[18px]"
          style={{ borderTop: '1px solid var(--line-2)' }}
        >
          {stats.map((s, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <span
                className="w-[38px] h-[38px] rounded-[11px] grid place-items-center flex-none"
                style={{ background: s.iconBg, color: s.iconColor }}
              >
                {s.icon}
              </span>
              <div>
                <div className="font-extrabold text-[17px] leading-none" style={{ fontFamily: 'var(--font-bricolage)' }}>
                  {s.value}
                </div>
                <div className="text-[12px] font-semibold" style={{ color: 'var(--wp-muted)' }}>
                  {s.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2.5 mt-[18px] flex-wrap">
          <button
            className="flex items-center gap-2 border-[1.5px] rounded-[13px] px-4 py-[11px] font-extrabold text-[14px] text-white transition hover:-translate-y-0.5"
            style={{ background: GRAD, borderColor: 'transparent', boxShadow: '0 12px 24px -12px rgba(240,48,154,.7)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M3 17l6-6 4 4 8-8M21 7v5h-5" />
            </svg>
            Impulsionar alcance
          </button>
          <button
            className="flex items-center gap-2 border-[1.5px] rounded-[13px] px-4 py-[11px] font-extrabold text-[14px] transition hover:border-[var(--pink)] hover:text-[var(--pink)]"
            style={{ border: '1.5px solid var(--line)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M11 4H4v16h16v-7M14 4h6v6M10 14L20 4" />
            </svg>
            Ver página
          </button>
          <button
            className="flex items-center gap-2 border-[1.5px] rounded-[13px] px-4 py-[11px] font-extrabold text-[14px] transition hover:border-[var(--pink)] hover:text-[var(--pink)]"
            style={{ border: '1.5px solid var(--line)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" />
            </svg>
            Editar
          </button>
        </div>
      </div>
    </div>
  )
}
