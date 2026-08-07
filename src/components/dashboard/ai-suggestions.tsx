'use client'

import { useI18n } from '@/i18n/context'

export function AiSuggestions() {
  const { t } = useI18n()
  return (
    <div
      className="rounded-(--r) px-6 py-5.5"
      style={{ background: '#fff', border: '1px solid var(--line-2)', boxShadow: 'var(--shadow-sm)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.75 mb-4">
        <span
          className="w-9.5 h-9.5 rounded-[12px] grid place-items-center flex-none"
          style={{ background: 'linear-gradient(135deg,#FFD36E,#FF9E45)', color: '#fff' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7c.6.5 1 1.2 1 2h6c0-.8.4-1.5 1-2A7 7 0 0012 2z" />
          </svg>
        </span>
        <h3 className="font-bold text-[18px]" style={{ fontFamily: 'var(--font-bricolage)' }}>
          {t('home.aiSuggestionsTitle')}
        </h3>
      </div>

      {/* Empty state — feature not backed by an API yet */}
      <div className="py-8 text-center">
        <p className="text-[14px] font-bold">Sugestões de IA em breve</p>
        <p className="text-[12.5px] font-semibold mt-1" style={{ color: 'var(--ink-soft)' }}>
          Esse recurso ainda não está disponível.
        </p>
      </div>
    </div>
  )
}
