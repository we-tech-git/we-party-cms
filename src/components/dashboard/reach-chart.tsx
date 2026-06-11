'use client'

import { useState } from 'react'

const PERIODS = ['7D', '30D', '90D', '1A'] as const
type Period = (typeof PERIODS)[number]

const data: Record<Period, { vals: number[]; total: string; unit: string; gr: string }> = {
  '7D': { vals: [5.2, 5.8, 5.5, 6.9, 7.4, 8.2, 7.0], total: '45,9k', unit: 'pessoas', gr: '▲ 12,5% vs. semana anterior' },
  '30D': { vals: [28, 33, 30, 38, 36, 44, 42, 50, 48, 58], total: '182k', unit: 'pessoas', gr: '▲ 19,4% vs. mês anterior' },
  '90D': { vals: [60, 82, 78, 110, 140, 135, 170], total: '512k', unit: 'pessoas', gr: '▲ 38,6% vs. trimestre anterior' },
  '1A': { vals: [90, 140, 120, 220, 260, 250, 360, 440, 400, 560, 640, 700], total: '3,1M', unit: 'pessoas', gr: '▲ 184% vs. ano anterior' },
}

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

export function ReachChart() {
  const [period, setPeriod] = useState<Period>('7D')
  const { vals, total, unit, gr } = data[period]
  const pts = computePoints(vals)
  const linePath = smoothPath(pts)
  const fillPath = linePath + ` L ${W} ${H + 18} L 0 ${H + 18} Z`

  return (
    <div
      className="rounded-[var(--r)] px-6 py-[22px]"
      style={{ background: '#fff', border: '1px solid var(--line-2)', boxShadow: 'var(--shadow-sm)' }}
    >
      {/* Card header */}
      <div className="flex items-center gap-[11px] mb-4">
        <span
          className="w-[38px] h-[38px] rounded-[12px] grid place-items-center flex-none"
          style={{ background: '#EEEAFF', color: 'var(--violet)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M3 17l6-6 4 4 8-8M21 7v5h-5" />
          </svg>
        </span>
        <h3 className="font-bold text-[18px]" style={{ fontFamily: 'var(--font-bricolage)' }}>
          Crescimento de alcance
        </h3>

        {/* Period selector */}
        <div
          className="ml-auto flex gap-1 rounded-[12px] p-1"
          style={{ background: '#F4EFF6' }}
        >
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="px-[14px] py-[7px] rounded-[9px] font-extrabold text-[13px] transition"
              style={
                p === period
                  ? { background: '#fff', color: 'var(--ink)', boxShadow: 'var(--shadow-sm)' }
                  : { color: 'var(--wp-muted)' }
              }
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Total + growth */}
      <div className="flex items-end gap-6 mb-1.5">
        <div className="font-extrabold text-[30px]" style={{ fontFamily: 'var(--font-bricolage)' }}>
          {total}<span className="text-[15px] font-bold" style={{ color: 'var(--wp-muted)' }}> {unit}</span>
        </div>
        <div className="font-extrabold text-[14px] pb-1.5" style={{ color: 'var(--green)' }}>
          {gr}
        </div>
      </div>

      {/* SVG chart */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="w-full block"
        style={{ height: 210 }}
      >
        <defs>
          <linearGradient id="wp-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7C5CFF" stopOpacity="0.28" />
            <stop offset="1" stopColor="#7C5CFF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="wp-ln" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#9B6BFF" />
            <stop offset="1" stopColor="#F0309A" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        <g stroke="#F0ECF4" strokeWidth="1">
          {[40, 90, 140, 190].map((y) => (
            <line key={y} x1="0" y1={y} x2={W} y2={y} />
          ))}
        </g>

        {/* Area fill */}
        <path d={fillPath} fill="url(#wp-fill)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="url(#wp-ln)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Dots */}
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="#fff" stroke="#F0309A" strokeWidth="2.5" />
        ))}
      </svg>
    </div>
  )
}
