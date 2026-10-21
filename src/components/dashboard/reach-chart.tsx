'use client'

import { useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { EmptyState } from '@/components/cms/empty-state'
import { Panel, PanelHeader } from '@/components/cms/panel'
import { PillTabs } from '@/components/ui/tabs'
import type { ProducerDashboardGrowthPoint } from '@/types/events.types'

const PERIODS = ['7D', '30D', '90D', '1A'] as const
type Period = (typeof PERIODS)[number]

const W = 640
const H = 190
const TOP = 14

function computePoints(vals: number[]) {
  const max = Math.max(...vals)
  const min = Math.min(...vals)
  const span = max - min || 1
  const n = vals.length
  return vals.map((v, i) => ({
    x: i * W / (n - 1),
    y: TOP + (H - TOP) * (1 - (v - min) / span),
  }))
}

function smoothPath(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return ''
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i - 1] ?? pts[i]
    const b = pts[i]
    const c = pts[i + 1]
    const e = pts[i + 2] ?? c
    d += ` C ${b.x + (c.x - a.x) / 6} ${b.y + (c.y - a.y) / 6} ${c.x - (e.x - b.x) / 6} ${c.y - (e.y - b.y) / 6} ${c.x} ${c.y}`
  }
  return d
}

function formatTotal(total: number): string {
  if (total >= 1_000_000) return `${(total / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (total >= 1_000) return `${(total / 1_000).toFixed(1).replace('.', ',')}k`
  return String(total)
}

type ReachChartProps = {
  growthChart?: ProducerDashboardGrowthPoint[]
  isLoading?: boolean
}

// Só 30D tem endpoint real (GET /events/my-dashboard); os demais períodos mostram estado vazio.
type ChartMeta = { vals: number[]; total: string; unit: string; gr: string } | null

/** Crescimento de alcance (Figma: Início › painel de gráfico). Linha em gradiente da marca, sem pontos. */
export function ReachChart({ growthChart, isLoading }: ReachChartProps) {
  const [period, setPeriod] = useState<Period>('30D')

  const getValsAndMeta = (): ChartMeta => {
    if (period !== '30D') return null
    if (!growthChart || growthChart.length === 0) return null
    const vals = growthChart.map((p) => p.peopleReached)
    const total = vals.reduce((s, v) => s + v, 0)
    return { vals, total: formatTotal(total), unit: 'pessoas', gr: 'últimos 30 dias' }
  }

  const meta = getValsAndMeta()
  const pts = meta ? computePoints(meta.vals) : []
  const linePath = meta ? smoothPath(pts) : ''
  const fillPath = meta ? linePath + ` L ${W} ${H + 18} L 0 ${H + 18} Z` : ''

  return (
    <Panel as="section" className="flex flex-col gap-4" data-testid="reach-chart">
      <PanelHeader title="Crescimento de alcance" icon={<TrendingUp />} />

      <PillTabs
        aria-label="Período"
        items={PERIODS.map((p) => ({ value: p, label: p }))}
        value={period}
        onValueChange={setPeriod}
        className="self-start"
      />

      <div className="flex items-end gap-2">
        <span className="font-heading text-[30px] leading-none font-bold text-ink">{meta ? meta.total : '—'}</span>
        <span className="pb-0.5 text-[13px] text-wp-sub">{meta ? `${meta.unit} · ${meta.gr}` : ''}</span>
      </div>

      {isLoading && <p className="py-6 text-center text-[13.5px] text-wp-sub">Carregando métricas…</p>}

      {!isLoading && !meta && (
        <EmptyState
          icon={<TrendingUp />}
          title="Sem dados para este período"
          description={period === '30D' ? 'Ainda não há histórico suficiente.' : 'Disponível em breve para este período.'}
        />
      )}

      {!isLoading && meta && (
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="block h-52.5 w-full" role="img" aria-label="Gráfico de alcance">
          <defs>
            <linearGradient id="wp-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#FF5F8F" stopOpacity="0.18" />
              <stop offset="1" stopColor="#FF5F8F" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="wp-ln" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#FF9A4D" />
              <stop offset="1" stopColor="#FF5F8F" />
            </linearGradient>
          </defs>
          <g stroke="#F6E1E9" strokeWidth="1">
            {[40, 90, 140, 190].map((y) => (
              <line key={y} x1="0" y1={y} x2={W} y2={y} />
            ))}
          </g>
          <path d={fillPath} fill="url(#wp-fill)" />
          <path d={linePath} fill="none" stroke="url(#wp-ln)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </Panel>
  )
}
