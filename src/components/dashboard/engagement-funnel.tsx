import { GRAD } from '@/lib/brand'

type FunnelStep = {
  value: string
  label: string
  widthPct: number
  gradient: string
  conversion?: string
  conversionValue?: string
}

const steps: FunnelStep[] = [
  { value: '128.000', label: 'Impressões na descoberta', widthPct: 100, gradient: 'linear-gradient(120deg,#E8920C,#FFB347)' },
  { value: '45.892', label: 'Visualizações', widthPct: 70, gradient: 'linear-gradient(120deg,#3E7BFB,#6BA0FF)', conversion: 'conversão', conversionValue: '35,9%' },
  { value: '3.218', label: 'Curtidas', widthPct: 46, gradient: 'linear-gradient(120deg,#9B6BFF,#7C5CFF)', conversion: 'conversão', conversionValue: '7,0%' },
  { value: '1.284', label: 'Confirmados', widthPct: 32, gradient: 'linear-gradient(120deg,#F0309A,#FF5F8D)', conversion: 'conversão', conversionValue: '39,9%' },
  { value: '642', label: 'Compartilhamentos', widthPct: 22, gradient: GRAD, conversion: 'viralização', conversionValue: '50%' },
]

export function EngagementFunnel() {
  return (
    <div
      className="rounded-[var(--r)] px-6 py-[22px]"
      style={{ background: '#fff', border: '1px solid var(--line-2)', boxShadow: 'var(--shadow-sm)' }}
    >
      {/* Card header */}
      <div className="flex items-center gap-[11px] mb-4">
        <span
          className="w-[38px] h-[38px] rounded-[12px] grid place-items-center flex-none"
          style={{ background: '#FFE9F2', color: 'var(--pink)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M3 5h18l-7 8v6l-4 2v-8z" />
          </svg>
        </span>
        <h3 className="font-bold text-[18px]" style={{ fontFamily: 'var(--font-bricolage)' }}>
          Jornada de engajamento
        </h3>
        <span className="ml-auto text-[13px] font-semibold" style={{ color: 'var(--wp-muted)' }}>
          onde melhorar →
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-3.5">
            <div
              className="h-[46px] rounded-[13px] flex items-center px-4 text-white font-bold overflow-hidden"
              style={{ width: `${step.widthPct}%`, background: step.gradient, minWidth: 120 }}
            >
              <span className="font-extrabold text-[18px]" style={{ fontFamily: 'var(--font-bricolage)' }}>
                {step.value}
              </span>
              <span className="text-[12px] font-bold opacity-92 ml-2.5">{step.label}</span>
            </div>
            {step.conversion && (
              <span className="font-extrabold text-[13px] whitespace-nowrap" style={{ color: 'var(--wp-muted)' }}>
                {step.conversion}{' '}
                <strong style={{ color: 'var(--green)' }}>{step.conversionValue}</strong>
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
