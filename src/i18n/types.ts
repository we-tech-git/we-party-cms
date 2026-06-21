import type { ptBR } from './locales/pt-BR'

/** Widens the literal `as const` shape of pt-BR so other locales can assign plain strings. */
type Widen<T> = {
  [K in keyof T]: T[K] extends string ? string : Widen<T[K]>
}

export type Dictionary = Widen<typeof ptBR>

/** Dot-path union to every string leaf of the dictionary — powers typed t() keys. */
export type TKey = PathInto<typeof ptBR>

type PathInto<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${PathInto<T[K]>}`
}[keyof T & string]

export const LOCALES = ['pt-BR', 'en-US'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'pt-BR'

export const LOCALE_LABELS: Record<Locale, { short: string; label: string; flag: string }> = {
  'pt-BR': { short: 'PT', label: 'Português', flag: '🇧🇷' },
  'en-US': { short: 'EN', label: 'English', flag: '🇺🇸' },
}
