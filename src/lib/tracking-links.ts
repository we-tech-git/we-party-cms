/**
 * Links de divulgação por canal (WEPARTY-239).
 *
 * A seção só aparece com `NEXT_PUBLIC_FF_TRACKING_LINKS=true` (o backend tem a
 * flag dele, `FEATURE_TRACKING_LINKS`). A URL do link é montada aqui porque o
 * backend não conhece a origem do web-app.
 */

export const TRACKING_LINK_LABEL_MAX = 60
export const TRACKING_LINKS_MAX_PER_EVENT = 50

// Referência literal a `process.env.NEXT_PUBLIC_*`: é o que o Next inlina no bundle do cliente.
const FLAG = process.env.NEXT_PUBLIC_FF_TRACKING_LINKS
const WEB_APP_URL = process.env.NEXT_PUBLIC_WEB_APP_URL ?? 'https://wepartyapp.com'

export function isTrackingLinksEnabled(): boolean {
  return FLAG === 'true'
}

/** URL pública do evento no web-app com o código do link em `?ref=`. */
export function buildTrackingUrl(eventId: string, code: string, base: string = WEB_APP_URL): string {
  const origin = base.replace(/\/+$/, '')
  return `${origin}/event/${encodeURIComponent(eventId)}?ref=${encodeURIComponent(code)}`
}
