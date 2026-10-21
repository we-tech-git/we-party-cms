'use client'

import { useState, useMemo, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/cms/page-header'
import { EmptyState } from '@/components/cms/empty-state'
import { EventCard } from '@/components/cms/event-card'
import { BulkBar } from '@/components/cms/bulk-bar'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { useI18n } from '@/i18n/context'
import { useMyEvents } from '@/hooks/use-my-events'
import { deleteEvent, patchEvent } from '@/services/events.service'
import type { EventDto } from '@/types/events.types'
import { mapEventStatus, calcEventScore, calcPopularity, type UiEventStatus } from './_utils'
import { EventsToolbar } from './_components/events-toolbar'
import { CommentDrawer } from './_components/comment-drawer'
import { ActivityDrawer } from './_components/activity-drawer'
import { DeleteModal } from './_components/delete-modal'

type TabFilter = 'todos' | UiEventStatus

export default function MyEventsPage() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { t } = useI18n()
  const { data, isLoading } = useMyEvents()
  const { toastNode, showToast } = useToast()

  // UI state
  const [filter, setFilter] = useState<TabFilter>('todos')

  // Honor a ?filtro= query param (e.g. "Arquivados" shortcut from the home page).
  // Read from window to avoid the Suspense requirement of useSearchParams.
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('filtro')
    const valid: TabFilter[] = ['todos', 'ativo', 'agendado', 'encerrado', 'arquivado']
    // One-time read of the URL on mount — not a cascading render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (param && (valid as string[]).includes(param)) setFilter(param as TabFilter)
  }, [])
  const [query, setQuery] = useState('')
  const [sortMode, setSortMode] = useState<'recent' | 'popular'>('recent')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [openCommentEvent, setOpenCommentEvent] = useState<EventDto | null>(null)
  const [openActivityEvent, setOpenActivityEvent] = useState<EventDto | null>(null)
  const [pendingDelete, setPendingDelete] = useState<EventDto | null>(null)

  const events = useMemo(() => data?.events ?? [], [data])

  // Max score for normalizing popularity bars
  const maxScore = useMemo(() => Math.max(0, ...events.map(calcEventScore)), [events])

  // Build derived status for each event
  const eventsWithStatus = useMemo(
    () => events.map(e => ({ ...e, uiStatus: mapEventStatus(e.status, e.startDate) })),
    [events],
  )

  // Counts per tab
  const counts = useMemo(() => {
    const c: Record<TabFilter, number> = { todos: 0, ativo: 0, rascunho: 0, agendado: 0, encerrado: 0, arquivado: 0 }
    eventsWithStatus.forEach(e => {
      if (e.uiStatus !== 'arquivado') c.todos++
      c[e.uiStatus]++
    })
    return c
  }, [eventsWithStatus])

  // Filtered + searched + sorted
  const visible = useMemo(() => {
    let list = eventsWithStatus.filter(e => {
      const passFilter = filter === 'todos' ? e.uiStatus !== 'arquivado' : e.uiStatus === filter
      const passQuery = !query || e.title.toLowerCase().includes(query.toLowerCase())
      return passFilter && passQuery
    })
    if (sortMode === 'popular') {
      list = [...list].sort((a, b) => calcEventScore(b) - calcEventScore(a))
    }
    return list
  }, [eventsWithStatus, filter, query, sortMode])

  // Mutations
  // Regra AGENTS.md #2: loading no gatilho + toast ao final (sucesso e erro).
  const archiveMutation = useMutation({
    mutationFn: (id: string) => patchEvent(id, { status: 'CANCELLED' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-events'] })
      showToast(t('myEvents.toast.archived'), 'success')
    },
    onError: () => showToast(t('myEvents.toast.error'), 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-events'] })
      setPendingDelete(null)
      showToast(t('myEvents.toast.deleted'), 'success')
    },
    onError: () => showToast(t('myEvents.toast.error'), 'error'),
  })

  function handleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  function handleBulkArchive() {
    Promise.all([...selectedIds].map(id => patchEvent(id, { status: 'CANCELLED' })))
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['my-events'] })
        setSelectedIds(new Set())
        showToast(t('myEvents.toast.archived'), 'success')
      })
      .catch(() => showToast(t('myEvents.toast.error'), 'error'))
  }

  function handleBulkDelete() {
    Promise.all([...selectedIds].map(id => deleteEvent(id)))
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['my-events'] })
        setSelectedIds(new Set())
        showToast(t('myEvents.toast.deleted'), 'success')
      })
      .catch(() => showToast(t('myEvents.toast.error'), 'error'))
  }

  // Summary line
  const hotCount = counts.ativo
  const totalReach = events.reduce((acc, e) => acc + (e.viewCount ?? 0), 0)
  const totalComments = events.reduce((acc, e) => acc + e._count.comments, 0)

  return (
    <>
      <div className="flex flex-col gap-5 min-w-0">
        <PageHeader
          icon={<CalendarDays />}
          title={t('myEvents.title')}
          subtitle={
            <>
              {hotCount > 0 && <><b className="font-semibold text-wp-magenta">{t('myEvents.hot', { count: hotCount })}</b> · </>}
              {totalReach > 0 && <>{t('myEvents.reached', { count: fmtNum(totalReach) })} · </>}
              {totalComments > 0 && <b className="font-semibold text-wp-magenta">{t('myEvents.comments', { count: totalComments })}</b>}
              {totalComments === 0 && hotCount === 0 && t('myEvents.manageHere')}
            </>
          }
          actions={
            <Button type="button" variant="primary" size="md" onClick={() => router.push('/cms/producer/new-event')} data-testid="create-event">
              <Plus /> {t('common.createEvent')}
            </Button>
          }
        />

        {/* Toolbar */}
        <EventsToolbar
          filter={filter}
          counts={counts}
          query={query}
          sortMode={sortMode}
          viewMode={viewMode}
          onFilterChange={setFilter}
          onQueryChange={setQuery}
          onSortToggle={() => setSortMode(m => m === 'recent' ? 'popular' : 'recent')}
          onViewToggle={setViewMode}
        />

        {/* Events grid/list */}
        {isLoading ? (
          <div className="flex h-48 items-center justify-center rounded-panel border border-wp-line bg-white">
            <p className="text-sm text-wp-sub">{t('myEvents.loadingEvents')}</p>
          </div>
        ) : visible.length === 0 ? (
          <EmptyState icon={<CalendarDays />} title={t('myEvents.emptyTitle')} description={t('myEvents.emptyDesc')} className="py-14" />
        ) : (
          <div
            data-testid="events-list"
            className={viewMode === 'list' ? 'flex flex-col gap-5' : 'grid gap-5'}
            style={viewMode === 'grid' ? { gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,330px),1fr))' } : {}}
          >
            {visible.map(event => (
              <EventCard
                key={event.id}
                event={event}
                view={viewMode}
                popularityPct={calcPopularity(event, maxScore)}
                selected={selectedIds.has(event.id)}
                onSelect={handleSelect}
                onArchive={e => archiveMutation.mutate(e.id)}
                onDelete={e => setPendingDelete(e)}
                onComments={e => setOpenCommentEvent(e)}
                onActivities={e => setOpenActivityEvent(e)}
                onEdit={e => router.push(`/cms/producer/edit-event/${e.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Comment Drawer */}
      <CommentDrawer
        eventId={openCommentEvent?.id ?? null}
        eventTitle={openCommentEvent?.title ?? ''}
        onClose={() => setOpenCommentEvent(null)}
      />

      {/* Activity Drawer */}
      <ActivityDrawer
        eventId={openActivityEvent?.id ?? null}
        eventTitle={openActivityEvent?.title ?? ''}
        onClose={() => setOpenActivityEvent(null)}
      />

      {/* Delete Modal */}
      {pendingDelete && (
        <DeleteModal
          eventName={pendingDelete.title}
          isPending={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(pendingDelete.id)}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      {toastNode}

      {/* Bulk Bar */}
      <BulkBar
        count={selectedIds.size}
        isPending={archiveMutation.isPending || deleteMutation.isPending}
        onArchive={handleBulkArchive}
        onDelete={handleBulkDelete}
        onClear={() => setSelectedIds(new Set())}
      />
    </>
  )
}

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace('.', ',')}k`
  return String(n)
}
