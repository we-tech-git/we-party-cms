'use client'

import { useFormContext } from 'react-hook-form'
import type { CreateEventForm } from '../_schema'

function FieldInput({ label, required, onBlur, onFocus, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; required?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-extrabold text-[13px]" style={{ color: 'var(--ink-soft)' }}>
        {label} {required && <span style={{ color: 'var(--pink)' }}>*</span>}
      </label>
      <input
        {...props}
        className="w-full rounded-[14px] border-[1.5px] px-[15px] py-[13px] text-[15px] font-medium outline-none transition-all"
        style={{ background: '#FCFAFD', borderColor: 'var(--line)', color: 'var(--ink)' }}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--pink)'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(240,48,154,.1)'; onFocus?.(e) }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.background = '#FCFAFD'; e.currentTarget.style.boxShadow = 'none'; onBlur?.(e) }}
      />
    </div>
  )
}

export function DateTimeForm() {
  const { register, formState: { errors } } = useFormContext<CreateEventForm>()
  const startDateReg = register('startDate')

  return (
    <div
      className="rounded-[var(--r)] p-6"
      style={{ background: '#fff', border: '1px solid var(--line-2)', boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="flex items-center gap-[11px] mb-[18px]">
        <span
          className="w-[38px] h-[38px] rounded-[12px] grid place-items-center flex-none"
          style={{ background: '#EEEAFF', color: 'var(--violet)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <rect x="3" y="4" width="18" height="18" rx="3" />
            <path d="M3 9h18M8 2v4M16 2v4" />
          </svg>
        </span>
        <h3 className="font-bold text-[18px]" style={{ fontFamily: 'var(--font-bricolage)' }}>
          Data e horário
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-[14px] mb-4">
        <div className="flex flex-col gap-1.5">
          <label className="font-extrabold text-[13px]" style={{ color: 'var(--ink-soft)' }}>
            Início <span style={{ color: 'var(--pink)' }}>*</span>
          </label>
          <input
            id="input-startDate"
            type="date"
            {...startDateReg}
            className="w-full rounded-[14px] border-[1.5px] px-[15px] py-[13px] text-[15px] font-medium outline-none transition-all"
            style={{ background: '#FCFAFD', borderColor: errors.startDate ? 'var(--pink)' : 'var(--line)', color: 'var(--ink)' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--pink)'; e.currentTarget.style.background = '#fff' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = errors.startDate ? 'var(--pink)' : 'var(--line)'; e.currentTarget.style.background = '#FCFAFD'; void startDateReg.onBlur(e) }}
          />
          {errors.startDate && (
            <span className="text-[12px] font-semibold" style={{ color: 'var(--pink)' }}>
              {errors.startDate.message}
            </span>
          )}
        </div>
        <FieldInput label="Hora" type="time" defaultValue="22:00" {...register('startTime')} />
      </div>

      <div className="grid grid-cols-2 gap-[14px]">
        <FieldInput label="Término" type="date" {...register('endDate')} />
        <FieldInput label="Hora" type="time" defaultValue="06:00" {...register('endTime')} />
      </div>
    </div>
  )
}
