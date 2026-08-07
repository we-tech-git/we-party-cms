'use client'

/**
 * Gerenciar eventos (admin) — moderação de todos os eventos da plataforma:
 * listar, buscar/filtrar por status, aprovar pendentes, destacar e excluir.
 *
 * Inspirado no MyEventsManager do projeto OPS, mas em chave administrativa
 * (visão de todos os produtores). Ainda não existe endpoint admin no backend
 * (GET /admin/events, PATCH /admin/events/:id, DELETE /admin/events/:id) —
 * a lista começa vazia até essa integração existir; troque `INITIAL_EVENTS`
 * e os handlers por chamadas reais quando os endpoints forem publicados.
 */

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { GRAD } from '@/lib/brand'
import { UserDetailCard } from '@/components/cms/user-detail-card'
import { BackButton } from '@/components/cms/back-button'
import type { AdminUserDetails } from '@/types/users.types'

/* ------------------------------------------------------------------ types -- */

type EvStatus = 'published' | 'pending' | 'draft' | 'ended'

type AdminEvent = {
  id: number
  title: string
  producer: string
  date: string
  location: string
  status: EvStatus
  featured: boolean
  views: number
  likes: number
  cover: string
  emoji: string
  /** Full producer profile shown in the user detail card on click. */
  producerUser: AdminUserDetails
}

/* ---------------------------------------------------------------- helpers -- */

const card = { background: '#fff', border: '1px solid var(--line-2)', boxShadow: 'var(--shadow-sm)' } as const

const STATUS_META: Record<EvStatus, { label: string; color: string; bg: string }> = {
  published: { label: 'Publicado', color: 'var(--green)', bg: '#E6FBF3' },
  pending: { label: 'Aguardando aprovação', color: 'var(--amber)', bg: '#FFF4E0' },
  draft: { label: 'Rascunho', color: 'var(--wp-muted)', bg: 'var(--line-2)' },
  ended: { label: 'Encerrado', color: 'var(--blue)', bg: '#E6F1FF' },
}

