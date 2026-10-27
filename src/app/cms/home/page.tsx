'use client'

import { useRouter } from 'next/navigation'
import { Archive, Eye, Heart, Plus, RefreshCw, Share2, Users } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { useI18n } from '@/i18n/context'
import { StatCard } from '@/components/cms/stat-card'
import { Button } from '@/components/ui/button'
import { SpotlightCard } from '@/components/dashboard/spotlight-card'
import { ReachChart } from '@/components/dashboard/reach-chart'
import { EngagementFunnel } from '@/components/dashboard/engagement-funnel'
import { ActiveEvents } from '@/components/dashboard/active-events'
import { AiSuggestions } from '@/components/dashboard/ai-suggestions'
import { ActivityInbox } from '@/components/dashboard/activity-inbox'
import { useProducerDashboard } from '@/hooks/use-producer-dashboard'
import { cn } from '@/lib/utils'

function fmtPeople(n?: number): string {
  if (n === undefined) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.', ',')} milhões`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace('.', ',')} mil`
  return String(n)
}

function fmtKpi(n?: number): string | null {
  // Regra AGENTS.md #3: métrica ausente => "—" (StatCard renderiza null como traço), nunca 0.
  if (n === undefined) return null
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (n >= 1_000) return n.toLocaleString('pt-BR')
  return String(n)
}

/** Início do produtor (Figma: CMS › Produtor › Início). */
export default function ProducerDashboard() {
  const router = useRouter()
  const { t } = useI18n()
  const user = useAuthStore((s) => s.user)
  const { data, isLoading, isFetching, forceRefresh } = useProducerDashboard()

  const firstName = user?.name?.split(' ')[0] ?? t('home.producer')
  const reached = isLoading ? '…' : data?.peopleReached ? t('home.people', { count: fmtPeople(data.peopleReached) }) : null

  // `home.reachLine` traz o marcador {reach}; o trecho em destaque é um nó React (sem HTML injetado).
  const REACH_MARK = '\u0000'
  const [reachBefore, reachAfter] = t('home.reachLine', { reach: REACH_MARK }).split(REACH_MARK)

  const kpis = [
    { icon: <Users />, tone: 'purple' as const, value: isLoading ? '…' : fmtKpi(data?.peopleReached), label: t('home.kpiPeopleReached'), detail: t('home.trend30d'), id: 'people' },
    { icon: <Eye />, tone: 'green' as const, value: isLoading ? '…' : fmtKpi(data?.totalViews), label: t('home.kpiViews'), detail: t('home.trendTotal'), id: 'views' },
    { icon: <Heart />, tone: 'pink' as const, value: isLoading ? '…' : fmtKpi(data?.totalLikes), label: t('home.kpiLikes'), detail: t('home.trendTotal'), id: 'likes' },
    { icon: <Share2 />, tone: 'orange' as const, value: isLoading ? '…' : fmtKpi(data?.totalShares), label: t('home.kpiShares'), detail: t('home.trendTotal'), id: 'shares' },
  ]

  return (
    <div className="flex flex-col gap-6" data-testid="producer-home">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[26px] leading-tight font-bold text-ink sm:text-[30px]" data-testid="home-title">
            {t('home.welcome')} <span className="text-wp-magenta">{firstName}</span>!
          </h1>
          <p className="mt-0.5 text-sm text-wp-sub">
            {reached ? (
              <>
                {reachBefore}
                <strong className="font-semibold text-ink">{reached}</strong>
                {reachAfter}
              </>
            ) : (
              t('home.loadingMetrics')
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button type="button" variant="line" size="compact" onClick={() => forceRefresh()} disabled={isFetching} title={t('home.refreshMetrics')} data-testid="home-refresh">
            <RefreshCw className={cn(isFetching && 'animate-spin')} />
            <span className="hidden sm:inline">{t('home.refreshMetrics')}</span>
          </Button>
          <Button type="button" variant="line" size="compact" onClick={() => router.push('/cms/producer/my-events?filtro=arquivado')} data-testid="home-archived">
            <Archive /> {t('home.archived')}
          </Button>
          <Button type="button" variant="primary" size="md" onClick={() => router.push('/cms/producer/new-event')} data-testid="home-create-event">
            <Plus /> {t('common.createEvent')}
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" data-testid="home-kpis">
        {kpis.map((k) => (
          <StatCard key={k.id} icon={k.icon} tone={k.tone} value={k.value} label={k.label} detail={k.detail} data-testid={`kpi-${k.id}`} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 min-[1181px]:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-6">
          <SpotlightCard topEvent={data?.topEvent ?? null} />
          <ReachChart growthChart={data?.growthChart} isLoading={isLoading} />
          <EngagementFunnel
            totalViews={data?.totalViews}
            totalLikes={data?.totalLikes}
            totalConfirmed={data?.totalConfirmed}
            totalShares={data?.totalShares}
          />
          <ActiveEvents spotlightId={data?.topEvent?.id} isLoading={isLoading} />
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <AiSuggestions />
          <ActivityInbox activities={data?.recentActivities} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}
