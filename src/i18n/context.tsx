'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ptBR } from './locales/pt-BR'
import { enUS } from './locales/en-US'
import { DEFAULT_LOCALE, LOCALES, type Dictionary, type Locale, type TKey } from './types'

const DICTIONARIES: Record<Locale, Dictionary> = {
  'pt-BR': ptBR,
  'en-US': enUS,
}

const STORAGE_KEY = 'we-party-locale'

type TranslateParams = Record<string, string | number>

type I18nContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TKey, params?: TranslateParams) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

/** Resolves a dot-path ("a.b.c") against a nested dictionary. Returns the key when missing. */
function resolve(dict: Dictionary, key: string): string {
  const value = key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part]
    }
    return undefined
  }, dict)
  return typeof value === 'string' ? value : key
}

function interpolate(template: string, params?: TranslateParams): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    name in params ? String(params[name]) : `{${name}}`,
  )
}

function isLocale(value: string | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value)
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)

  // Hydrate the saved locale on mount (client only, avoids SSR mismatch).
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    // Hydrate once on mount — deliberately syncs persisted locale post-SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isLocale(saved)) setLocaleState(saved)
  }, [])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, next)
      document.documentElement.lang = next
    }
  }, [])

  const t = useCallback(
    (key: TKey, params?: TranslateParams) => interpolate(resolve(DICTIONARIES[locale], key), params),
    [locale],
  )

  const value = useMemo<I18nContextValue>(() => ({ locale, setLocale, t }), [locale, setLocale, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n deve ser usado dentro de <I18nProvider>')
  return ctx
}