function fmtCompact(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace('.0', '').replace('.', ',')}k`
  return String(n)
}

/* --------------------------------------------------------------- data ----- */

// Sem endpoint admin de eventos no backend ainda — lista começa vazia até
// essa integração existir (ver comentário no topo do arquivo).
const INITIAL_EVENTS: AdminEvent[] = []

/* ----------------------------------------------------------- subcomponents - */

function StatCard({ value, label, grad, icon }: { value: string; label: string; grad: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 rounded-[18px] px-5 py-4.5" style={card}>
      <span className="w-12 h-12 rounded-[14px] grid place-items-center text-white flex-none" style={{ background: grad }}>{icon}</span>
      <div className="min-w-0">
        <div className="text-[24px] font-extrabold leading-none tabular-nums" style={{ fontFamily: 'var(--font-bricolage)' }}>{value}</div>
        <div className="text-[13px] font-semibold mt-1 truncate" style={{ color: 'var(--wp-muted)' }}>{label}</div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: EvStatus }) {
  const m = STATUS_META[status]
  return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-extrabold" style={{ background: m.bg, color: m.color }}><span className="w-1.5 h-1.5 rounded-full" style={{ background: m.color }} />{m.label}</span>
}

/* ------------------------------------------------------------------- page -- */

export default function EventsAdminPage() {
  const [events, setEvents] = useState<AdminEvent[]>(INITIAL_EVENTS)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | EvStatus>('all')
  const [toDelete, setToDelete] = useState<AdminEvent | null>(null)
  const [viewUser, setViewUser] = useState<AdminUserDetails | null>(null)

  const stats = useMemo(() => ({
    total: events.length,
    published: events.filter((e) => e.status === 'published').length,
    pending: events.filter((e) => e.status === 'pending').length,
    ended: events.filter((e) => e.status === 'ended').length,
  }), [events])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return events.filter((e) => {
      if (filter !== 'all' && e.status !== filter) return false
      if (!q) return true
      return e.title.toLowerCase().includes(q) || e.producer.toLowerCase().includes(q) || e.location.toLowerCase().includes(q)
    })
  }, [events, query, filter])

  function patch(id: number, data: Partial<AdminEvent>) {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)))
  }
  function applyDelete() {
    if (!toDelete) return
    setEvents((prev) => prev.filter((e) => e.id !== toDelete.id))
    setToDelete(null)
  }

  useEffect(() => {
    if (!toDelete) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.removeProperty('overflow')
    }
  }, [toDelete])

  return (
    <div className="flex flex-col gap-5">
      <BackButton fallback="/cms/admin/control-panel" />

      {/* Header */}
      <div className="flex items-end gap-4 flex-wrap">
        <span className="w-14 h-14 rounded-[18px] grid place-items-center text-white flex-none" style={{ background: GRAD, boxShadow: '0 14px 28px -14px rgba(240,48,154,.7)' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="4" width="18" height="18" rx="3" /><path d="M3 9h18M8 2v4M16 2v4" /></svg>
        </span>
        <div className="min-w-0">
          <h1 className="font-extrabold text-[clamp(22px,5vw,30px)] leading-[1.05]" style={{ fontFamily: 'var(--font-bricolage)' }}>
            Gerenciar <span style={{ background: 'linear-gradient(120deg,var(--violet),var(--pink))', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>eventos</span>
          </h1>
          <p className="font-semibold mt-0.5 text-[14px]" style={{ color: 'var(--ink-soft)' }}>Modere, aprove e destaque os eventos de todos os produtores</p>
        </div>
        <Link href="/cms/producer/new-event" className="ml-auto flex items-center gap-2 rounded-[14px] px-5 py-3.25 font-extrabold text-white transition hover:-translate-y-0.5" style={{ background: GRAD, boxShadow: '0 14px 28px -14px rgba(240,48,154,.7)' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M12 5v14M5 12h14" /></svg>
          Novo evento
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard value={String(stats.total)} label="Total de eventos" grad="linear-gradient(135deg,#7C5CFF,#a78bfa)" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="4" width="18" height="18" rx="3" /><path d="M3 9h18M8 2v4M16 2v4" /></svg>} />
        <StatCard value={String(stats.published)} label="Publicados" grad="linear-gradient(135deg,#10A87D,#34d399)" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5" /></svg>} />
        <StatCard value={String(stats.pending)} label="Aguardando aprovação" grad="linear-gradient(135deg,#F59E0B,#fbbf24)" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>} />
        <StatCard value={String(stats.ended)} label="Encerrados" grad="linear-gradient(135deg,#3E7BFB,#60a5fa)" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="4" width="18" height="18" rx="3" /><path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4" /></svg>} />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-55">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--wp-muted)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
          </span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por evento, produtor ou local…" className="w-full rounded-[13px] pl-11 pr-4 py-3 text-[14px] font-medium outline-none transition focus:border-violet" style={{ background: '#fff', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }} />
        </div>
        <div className="flex p-1 rounded-[13px] flex-wrap" style={{ background: '#fff', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
          {([['all', 'Todos'], ['published', 'Publicados'], ['pending', 'Pendentes'], ['draft', 'Rascunhos'], ['ended', 'Encerrados']] as const).map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)} className="px-3.5 py-2 rounded-[10px] text-[13px] font-extrabold transition" style={filter === v ? { background: GRAD, color: '#fff' } : { color: 'var(--wp-muted)' }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Events grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 rounded-[22px]" style={card}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--wp-muted)" strokeWidth="1.6"><rect x="3" y="4" width="18" height="18" rx="3" /><path d="M3 9h18M8 2v4M16 2v4" /></svg>
          <span className="text-[14px] font-semibold" style={{ color: 'var(--wp-muted)' }}>Nenhum evento encontrado</span>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 min-[1280px]:grid-cols-3">
          {filtered.map((e) => (
            <div key={e.id} className="rounded-[20px] overflow-hidden flex flex-col" style={card}>
              {/* Cover */}
              <div className="relative h-28 grid place-items-center text-[40px]" style={{ background: e.cover }}>
                <span>{e.emoji}</span>
                <div className="absolute top-2.5 left-2.5"><StatusBadge status={e.status} /></div>
                {e.featured && (
                  <span className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-extrabold text-white" style={{ background: 'rgba(0,0,0,.35)', backdropFilter: 'blur(4px)' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7z" /></svg>
                    Destaque
                  </span>
                )}
              </div>

              {/* Body */}
              <div className="p-4 flex flex-col gap-2.5 flex-1">
                <div>
                  <h3 className="font-extrabold text-[16px] leading-tight truncate" style={{ fontFamily: 'var(--font-bricolage)' }}>{e.title}</h3>
                  <p className="text-[12.5px] font-medium mt-0.5" style={{ color: 'var(--wp-muted)' }}>
                    por{' '}
                    <button onClick={() => setViewUser(e.producerUser)} className="font-bold underline-offset-2 hover:underline transition" style={{ color: 'var(--violet)' }} title="Ver perfil do produtor">
                      {e.producer}
                    </button>
                  </p>
                </div>
                <div className="flex flex-col gap-1 text-[12.5px] font-medium" style={{ color: 'var(--ink-soft)' }}>
                  <span className="flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="4" width="18" height="18" rx="3" /><path d="M3 9h18M8 2v4M16 2v4" /></svg>{e.date}</span>
                  <span className="flex items-center gap-1.5 truncate"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 21s-7-5.5-7-11a7 7 0 0114 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg><span className="truncate">{e.location}</span></span>
                </div>
                <div className="flex gap-3 text-[12.5px] font-bold" style={{ color: 'var(--ink-soft)' }}>
                  <span className="flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>{fmtCompact(e.views)}</span>
                  <span className="flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.6-10-9C.6 9 2 5 5.5 5 8 5 9.4 6.6 12 9c2.6-2.4 4-4 6.5-4C22 5 23.4 9 22 12c-2.5 4.4-10 9-10 9z" /></svg>{fmtCompact(e.likes)}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 mt-auto pt-1">
                  {e.status === 'pending' && (
                    <button onClick={() => patch(e.id, { status: 'published' })} className="flex-1 flex items-center justify-center gap-1.5 rounded-[10px] py-2 text-[12.5px] font-extrabold transition hover:brightness-95" style={{ background: '#E6FBF3', color: 'var(--green)' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M20 6L9 17l-5-5" /></svg>
                      Aprovar
                    </button>
                  )}
                  <button onClick={() => patch(e.id, { featured: !e.featured })} title={e.featured ? 'Remover destaque' : 'Destacar'} className="w-9 h-9 rounded-[10px] grid place-items-center flex-none transition hover:brightness-95" style={e.featured ? { background: '#FFF4E0', color: 'var(--amber)' } : { background: '#FBFAFE', color: 'var(--wp-muted)', border: '1px solid var(--line-2)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={e.featured ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7z" /></svg>
                  </button>
                  <Link href={`/cms/producer/edit-event/${e.id}`} title="Editar" className="w-9 h-9 rounded-[10px] grid place-items-center flex-none transition hover:brightness-95" style={{ background: '#E0E7FF', color: '#4F46E5' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" /></svg>
                  </Link>
                  <button onClick={() => setToDelete(e)} title="Excluir" className="w-9 h-9 rounded-[10px] grid place-items-center flex-none transition hover:brightness-95" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" /></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm */}
      {toDelete && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div className="absolute inset-0" style={{ background: 'rgba(17,24,39,.6)', backdropFilter: 'blur(4px)' }} onClick={() => setToDelete(null)} />
          <div role="dialog" aria-modal="true" className="relative z-1 rounded-[24px] bg-white p-7 text-center" style={{ width: 'min(92vw, 420px)', boxShadow: 'var(--shadow)' }}>
            <span className="w-16 h-16 rounded-full grid place-items-center mx-auto mb-4" style={{ background: '#FEE2E2', color: '#DC2626' }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6" /></svg>
            </span>
            <h3 className="text-[19px] font-extrabold mb-2" style={{ fontFamily: 'var(--font-bricolage)' }}>Excluir evento?</h3>
            <p className="text-[14px] font-medium mb-5" style={{ color: 'var(--ink-soft)' }}>
              Esta ação é permanente. Excluir <strong>{toDelete.title}</strong> removerá o evento e seus dados.
            </p>
            <div className="flex gap-2.5">
              <button onClick={() => setToDelete(null)} className="flex-1 rounded-[12px] py-3 font-extrabold text-[14px] transition hover:brightness-95" style={{ background: 'var(--line)', color: 'var(--ink-soft)' }}>Cancelar</button>
              <button onClick={applyDelete} className="flex-1 rounded-[12px] py-3 font-extrabold text-[14px] text-white transition hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}>Excluir</button>
            </div>
          </div>
        </div>
      )}

      {/* Producer detail card — event's producerUser is a stub until the admin
          events endpoint returns a real creator id; fetchDetails stays off
          until then to avoid firing GET /users/{id} with a fake id. */}
      {viewUser && <UserDetailCard user={viewUser} fetchDetails={false} onClose={() => setViewUser(null)} />}
    </div>
  )
}
