'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'
import { useI18n } from '@/i18n/context'
import { GRAD } from '@/lib/brand'
import { KpiCard } from '@/components/dashboard/kpi-card'
import { SpotlightCard } from '@/components/dashboard/spotlight-card'
import { ReachChart } from '@/components/dashboard/reach-chart'
import { EngagementFunnel } from '@/components/dashboard/engagement-funnel'
import { ActiveEvents } from '@/components/dashboard/active-events'
import { AiSuggestions } from '@/components/dashboard/ai-suggestions'
import { ActivityInbox } from '@/components/dashboard/activity-inbox'
import { UserAvatar } from '@/components/cms/user-avatar'
import { useProducerDashboard } from '@/hooks/use-producer-dashboard'

function fmtPeople(n?: number): string {
  if (n === undefined) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.', ',')} milhões`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace('.', ',')} mil`
  return String(n)
}

function fmtKpi(n?: number): string {
  if (n === undefined) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (n >= 1_000) return n.toLocaleString('pt-BR')
  return String(n)
}


export default function ProducerDashboard() {
  const router = useRouter()
  const { t, locale } = useI18n()
  const user = useAuthStore((s) => s.user)
  const { data, isLoading, isFetching, forceRefresh } = useProducerDashboard()

  // Localized "today" — first letter uppercased for pt-BR weekday/month casing.
  const todayRaw = new Date().toLocaleDateString(locale, {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
  const today = todayRaw.charAt(0).toUpperCase() + todayRaw.slice(1)

  const kpis = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="9" cy="8" r="3.2" /><path d="M3 20v-1a6 6 0 0112 0v1M16 5a3.2 3.2 0 010 6M21 20v-1a6 6 0 00-4-5.6" />
        </svg>
      ),
      iconBg: '#EEEAFF', iconColor: 'var(--violet)',
      value: isLoading ? '…' : fmtKpi(data?.peopleReached),
      label: t('home.kpiPeopleReached'),
      trend: t('home.trend30d'),
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
      label: t('home.kpiViews'),
      trend: t('home.trendTotal'),
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
      label: t('home.kpiLikes'),
      trend: t('home.trendTotal'),
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
        </svg>
      ),
      iconBg: '#E6FBF3', iconColor: 'var(--green)',
      value: isLoading ? '…' : fmtKpi(data?.totalShares),
      label: t('home.kpiShares'),
      trend: t('home.trendTotal'),
    },
  ]

  const greetingReach = isLoading
    ? '…'
    : data?.peopleReached
      ? t('home.people', { count: fmtPeople(data.peopleReached) })
      : null

  return (
    <div className="flex flex-col gap-5">
      {/* Greeting */}
      <div className="flex items-center gap-4.5 flex-wrap">
        <UserAvatar
          name={user?.name ?? ''}
          image={user?.profileImage}
          size={64}
          radius={20}
          className="border-[3px] border-white"
          style={{ boxShadow: 'var(--shadow)' }}
        />
        <div>
          <h1 className="font-extrabold text-[clamp(22px,5vw,30px)] leading-[1.05]" style={{ fontFamily: 'var(--font-bricolage)' }}>
            {t('home.welcome')}{' '}
            <span style={{ background: 'linear-gradient(120deg,var(--violet),var(--pink))', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
              {user?.name?.split(' ')[0] ?? t('home.producer')}
            </span>! 👋
          </h1>
          <p className="font-semibold mt-0.5" style={{ color: 'var(--ink-soft)' }}>
            {greetingReach
              ? <span dangerouslySetInnerHTML={{ __html: t('home.reachLine', { reach: `<strong>${greetingReach}</strong>` }) }} />
              : t('home.loadingMetrics')
            }
          </p>
        </div>
        <div className="ml-auto flex gap-2.5 items-center flex-wrap">
          <div
            className="hidden sm:flex items-center gap-2 rounded-[13px] px-3.75 py-2.75 font-bold text-[14px]"
            style={{ background: '#fff', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="3" y="4" width="18" height="18" rx="3" /><path d="M3 9h18M8 2v4M16 2v4" />
            </svg>
            {today}
          </div>
          <button
            onClick={() => forceRefresh()}
            disabled={isFetching}
            className="flex items-center gap-2 rounded-[14px] px-3.75 py-2.75 font-bold text-[14px] transition hover:border-pink hover:text-pink disabled:opacity-60"
            style={{ background: '#fff', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}
            title={t('home.refreshMetrics')}
          >
            <svg
              width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
              className={isFetching ? 'animate-spin' : ''}
            >
              <path d="M21 12a9 9 0 10-2.6 6.4M21 4v6h-6" />
            </svg>
            <span className="hidden sm:inline">{t('home.refreshMetrics')}</span>
          </button>
          <button
            onClick={() => router.push('/cms/producer/my-events?filtro=arquivado')}
            className="flex items-center gap-2 rounded-[14px] px-5 py-3.25 font-extrabold transition hover:border-pink hover:text-pink"
            style={{ background: '#fff', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18M3 9h6" />
            </svg>
            {t('home.archived')}
          </button>
          <button
            onClick={() => router.push('/cms/producer/new-event')}
            className="flex items-center gap-2 rounded-[14px] px-5 py-3.25 font-extrabold text-white transition hover:-translate-y-0.5"
            style={{ background: GRAD, boxShadow: '0 14px 28px -14px rgba(240,48,154,.7)' }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
              <path d="M12 5v14M5 12h14" />
            </svg>
            {t('common.createEvent')}
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <KpiCard key={i} {...k} />
        ))}
      </div>

      {/* Content grid */}
      <div className="grid gap-5 grid-cols-1 min-[1181px]:grid-cols-[minmax(0,1fr)_372px]">
        {/* Left column */}
        <div className="flex flex-col gap-5 min-w-0">
          <SpotlightCard topEvent={data?.topEvent ?? null} />
          <ReachChart growthChart={data?.growthChart} isLoading={isLoading} />
          <EngagementFunnel
            totalViews={data?.totalViews}
            totalLikes={data?.totalLikes}
            totalAttendances={data?.totalAttendances}
            totalShares={data?.totalShares}
          />

          {/* Active events — full roster, beyond the spotlighted one */}
          <ActiveEvents spotlightId={data?.topEvent?.id} isLoading={isLoading} />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5 min-w-0">
          <AiSuggestions />
          <ActivityInbox activities={data?.recentActivities} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}
