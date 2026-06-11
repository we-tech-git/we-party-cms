'use client'

import { useAuthStore } from '@/stores/auth.store'
import { GRAD } from '@/lib/brand'
import { KpiCard } from '@/components/dashboard/kpi-card'
import { SpotlightCard } from '@/components/dashboard/spotlight-card'
import { ReachChart } from '@/components/dashboard/reach-chart'
import { EngagementFunnel } from '@/components/dashboard/engagement-funnel'
import { EventRow } from '@/components/dashboard/event-row'
import { AiSuggestions } from '@/components/dashboard/ai-suggestions'
import { ActivityInbox } from '@/components/dashboard/activity-inbox'

const kpis = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <circle cx="9" cy="8" r="3.2" /><path d="M3 20v-1a6 6 0 0112 0v1M16 5a3.2 3.2 0 010 6M21 20v-1a6 6 0 00-4-5.6" />
      </svg>
    ),
    iconBg: '#EEEAFF', iconColor: 'var(--violet)',
    value: '38,2k', label: 'Pessoas alcançadas', trend: '22%',
    spark: [
      { x: 0, y: 34 }, { x: 15, y: 30 }, { x: 30, y: 32 }, { x: 45, y: 22 }, { x: 60, y: 24 }, { x: 75, y: 12 }, { x: 90, y: 8 },
    ],
    sparkColor: '#7C5CFF',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M3 17l6-6 4 4 8-8M21 7v5h-5" />
      </svg>
    ),
    iconBg: '#FFEDD9', iconColor: 'var(--amber)',
    value: '128k', label: 'Impressões na descoberta', trend: '31%',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" />
      </svg>
    ),
    iconBg: '#E6F1FF', iconColor: 'var(--blue)',
    value: '45.892', label: 'Visualizações', trend: '12,5%',
    spark: [
      { x: 0, y: 30 }, { x: 15, y: 26 }, { x: 30, y: 28 }, { x: 45, y: 18 }, { x: 60, y: 20 }, { x: 75, y: 14 }, { x: 90, y: 10 },
    ],
    sparkColor: '#3E7BFB',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21s-7.5-4.6-10-9C.6 9 2 5 5.5 5 8 5 9.4 6.6 12 9c2.6-2.4 4-4 6.5-4C22 5 23.4 9 22 12c-2.5 4.4-10 9-10 9z" />
      </svg>
    ),
    iconBg: '#FFE9F2', iconColor: 'var(--pink)',
    value: '3.218', label: 'Curtidas', trend: '42%',
  },
]

const spotlightStats = [
  {
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>,
    iconBg: '#E6F1FF', iconColor: 'var(--blue)', value: '12,1k', label: 'views',
  },
  {
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.6-10-9C.6 9 2 5 5.5 5 8 5 9.4 6.6 12 9c2.6-2.4 4-4 6.5-4C22 5 23.4 9 22 12c-2.5 4.4-10 9-10 9z" /></svg>,
    iconBg: '#FFE9F2', iconColor: 'var(--pink)', value: '1.918', label: 'curtidas',
  },
  {
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M20 6L9 17l-5-5" /></svg>,
    iconBg: '#EEEAFF', iconColor: 'var(--violet)', value: '820', label: 'confirmados',
  },
  {
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" /></svg>,
    iconBg: '#E6FBF3', iconColor: 'var(--green)', value: '410', label: 'compart.',
  },
]

const events = [
  { day: '25', month: 'Jan', name: 'Sunset Beach Party', status: 'ativo' as const, location: 'Copacabana', views: '12,1k', likes: '1.918', confirmed: '820', popularityPct: 87, popularityLabel: 'popularidade 87', rankLabel: '#3 no feed' },
  { day: '02', month: 'Fev', name: 'Neon Night', status: 'rascunho' as const, location: 'Club XYZ', views: '6,2k', likes: '410', confirmed: '188', popularityPct: 48, popularityLabel: 'popularidade 48', rankLabel: 'em crescimento' },
  { day: '15', month: 'Fev', name: 'Carnival Pre-Party', status: 'agendado' as const, location: 'Arena Central', views: '', likes: '', confirmed: '', popularityPct: 3, popularityLabel: 'sem alcance', rankLabel: 'publique →' },
]

