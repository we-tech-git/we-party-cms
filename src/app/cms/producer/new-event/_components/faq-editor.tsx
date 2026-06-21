'use client'

import { useFormContext, useFieldArray } from 'react-hook-form'
import { GRAD } from '@/lib/brand'
import type { CreateEventForm } from '../_schema'

const ACCENT_COLORS = ['#FF6B9D', '#A78BFA', '#34D399', '#60A5FA', '#FBBF24']

export function FaqEditor() {
  const { register, control, formState: { errors } } = useFormContext<CreateEventForm>()
  const { fields, append, remove } = useFieldArray({ control, name: 'faqs' })

  return (
    <div
      className="rounded-(--r) p-6"
      style={{ background: '#fff', border: '1px solid var(--line-2)', boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="flex items-center gap-2.75 mb-4.5">
        <span
          className="w-9.5 h-9.5 rounded-[12px] grid place-items-center flex-none"
          style={{ background: '#E6FBF3', color: 'var(--green)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="12" cy="12" r="9" />
            <path d="M9.5 9a2.5 2.5 0 015 .2c0 1.8-2.5 2-2.5 3.8M12 17h.01" />
          </svg>
        </span>
        <h3 className="font-bold text-[18px]" style={{ fontFamily: 'var(--font-bricolage)' }}>
          Perguntas frequentes
        </h3>
        <span className="ml-auto text-[12.5px] font-semibold" style={{ color: 'var(--wp-muted)' }}>opcional</span>
      </div>

      <p className="font-medium text-[14px] mb-3.5" style={{ color: 'var(--ink-soft)' }}>
        Antecipe dúvidas comuns (open bar? estacionamento? idade mínima?) e reduza mensagens repetidas.
      </p>

      {fields.length === 0 && (
        <div className="flex items-center gap-2 rounded-[12px] px-3.5 py-3 font-semibold text-[13px] mb-3.5" style={{ color: 'var(--wp-muted)', background: '#FCFAFD', border: '1px solid var(--line-2)' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" />
          </svg>
          Nenhuma pergunta adicionada ainda.
        </div>
      )}

      <div className="flex flex-col gap-3">
        {fields.map((field, index) => {
          const accent = ACCENT_COLORS[index % ACCENT_COLORS.length]
          const qErr = errors.faqs?.[index]?.question
          const aErr = errors.faqs?.[index]?.answer
          return (
            <div
              key={field.id}
              className="flex gap-2.5 items-start rounded-[14px] p-3.5"
              style={{ background: '#FCFAFD', border: '1px solid var(--line-2)', borderLeft: `3px solid ${accent}` }}
            >
              <div className="flex flex-col gap-2 flex-1">
                <input
                  {...register(`faqs.${index}.question`)}
                  placeholder="Pergunta (ex: Tem estacionamento?)"
                  className="w-full rounded-[12px] border-[1.5px] px-3.5 py-2.75 text-[14px] font-medium outline-none transition-all"
                  style={{ background: '#fff', borderColor: qErr ? 'var(--pink)' : 'var(--line)', color: 'var(--ink)' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.boxShadow = `0 0 0 3px ${accent}22` }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = qErr ? 'var(--pink)' : 'var(--line)'; e.currentTarget.style.boxShadow = 'none' }}
                />
                {qErr && <span className="text-[12px] font-semibold" style={{ color: 'var(--pink)' }}>{qErr.message}</span>}
                <input
                  {...register(`faqs.${index}.answer`)}
                  placeholder="Resposta"
                  className="w-full rounded-[12px] border-[1.5px] px-3.5 py-2.75 text-[14px] font-medium outline-none transition-all"
                  style={{ background: '#fff', borderColor: aErr ? 'var(--pink)' : 'var(--line)', color: 'var(--ink)' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.boxShadow = `0 0 0 3px ${accent}22` }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = aErr ? 'var(--pink)' : 'var(--line)'; e.currentTarget.style.boxShadow = 'none' }}
                />
                {aErr && <span className="text-[12px] font-semibold" style={{ color: 'var(--pink)' }}>{aErr.message}</span>}
              </div>
              <button
                type="button"
                onClick={() => remove(index)}
                className="w-8.5 h-8.5 rounded-[10px] grid place-items-center flex-none border transition-all hover:border-[#ffd0d8]"
                style={{ background: '#fff', border: '1px solid var(--line-2)', color: 'var(--wp-muted)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#E0476B' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--wp-muted)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                </svg>
              </button>
            </div>
          )
        })}
      </div>

      <button
        type="button"
        onClick={() => append({ question: '', answer: '' })}
        className="flex items-center gap-2 rounded-[13px] px-4.25 py-2.75 font-extrabold text-[13.5px] text-white mt-3.5 transition hover:-translate-y-0.5"
        style={{ background: GRAD, boxShadow: '0 12px 24px -14px rgba(240,48,154,.7)' }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Nova pergunta
      </button>
    </div>
  )
}
