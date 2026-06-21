type SparkPoint = { x: number; y: number }

type KpiCardProps = {
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  value: string
  label: string
  trend: string
  trendUp?: boolean
  spark?: SparkPoint[]
  sparkColor?: string
}

export function KpiCard({ icon, iconBg, iconColor, value, label, trend, trendUp = true, spark, sparkColor = '#7C5CFF' }: KpiCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-[20px] px-5 py-4.5"
      style={{ background: '#fff', border: '1px solid var(--line-2)', boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="flex items-center justify-between">
        <span
          className="w-10.5 h-10.5 rounded-[13px] grid place-items-center flex-none"
          style={{ background: iconBg, color: iconColor }}
        >
          {icon}
        </span>
        <span
          className="text-[13px] font-extrabold"
          style={{ color: trendUp ? 'var(--green)' : 'var(--pink)' }}
        >
          {trendUp ? '▲' : '▼'} {trend}
        </span>
      </div>

      <div
        className="mt-[14px] leading-none text-[30px] font-extrabold"
        style={{ fontFamily: 'var(--font-bricolage)' }}
      >
        {value}
      </div>
      <div className="text-[13.5px] font-semibold mt-1" style={{ color: 'var(--wp-muted)' }}>
        {label}
      </div>

      {spark && (
        <svg
          className="absolute right-0 bottom-0 w-22.5 h-10.5 opacity-90"
          viewBox="0 0 90 42"
          preserveAspectRatio="none"
        >
          <path
            d={spark.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ')}
            fill="none"
            stroke={sparkColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      )}
    </div>
  )
}