export default function ProducerDashboard() {
  const user = useAuthStore((s) => s.user)
  const initial = (user?.name ?? 'P')[0].toUpperCase()

  return (
    <div className="flex flex-col gap-5">
      {/* Greeting */}
      <div className="flex items-center gap-[18px] flex-wrap">
        <div
          className="w-16 h-16 rounded-[20px] grid place-items-center text-white font-extrabold text-[26px] border-[3px] border-white flex-none"
          style={{ background: 'linear-gradient(135deg,#7b5cff,#c54bff)', boxShadow: 'var(--shadow)', fontFamily: 'var(--font-bricolage)' }}
        >
          {initial}
        </div>
        <div>
          <h1 className="font-extrabold text-[30px] leading-[1.05]" style={{ fontFamily: 'var(--font-bricolage)' }}>
            Bem-vindo,{' '}
            <span style={{ background: 'linear-gradient(120deg,var(--violet),var(--pink))', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
              {user?.name?.split(' ')[0] ?? 'Produtor'}
            </span>! 👋
          </h1>
          <p className="font-semibold mt-0.5" style={{ color: 'var(--ink-soft)' }}>
            Seus eventos alcançaram <strong>38,2 mil pessoas</strong> esta semana — 22% a mais que na anterior 🚀
          </p>
        </div>
        <div className="ml-auto flex gap-2.5 items-center flex-wrap">
          <div
            className="flex items-center gap-2 rounded-[13px] px-[15px] py-[11px] font-bold text-[14px]"
            style={{ background: '#fff', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="3" y="4" width="18" height="18" rx="3" /><path d="M3 9h18M8 2v4M16 2v4" />
            </svg>
            Terça, 10 de junho de 2026
          </div>
          <button
            className="flex items-center gap-2 rounded-[14px] px-5 py-[13px] font-extrabold transition hover:border-[var(--pink)] hover:text-[var(--pink)]"
            style={{ background: '#fff', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18M3 9h6" />
            </svg>
            Arquivados
          </button>
          <button
            className="flex items-center gap-2 rounded-[14px] px-5 py-[13px] font-extrabold text-white transition hover:-translate-y-0.5"
            style={{ background: GRAD, boxShadow: '0 14px 28px -14px rgba(240,48,154,.7)' }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Criar evento
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4 max-[1180px]:grid-cols-2">
        {kpis.map((k, i) => (
          <KpiCard key={i} {...k} />
        ))}
      </div>

      {/* Content grid */}
      <div className="grid gap-5 max-[1180px]:grid-cols-1" style={{ gridTemplateColumns: 'minmax(0,1fr) 372px' }}>
        {/* Left column */}
        <div className="flex flex-col gap-5 min-w-0">
          <SpotlightCard
            eventName="Sunset Beach Party"
            location="Copacabana"
            date="25 Jan"
            audience="público 18–35"
            popularityScore={87}
            reachCount="28,4k"
            stats={spotlightStats}
          />
          <ReachChart />
          <EngagementFunnel />

          {/* Events list card */}
          <div
            className="rounded-[var(--r)] px-6 py-[22px]"
            style={{ background: '#fff', border: '1px solid var(--line-2)', boxShadow: 'var(--shadow-sm)' }}
          >
            <div className="flex items-center gap-[11px] mb-4">
              <span
                className="w-[38px] h-[38px] rounded-[12px] grid place-items-center flex-none"
                style={{ background: '#E6F1FF', color: 'var(--blue)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect x="3" y="4" width="18" height="18" rx="3" /><path d="M3 9h18M8 2v4M16 2v4" />
                </svg>
              </span>
              <h3 className="font-bold text-[18px]" style={{ fontFamily: 'var(--font-bricolage)' }}>
                Seus eventos
              </h3>
              <button className="ml-auto font-extrabold text-[13px]" style={{ color: 'var(--pink)' }}>
                Ver todos
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {events.map((ev, i) => (
                <EventRow key={i} {...ev} />
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5 min-w-0">
          <AiSuggestions />
          <ActivityInbox />
        </div>
      </div>
    </div>
  )
}
