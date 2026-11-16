'use client'

import { isAxiosError } from 'axios'
import { useRouter } from 'next/navigation'
import { ChartNoAxesColumn, Funnel } from 'lucide-react'
import { BackButton } from '@/components/cms/back-button'
import { EmptyState } from '@/components/cms/empty-state'
import { PageHeader } from '@/components/cms/page-header'
import { Panel, PanelHeader } from '@/components/cms/panel'
import { Button } from '@/components/ui/button'
import { FunnelBars, type FunnelStep } from '@/components/dashboard/engagement-funnel'
import { useEventFunnel } from '@/hooks/use-event-funnel'
import { useI18n } from '@/i18n/context'
import type { EventFunnelDto } from '@/types/events.types'

const MY_EVENTS = '/cms/producer/my-events'

/** Fração do backend → "25,0%". `null` (sem base de cálculo) → "—", nunca "0,0%". */
function fmtRate(r: number | null): string {
  if (r === null) return '—'
  return (r * 100).toFixed(1).replace('.', ',') + '%'
}

function fmtCount(n: number): string {
  return n.toLocaleString('pt-BR')
}

function isEmptyFunnel(f: EventFunnelDto): boolean {
  return f.views + f.likes + f.favorites + f.interested + f.going + f.shares === 0
}

export function InsightsView({ eventId }: { eventId: string }) {
  const { t } = useI18n()
  const router = useRouter()
  const { data, isLoading, isError, error, refetch, isFetching } = useEventFunnel(eventId)

  const status = isAxiosError(error) ? error.response?.status : undefined
  const noAccess = status === 403 || status === 404

  function buildSteps(f: EventFunnelDto): FunnelStep[] {
    const max = Math.max(f.views, f.likes, f.favorites, f.interested, f.going, f.shares, 1)
    const w = (n: number) => Math.round((n / max) * 100)
    const c = f.conversions
    return [
      { testId: 'insights-step-views', rateTestId: 'insights-rate-views', value: fmtCount(f.views), label: t('insights.stepViews'), widthPct: w(f.views), bar: 'bg-tint-purple', text: 'text-wp-purple' },
      { testId: 'insights-step-likes', rateTestId: 'insights-rate-likes', value: fmtCount(f.likes), label: t('insights.stepLikes'), widthPct: w(f.likes), bar: 'bg-tint-pink', text: 'text-wp-magenta', conversion: t('insights.ofViews'), conversionValue: fmtRate(c.likesPerView) },
      { testId: 'insights-step-favorites', rateTestId: 'insights-rate-favorites', value: fmtCount(f.favorites), label: t('insights.stepFavorites'), widthPct: w(f.favorites), bar: 'bg-tint-orange', text: 'text-wp-orange', conversion: t('insights.ofViews'), conversionValue: fmtRate(c.favoritesPerView) },
      { testId: 'insights-step-interested', rateTestId: 'insights-rate-interested', value: fmtCount(f.interested), label: t('insights.stepInterested'), widthPct: w(f.interested), bar: 'bg-tint-purple', text: 'text-wp-purple', conversion: t('insights.ofViews'), conversionValue: fmtRate(c.interestedPerView) },
      { testId: 'insights-step-going', rateTestId: 'insights-rate-going', value: fmtCount(f.going), label: t('insights.stepGoing'), widthPct: w(f.going), bar: 'bg-tint-green', text: 'text-wp-green', conversion: t('insights.ofIntent'), conversionValue: fmtRate(c.confirmationRate) },
      { testId: 'insights-step-shares', rateTestId: 'insights-rate-shares', value: fmtCount(f.shares), label: t('insights.stepShares'), widthPct: w(f.shares), bar: 'bg-tint-orange', text: 'text-wp-orange', conversion: t('insights.ofViews'), conversionValue: fmtRate(c.sharesPerView) },
    ]
  }

  return (
    <div className="flex flex-col gap-5" data-testid="insights-page">
      <BackButton fallback={MY_EVENTS} label={t('insights.backToMyEvents')} />
      <PageHeader title={t('insights.title')} subtitle={t('insights.subtitle')} icon={<ChartNoAxesColumn />} />

      {isLoading && (
        <Panel as="section" data-testid="insights-loading">
          <p className="py-6 text-center text-[13.5px] text-wp-sub">{t('insights.loading')}</p>
        </Panel>
      )}

      {isError && (
        <Panel as="section" className="flex flex-col items-center gap-3 py-8 text-center" data-testid="insights-error">
          <p className="text-[15px] font-bold text-ink">{noAccess ? t('insights.notFound') : t('insights.loadError')}</p>
          {noAccess ? (
            <Button type="button" variant="primary" size="compact" onClick={() => router.push(MY_EVENTS)} data-testid="insights-back">
              {t('insights.backToMyEvents')}
            </Button>
          ) : (
            <Button type="button" variant="primary" size="compact" disabled={isFetching} onClick={() => refetch()} data-testid="insights-retry">
              {t('insights.retry')}
            </Button>
          )}
        </Panel>
      )}

      {data && isEmptyFunnel(data) && (
        <Panel as="section" data-testid="insights-empty">
          <EmptyState icon={<Funnel />} title={t('insights.empty')} description={t('insights.emptyDesc')} className="py-14" />
        </Panel>
      )}

      {data && !isEmptyFunnel(data) && (
        <Panel as="section" className="flex flex-col gap-4">
          <PanelHeader title={t('insights.panelTitle')} icon={<Funnel />} tone="pink" />
          <FunnelBars steps={buildSteps(data)} />
          <p className="text-xs text-wp-sub">{t('insights.viewsNote')}</p>
        </Panel>
      )}
    </div>
  )
}
