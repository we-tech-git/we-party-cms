'use client'

import { useState, useMemo, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { GRAD } from '@/lib/brand'
import { useI18n } from '@/i18n/context'
import { useMyEvents } from '@/hooks/use-my-events'
import { deleteEvent, patchEvent } from '@/services/events.service'
import type { EventDto } from '@/types/events.types'
import { mapEventStatus, calcEventScore, calcPopularity, type UiEventStatus } from './_utils'
import { EventCard } from './_components/event-card'
import { EventsToolbar } from './_components/events-toolbar'
import { CommentDrawer } from './_components/comment-drawer'
import { ActivityDrawer } from './_components/activity-drawer'
import { DeleteModal } from './_components/delete-modal'
import { BulkBar } from './_components/bulk-bar'

type TabFilter = 'todos' | UiEventStatus

export default function MyEventsPage() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { t } = useI18n()
  const { data, isLoading } = useMyEvents()

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
  const archiveMutation = useMutation({
    mutationFn: (id: string) => patchEvent(id, { status: 'CANCELLED' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-events'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-events'] })
      setPendingDelete(null)
    },
  })

  function handleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  function handleBulkArchive() {
    Promise.all([...selectedIds].map(id => patchEvent(id, { status: 'CANCELLED' }))).then(() => {
      queryClient.invalidateQueries({ queryKey: ['my-events'] })
      setSelectedIds(new Set())
    })
  }

  function handleBulkDelete() {
    Promise.all([...selectedIds].map(id => deleteEvent(id))).then(() => {
      queryClient.invalidateQueries({ queryKey: ['my-events'] })
      setSelectedIds(new Set())
    })
  }

  // Summary line
  const hotCount = counts.ativo
  const totalReach = events.reduce((acc, e) => acc + (e.viewCount ?? 0), 0)
  const totalComments = events.reduce((acc, e) => acc + e._count.comments, 0)

  return (
    <>
      <div className="flex flex-col gap-5 min-w-0">
        {/* Page header */}
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <h1 className="font-extrabold text-[clamp(22px,5vw,28px)] leading-[1.05]" style={{ fontFamily: 'var(--font-bricolage)' }}>
              {t('myEvents.title')}
            </h1>
            <p className="font-semibold text-[14.5px] mt-0.5" style={{ color: 'var(--ink-soft)' }}>
              {hotCount > 0 && <><b style={{ color: 'var(--pink)' }}>{t('myEvents.hot', { count: hotCount })}</b> · </>}
              {totalReach > 0 && <>{t('myEvents.reached', { count: fmtNum(totalReach) })} · </>}
              {totalComments > 0 && <b style={{ color: 'var(--pink)' }}>{t('myEvents.comments', { count: totalComments })}</b>}
              {totalComments === 0 && hotCount === 0 && t('myEvents.manageHere')}
            </p>
          </div>
          <div className="ml-auto">
            <Link
              href="/cms/producer/new-event"
              className="flex items-center gap-2.25 rounded-[14px] px-5 py-3.25 font-extrabold text-white transition-transform hover:-translate-y-0.5"
              style={{ background: GRAD, boxShadow: '0 14px 28px -14px rgba(240,48,154,.7)' }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              {t('common.createEvent')}
            </Link>
          </div>
        </div>

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
          <div className="flex items-center justify-center h-48 rounded-[20px] bg-white" style={{ border: '1px solid var(--line-2)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--wp-muted)' }}>{t('myEvents.loadingEvents')}</p>
          </div>
        ) : visible.length === 0 ? (
          <div
            className="flex flex-col items-center text-center gap-1.5 py-15 px-5 rounded-[20px]"
            style={{ border: '1px dashed var(--line)', color: 'var(--wp-muted)' }}
          >
            <div
              className="w-16 h-16 rounded-[20px] flex items-center justify-center mb-1.5"
              style={{ background: '#FBF4FA' }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--wp-muted)" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="3"/><path d="M3 9h18M8 2v4M16 2v4"/>
              </svg>
            </div>
            <b className="text-[18px]" style={{ fontFamily: 'var(--font-bricolage)', color: 'var(--ink)' }}>
              {t('myEvents.emptyTitle')}
            </b>
            <span>{t('myEvents.emptyDesc')}</span>
          </div>
        ) : (
          <div
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
