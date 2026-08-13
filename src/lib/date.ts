/** "há 2 horas" / "2 hours ago", falling back to a short date for older items. */
export function relativeTime(iso: string, locale: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const diffMs = then - Date.now() // negative → in the past
  const abs = Math.abs(diffMs)
  const MIN = 60_000
  const HOUR = 3_600_000
  const DAY = 86_400_000
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  if (abs < HOUR) return rtf.format(Math.round(diffMs / MIN), 'minute')
  if (abs < DAY) return rtf.format(Math.round(diffMs / HOUR), 'hour')
  if (abs < 7 * DAY) return rtf.format(Math.round(diffMs / DAY), 'day')
  return new Date(iso).toLocaleDateString(locale, { day: '2-digit', month: 'short' })
}
