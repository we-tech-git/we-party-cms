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
import { useProducerDashboard } from '@/hooks/use-producer-dashboard'
import type { RecentEventDto } from '@/types/events.types'

function fmtPeople(n?: number): string {
  if (n === undefined) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.', ',')} milhões`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace('.', ',')} mil`
  return String(n)
}

type EventStatus = 'ativo' | 'rascunho' | 'agendado'

function mapRecentEvent(ev: RecentEventDto) {
  const d = new Date(ev.startDate)
  const day = String(d.getDate()).padStart(2, '0')
  const month = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
  const status: EventStatus = d > new Date() ? 'agendado' : 'ativo'
  return {
    day,
    month: month.charAt(0).toUpperCase() + month.slice(1),
    name: ev.title,
    status,
    location: ev.location,
    views: fmtKpi(ev.viewCount),
    likes: fmtKpi(ev.totalLikes),
    confirmed: fmtKpi(ev.totalConfirmed),
  }
}

function fmtKpi(n?: number): string {
  if (n === undefined) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (n >= 1_000) return n.toLocaleString('pt-BR')
  return String(n)
}


export default function ProducerDashboard() {
  const user = useAuthStore((s) => s.user)
  const initial = (user?.name ?? 'P')[0].toUpperCase()
  const { data, isLoading } = useProducerDashboard()

  const kpis = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="9" cy="8" r="3.2" /><path d="M3 20v-1a6 6 0 0112 0v1M16 5a3.2 3.2 0 010 6M21 20v-1a6 6 0 00-4-5.6" />
        </svg>
      ),
      iconBg: '#EEEAFF', iconColor: 'var(--violet)',
      value: isLoading ? '…' : fmtKpi(data?.peopleReached),
      label: 'Pessoas alcançadas',
      trend: '30d',
      spark: data?.growthChart?.map((p, i) => ({ x: i * 15, y: 34 - (p.peopleReached / Math.max(...(data.growthChart.map(g => g.peopleReached)), 1)) * 26 })),
      sparkColor: '#7C5CFF',
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" />
        </svg>
      ),
      iconBg: '#E6F1FF', iconColor: 'var(--blue)',
      value: isLoading ? '…' : fmtKpi(data?.totalViews),
      label: 'Visualizações',
      trend: 'total',
      sparkColor: '#3E7BFB',
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21s-7.5-4.6-10-9C.6 9 2 5 5.5 5 8 5 9.4 6.6 12 9c2.6-2.4 4-4 6.5-4C22 5 23.4 9 22 12c-2.5 4.4-10 9-10 9z" />
        </svg>
      ),
      iconBg: '#FFE9F2', iconColor: 'var(--pink)',
      value: isLoading ? '…' : fmtKpi(data?.totalLikes),
      label: 'Curtidas',
      trend: 'total',
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
        </svg>
      ),
      iconBg: '#E6FBF3', iconColor: 'var(--green)',
      value: isLoading ? '…' : fmtKpi(data?.totalShares),
      label: 'Compartilhamentos',
      trend: 'total',
    },
  ]

  const greetingReach = isLoading
    ? '…'
    : data?.peopleReached
      ? `${fmtPeople(data.peopleReached)} pessoas`
      : null

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
            {greetingReach
              ? <>Seus eventos alcançaram <strong>{greetingReach}</strong> nos últimos 30 dias 🚀</>
              : 'Carregando suas métricas…'
            }
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
            Quarta, 11 de junho de 2026
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
          <SpotlightCard topEvent={data?.topEvent ?? null} />
          <ReachChart growthChart={data?.growthChart} />
          <EngagementFunnel
            totalViews={data?.totalViews}
            totalLikes={data?.totalLikes}
            totalAttendances={data?.totalAttendances}
            totalShares={data?.totalShares}
          />

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
              {data?.recentEvents && data.recentEvents.length > 0 ? (
                data.recentEvents.map((ev) => (
                  <EventRow key={ev.id} {...mapRecentEvent(ev)} />
                ))
              ) : (
                <p className="text-center py-6 font-semibold text-[14px]" style={{ color: 'var(--wp-muted)' }}>
                  {isLoading ? 'Carregando eventos…' : 'Nenhum evento ainda — crie o seu primeiro!'}
                </p>
              )}
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
