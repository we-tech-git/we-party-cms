'use client'

import { GRAD } from '@/lib/brand'
import { useI18n } from '@/i18n/context'
import type { UiEventStatus } from '../_utils'

type TabFilter = 'todos' | UiEventStatus

const TAB_KEYS: TabFilter[] = ['todos', 'ativo', 'agendado', 'encerrado', 'arquivado']

type EventsToolbarProps = {
  filter: TabFilter
  counts: Record<TabFilter, number>
  query: string
  sortMode: 'recent' | 'popular'
  viewMode: 'grid' | 'list'
  onFilterChange: (f: TabFilter) => void
  onQueryChange: (q: string) => void
  onSortToggle: () => void
  onViewToggle: (v: 'grid' | 'list') => void
}

export function EventsToolbar({
  filter, counts, query, sortMode, viewMode,
  onFilterChange, onQueryChange, onSortToggle, onViewToggle,
}: EventsToolbarProps) {
  const { t } = useI18n()
  return (
    <div
      className="flex items-center gap-3.5 flex-wrap rounded-[18px] p-[10px_12px]"
      style={{ background: '#fff', border: '1px solid var(--line-2)', boxShadow: 'var(--shadow-sm)' }}
    >
      {/* Tabs */}
      <div className="flex gap-1 overflow-auto w-full lg:w-auto">
        {TAB_KEYS.map(key => {
          const active = filter === key
          return (
            <button
              key={key}
              className="flex items-center gap-1.75 px-3.75 py-2.5 rounded-[12px] font-extrabold text-[14px] whitespace-nowrap transition-colors"
              style={active
                ? { background: GRAD, color: '#fff', boxShadow: '0 10px 20px -12px rgba(240,48,154,.7)' }
                : { color: 'var(--ink-soft)' }
              }
              onClick={() => onFilterChange(key)}
            >
              {t(`myEvents.tabs.${key}`)}
              <span
                className="text-[11px] font-extrabold px-2 py-0.5 rounded-[8px]"
                style={active
                  ? { background: 'rgba(255,255,255,.25)', color: '#fff' }
                  : { background: '#F1ECF3', color: 'var(--wp-muted)' }
                }
              >
                {counts[key] ?? 0}
              </span>
            </button>
          )
        })}
      </div>

      {/* Right tools */}
      <div className="flex flex-1 flex-wrap items-center gap-2.5 lg:flex-none lg:ml-auto">
        {/* Search */}
        <div
          className="flex items-center gap-2 rounded-[12px] px-3.25 py-2.25 flex-1 min-w-40"
          style={{ background: 'var(--field,#FCFAFD)', border: '1.5px solid var(--line)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--wp-muted)" strokeWidth="2.4">
            <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            className="border-none bg-transparent outline-none font-medium text-[14px] w-full"
            placeholder={t('myEvents.searchPlaceholder')}
            value={query}
            onChange={e => onQueryChange(e.target.value)}
          />
        </div>

        {/* Sort */}
        <button
          className="flex items-center gap-2 rounded-[12px] px-3.5 py-2.5 font-bold text-[14px]"
          style={{ background: 'var(--field,#FCFAFD)', border: '1.5px solid var(--line)' }}
          onClick={onSortToggle}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M3 6h18M6 12h12M9 18h6"/>
          </svg>
          {sortMode === 'recent' ? t('myEvents.sortRecent') : t('myEvents.sortPopular')}
        </button>

        {/* View toggle */}
        <div
          className="flex rounded-[12px] p-1"
          style={{ background: 'var(--field,#FCFAFD)', border: '1.5px solid var(--line)' }}
        >
          {(['grid', 'list'] as const).map(v => (
            <button
              key={v}
              className="w-9 h-8 rounded-[9px] flex items-center justify-center transition-colors"
              style={viewMode === v
                ? { background: '#fff', color: 'var(--ink)', boxShadow: 'var(--shadow-sm)' }
                : { color: 'var(--wp-muted)' }
              }
              onClick={() => onViewToggle(v)}
            >
              {v === 'grid' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
                  <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
