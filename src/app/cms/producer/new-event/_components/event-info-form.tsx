'use client'

import { useFormContext } from 'react-hook-form'
import type { CreateEventForm } from '../_schema'

export function EventInfoForm() {
  const { register, watch, formState: { errors } } = useFormContext<CreateEventForm>()
  const descLen = (watch('description') ?? '').length
  const titleReg = register('title')
  const descReg = register('description')

  return (
    <div
      className="rounded-[var(--r)] p-6"
      style={{ background: '#fff', border: '1px solid var(--line-2)', boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="flex items-center gap-[11px] mb-[18px]">
        <span
          className="w-[38px] h-[38px] rounded-[12px] grid place-items-center flex-none"
          style={{ background: '#FFE9F2', color: 'var(--pink)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M4 7h16M4 12h16M4 17h10" />
          </svg>
        </span>
        <h3 className="font-bold text-[18px]" style={{ fontFamily: 'var(--font-bricolage)' }}>
          Detalhes do evento
        </h3>
      </div>

      <div className="flex flex-col gap-1.5 mb-4">
        <label className="font-extrabold text-[13px]" style={{ color: 'var(--ink-soft)' }}>
          Nome do evento <span style={{ color: 'var(--pink)' }}>*</span>
        </label>
        <input
          id="input-title"
          {...titleReg}
          placeholder="Ex: Sunset Beach Party"
          className="w-full rounded-[14px] border-[1.5px] px-[15px] py-[13px] text-[15px] font-medium outline-none transition-all"
          style={{
            background: '#FCFAFD',
            borderColor: errors.title ? 'var(--pink)' : 'var(--line)',
            color: 'var(--ink)',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--pink)'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(240,48,154,.1)' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = errors.title ? 'var(--pink)' : 'var(--line)'; e.currentTarget.style.background = '#FCFAFD'; e.currentTarget.style.boxShadow = 'none'; void titleReg.onBlur(e) }}
        />
        {errors.title && (
          <span className="text-[12px] font-semibold" style={{ color: 'var(--pink)' }}>
            {errors.title.message}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-extrabold text-[13px]" style={{ color: 'var(--ink-soft)' }}>
          Descrição
        </label>
        <textarea
          {...descReg}
          maxLength={600}
          rows={4}
          placeholder="Conte o que rola no evento: line-up, atrações, clima, o que torna ele especial..."
          className="w-full rounded-[14px] border-[1.5px] px-[15px] py-[13px] text-[15px] font-medium outline-none transition-all resize-y"
          style={{
            background: '#FCFAFD',
            borderColor: 'var(--line)',
            color: 'var(--ink)',
            minHeight: '110px',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--pink)'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(240,48,154,.1)' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.background = '#FCFAFD'; e.currentTarget.style.boxShadow = 'none'; void descReg.onBlur(e) }}
        />
        <div className="text-right text-[12px] font-semibold" style={{ color: 'var(--wp-muted)' }}>
          {descLen}/600
        </div>
      </div>
    </div>
  )
}
