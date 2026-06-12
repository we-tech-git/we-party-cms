'use client'

import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import type { CreateEventForm } from '../_schema'

type CepStatus = 'idle' | 'loading' | 'ok' | 'error'

function FieldInput({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-extrabold text-[13px]" style={{ color: 'var(--ink-soft)' }}>{label}</label>
      <input
        {...props}
        className="w-full rounded-[14px] border-[1.5px] px-[15px] py-[13px] text-[15px] font-medium outline-none transition-all"
        style={{ background: '#FCFAFD', borderColor: 'var(--line)', color: 'var(--ink)' }}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--pink)'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(240,48,154,.1)' }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.background = '#FCFAFD'; e.currentTarget.style.boxShadow = 'none' }}
      />
    </div>
  )
}

export function LocationForm() {
  const { register, setValue } = useFormContext<CreateEventForm>()
  const [cepStatus, setCepStatus] = useState<CepStatus>('idle')
  const [rawCep, setRawCep] = useState('')

  async function handleCepChange(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 8)
    const formatted = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits
    setRawCep(formatted)
    setValue('zip', formatted)
    if (digits.length !== 8) { setCepStatus('idle'); return }
    setCepStatus('loading')
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const json = await res.json()
      if (json.erro) { setCepStatus('error'); return }
      setValue('street', json.logradouro ?? '')
      setValue('district', json.bairro ?? '')
      setValue('city', json.localidade ?? '')
      setValue('state', json.uf ?? '')
      setCepStatus('ok')
    } catch {
      setCepStatus('error')
    }
  }

  return (
    <div
      className="rounded-[var(--r)] p-6"
      style={{ background: '#fff', border: '1px solid var(--line-2)', boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="flex items-center gap-[11px] mb-[18px]">
        <span
          className="w-[38px] h-[38px] rounded-[12px] grid place-items-center flex-none"
          style={{ background: '#E6F1FF', color: 'var(--blue)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M12 21s-7-5.5-7-11a7 7 0 0114 0c0 5.5-7 11-7 11z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
        </span>
        <h3 className="font-bold text-[18px]" style={{ fontFamily: 'var(--font-bricolage)' }}>
          Local
        </h3>
      </div>

      <div className="flex flex-col gap-1.5 mb-4">
        <label className="font-extrabold text-[13px]" style={{ color: 'var(--ink-soft)' }}>CEP</label>
        <div className="relative">
          <span className="absolute left-[14px] top-1/2 -translate-y-1/2" style={{ color: 'var(--wp-muted)' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 21s-7-5.5-7-11a7 7 0 0114 0c0 5.5-7 11-7 11z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
          </span>
          <input
            value={rawCep}
            onChange={(e) => handleCepChange(e.target.value)}
            placeholder="00000-000"
            className="w-full rounded-[14px] border-[1.5px] pl-[42px] pr-[15px] py-[13px] text-[15px] font-medium outline-none transition-all"
            style={{
              background: '#FCFAFD',
              borderColor: cepStatus === 'error' ? 'var(--pink)' : cepStatus === 'ok' ? 'var(--green)' : 'var(--line)',
              color: 'var(--ink)',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--pink)'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(240,48,154,.1)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = cepStatus === 'error' ? 'var(--pink)' : cepStatus === 'ok' ? 'var(--green)' : 'var(--line)'; e.currentTarget.style.background = '#FCFAFD'; e.currentTarget.style.boxShadow = 'none' }}
          />
          {cepStatus === 'loading' && (
            <span className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[12px] font-semibold" style={{ color: 'var(--wp-muted)' }}>
              Buscando…
            </span>
          )}
          {cepStatus === 'error' && (
            <span className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[12px] font-semibold" style={{ color: 'var(--pink)' }}>
              CEP não encontrado
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-[14px] mb-4">
        <FieldInput label="Cidade" placeholder="Cidade" {...register('city')} />
        <FieldInput label="Estado" placeholder="UF" {...register('state')} />
        <FieldInput label="Bairro" placeholder="Bairro" {...register('district')} />
      </div>

      <div className="grid gap-[14px]" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <FieldInput label="Rua" placeholder="Rua / avenida" {...register('street')} />
        <FieldInput label="Número" placeholder="Nº" {...register('number')} />
      </div>
    </div>
  )
}
