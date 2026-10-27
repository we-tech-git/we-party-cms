import { Funnel } from 'lucide-react'
import { Panel, PanelHeader } from '@/components/cms/panel'

type FunnelStep = {
  value: string
  label: string
  widthPct: number
  bar: string
  text: string
  conversion?: string
  conversionValue?: string
}

type EngagementFunnelProps = {
  totalViews?: number
  totalLikes?: number
  totalConfirmed?: number
  totalShares?: number
}

function fmt(n?: number): string {
  if (n === undefined) return '—'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.', ',') + 'M'
  if (n >= 1_000) return n.toLocaleString('pt-BR')
  return String(n)
}

function pct(a?: number, b?: number): string {
  if (!a || !b) return '—'
  return ((a / b) * 100).toFixed(1).replace('.', ',') + '%'
}

/** Jornada de engajamento (Figma: barras tintadas com valor colorido — sem degradês saturados). */
export function EngagementFunnel({ totalViews, totalLikes, totalConfirmed, totalShares }: EngagementFunnelProps) {
  const isLoading = totalViews === undefined && totalLikes === undefined && totalConfirmed === undefined && totalShares === undefined

  const views = totalViews ?? 0
  const likes = totalLikes ?? 0
  const confirmed = totalConfirmed ?? 0
  const shares = totalShares ?? 0
  const maxVal = Math.max(views, likes, confirmed, shares, 1)

  const steps: FunnelStep[] = [
    { value: fmt(views), label: 'Visualizações', widthPct: Math.round((views / maxVal) * 100), bar: 'bg-tint-purple', text: 'text-wp-purple' },
    { value: fmt(likes), label: 'Curtidas', widthPct: Math.round((likes / maxVal) * 100), bar: 'bg-tint-pink', text: 'text-wp-magenta', conversion: 'conversão', conversionValue: pct(likes, views) },
    { value: fmt(totalConfirmed), label: 'Confirmados', widthPct: Math.round((confirmed / maxVal) * 100), bar: 'bg-tint-green', text: 'text-wp-green', conversion: 'conversão', conversionValue: pct(confirmed, likes) },
    { value: fmt(shares), label: 'Compartilhamentos', widthPct: Math.round((shares / maxVal) * 100), bar: 'bg-tint-orange', text: 'text-wp-orange', conversion: 'viralização', conversionValue: pct(shares, confirmed) },
  ]

  return (
    <Panel as="section" className="flex flex-col gap-4" data-testid="engagement-funnel">
      <PanelHeader title="Jornada de engajamento" icon={<Funnel />} tone="pink" action="onde melhorar →" />

      {isLoading && <p className="py-6 text-center text-[13.5px] text-wp-sub">Carregando métricas…</p>}

      {!isLoading && (
        <div className="flex flex-col gap-2.5">
          {steps.map((step) => (
            <div key={step.label} className="flex items-center gap-3.5">
              <div
                className={`flex h-10 min-w-30 items-center gap-2.5 overflow-hidden rounded-xl px-4 ${step.bar} ${step.text}`}
                style={{ width: `${step.widthPct}%` }}
              >
                <span className="font-heading text-lg font-bold">{step.value}</span>
                <span className="truncate text-xs font-semibold">{step.label}</span>
              </div>
              {step.conversion && (
                <span className="text-[13px] whitespace-nowrap text-wp-sub">
                  {step.conversion} <strong className="text-wp-green">{step.conversionValue}</strong>
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </Panel>
  )
}
