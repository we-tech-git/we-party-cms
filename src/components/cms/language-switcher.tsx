'use client'

import { useEffect, useRef, useState } from 'react'
import { useI18n } from '@/i18n/context'
import { LOCALES, LOCALE_LABELS } from '@/i18n/types'
import { SHADOW_SM } from '@/lib/brand'

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const current = LOCALE_LABELS[locale]

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 h-10.5 px-3 rounded-[12px] font-extrabold text-[13px] transition-colors hover:text-[#D81B7E]"
        style={{ background: '#fff', border: '1px solid rgba(34,26,61,.08)', boxShadow: SHADOW_SM, color: 'var(--ink-soft)' }}
        aria-label="Idioma / Language"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span aria-hidden>{current.flag}</span>
        <span>{current.short}</span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-12 z-70 min-w-44 rounded-[14px] p-1.5 bg-white"
          style={{ border: '1px solid rgba(34,26,61,.08)', boxShadow: 'var(--shadow)' }}
        >
          {LOCALES.map((loc) => {
            const meta = LOCALE_LABELS[loc]
            const active = loc === locale
            return (
              <li key={loc}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    setLocale(loc)
                    setOpen(false)
                  }}
                  className="w-full flex items-center gap-2.5 px-2.75 py-2.25 rounded-[10px] font-bold text-[13.5px] text-left transition-colors hover:bg-[#FBF4FA]"
                  style={{ color: active ? 'var(--pink)' : 'var(--ink-soft)' }}
                >
                  <span aria-hidden>{meta.flag}</span>
                  <span className="flex-1">{meta.label}</span>
                  {active && (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
