'use client'

import { LayoutGrid, List, ListFilter } from 'lucide-react'
import { Panel } from '@/components/cms/panel'
import { Button } from '@/components/ui/button'
import { SearchField } from '@/components/ui/search-field'
import { UnderlineTabs } from '@/components/ui/tabs'
import { useI18n } from '@/i18n/context'
import { cn } from '@/lib/utils'
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

/** Barra de filtros de Meus eventos (Figma: abas com sublinhado + busca + ordenação + alternância de vista). */
export function EventsToolbar({
  filter, counts, query, sortMode, viewMode,
  onFilterChange, onQueryChange, onSortToggle, onViewToggle,
}: EventsToolbarProps) {
  const { t } = useI18n()
  return (
    <Panel className="flex flex-col gap-3 px-5 pt-1 pb-4" data-testid="events-toolbar">
      <UnderlineTabs
        aria-label={t('myEvents.title')}
        items={TAB_KEYS.map((key) => ({ value: key, label: t(`myEvents.tabs.${key}`), count: counts[key] ?? 0, testId: `tab-${key}` }))}
        value={filter}
        onValueChange={onFilterChange}
        className="-mx-1 border-b-0"
      />

      <div className="flex flex-wrap items-center gap-2.5 lg:justify-end">
        <SearchField
          className="min-w-40 flex-1 lg:w-75 lg:flex-none"
          placeholder={t('myEvents.searchPlaceholder')}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          data-testid="events-search"
        />
        <Button type="button" variant="line" size="compact" onClick={onSortToggle} data-testid="events-sort">
          <ListFilter /> {sortMode === 'recent' ? t('myEvents.sortRecent') : t('myEvents.sortPopular')}
        </Button>
        <div className="flex gap-1 rounded-xl bg-wp-bg p-1" role="group" aria-label="Vista">
          {(['grid', 'list'] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={viewMode === v}
              aria-label={v}
              data-testid={`view-${v}`}
              onClick={() => onViewToggle(v)}
              className={cn(
                'grid size-9 place-items-center rounded-[10px] outline-none focus-visible:ring-3 focus-visible:ring-wp-primary/30 [&_svg]:size-4',
                viewMode === v ? 'bg-white text-ink shadow-card' : 'text-wp-sub hover:text-ink',
              )}
            >
              {v === 'grid' ? <LayoutGrid /> : <List />}
            </button>
          ))}
        </div>
      </div>
    </Panel>
  )
}
