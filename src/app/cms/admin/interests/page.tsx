'use client'

/**
 * Gerenciar interesses (admin) — conectado à API real:
 *   GET    /interest          (lista)
 *   POST   /interest          (criar)
 *   PATCH  /interest/{id}      (editar nome/descrição/status)
 *   DELETE /interest/{id}      (excluir)
 *
 * Permite criar, editar, aprovar/rejeitar (moderação) e excluir interesses.
 * Sem dados mockados — usa React Query (useAdminInterests / useInterestMutations).
 */

import { useEffect, useMemo, useState } from 'react'
import { GRAD } from '@/lib/brand'
import { BackButton } from '@/components/cms/back-button'
import { useAdminInterests, useInterestMutations } from '@/hooks/use-admin-interests'
import type { AdminInterestDto, InterestStatus } from '@/types/events.types'

/* ---------------------------------------------------------------- helpers -- */

const card = { background: '#fff', border: '1px solid var(--line-2)', boxShadow: 'var(--shadow-sm)' } as const

const STATUS_META: Record<InterestStatus, { label: string; color: string; bg: string }> = {
  APPROVED: { label: 'Aprovado', color: 'var(--green)', bg: '#E6FBF3' },
  PENDING: { label: 'Pendente', color: 'var(--amber)', bg: '#FFF4E0' },
  REJECTED: { label: 'Rejeitado', color: '#DC2626', bg: '#FEE2E2' },
}

const CHIP_GRADS = [
  'linear-gradient(135deg,#7b5cff,#c54bff)',
  'linear-gradient(135deg,#FF9D3D,#F0309A)',
  'linear-gradient(135deg,#3E7BFB,#5b93ff)',
  'linear-gradient(135deg,#10A87D,#34d399)',
  'linear-gradient(135deg,#ec4899,#f472b6)',
]
function hashIndex(s: string, mod: number) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h % mod
}

/** Map whatever the API sends into a known status key, or undefined if it
 * isn't one we render (keeps STATUS_META lookups safe). */
function normalizeStatus(raw?: string | null): InterestStatus | undefined {
  const k = raw?.toUpperCase()
  return k === 'APPROVED' || k === 'PENDING' || k === 'REJECTED' ? k : undefined
}

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

function ModalShell({ onClose, children, width = 460 }: { onClose: () => void; children: React.ReactNode; width?: number }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.removeProperty('overflow')
    }
  }, [])
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{ background: 'rgba(17,24,39,.6)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div role="dialog" aria-modal="true" className="relative z-1 rounded-[24px] bg-white p-7" style={{ width: `min(92vw, ${width}px)`, boxShadow: 'var(--shadow)' }}>
        {children}
      </div>
    </div>
  )
}

const inputCls = 'w-full rounded-[12px] px-3.5 py-3 text-[14px] font-medium outline-none transition focus:border-violet'
const inputStyle = { background: '#fff', border: '1px solid var(--line)' } as const

/* ------------------------------------------------------------------- page -- */

type FormState = { id: string | null; name: string; description: string }

export default function InterestsPage() {
  const { data, isLoading, isError, refetch, isFetching } = useAdminInterests()
  const { create, update, remove } = useInterestMutations()

  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | InterestStatus>('all')
  const [form, setForm] = useState<FormState | null>(null)
  const [toDelete, setToDelete] = useState<AdminInterestDto | null>(null)

  // Normalize the status field up front so every downstream lookup is safe.
  const interests = useMemo<AdminInterestDto[]>(
    () => (data ?? []).map((i) => ({ ...i, status: normalizeStatus(i.status) })),
    [data],
  )
  const hasStatus = interests.some((i) => i.status)

  const stats = useMemo(() => ({
    total: interests.length,
    approved: interests.filter((i) => i.status === 'APPROVED').length,
    pending: interests.filter((i) => i.status === 'PENDING').length,
    rejected: interests.filter((i) => i.status === 'REJECTED').length,
  }), [interests])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return interests.filter((i) => {
      if (filter !== 'all' && i.status !== filter) return false
      if (!q) return true
      return i.name.toLowerCase().includes(q) || (i.description ?? '').toLowerCase().includes(q)
    })
  }, [interests, query, filter])

  function submitForm() {
    if (!form || !form.name.trim()) return
    const payload = { name: form.name.trim(), description: form.description.trim() || undefined }
    if (form.id) {
      update.mutate({ id: form.id, payload }, { onSuccess: () => setForm(null) })
    } else {
      create.mutate(payload, { onSuccess: () => setForm(null) })
    }
  }
  function setStatus(i: AdminInterestDto, status: InterestStatus) {
    update.mutate({ id: i.id, payload: { status } })
  }
  function confirmDelete() {
    if (!toDelete) return
    remove.mutate(toDelete.id, { onSuccess: () => setToDelete(null) })
  }

  const saving = create.isPending || update.isPending

  return (
    <div className="flex flex-col gap-5">
      <BackButton fallback="/cms/admin/control-panel" />

      {/* Header */}
      <div className="flex items-end gap-4 flex-wrap">
        <span className="w-14 h-14 rounded-[18px] grid place-items-center text-white flex-none" style={{ background: GRAD, boxShadow: '0 14px 28px -14px rgba(240,48,154,.7)' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.6-10-9C.6 9 2 5 5.5 5 8 5 9.4 6.6 12 9c2.6-2.4 4-4 6.5-4C22 5 23.4 9 22 12c-2.5 4.4-10 9-10 9z" /></svg>
        </span>
        <div className="min-w-0">
          <h1 className="font-extrabold text-[clamp(22px,5vw,30px)] leading-[1.05]" style={{ fontFamily: 'var(--font-bricolage)' }}>
            Gerenciar <span style={{ background: 'linear-gradient(120deg,var(--violet),var(--pink))', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>interesses</span>
          </h1>
          <p className="font-semibold mt-0.5 text-[14px]" style={{ color: 'var(--ink-soft)' }}>
            Categorias usadas para classificar eventos e recomendar para os usuários
            {isFetching && !isLoading && <span style={{ color: 'var(--violet)' }}> · atualizando…</span>}
          </p>
        </div>
        <button onClick={() => setForm({ id: null, name: '', description: '' })} className="ml-auto flex items-center gap-2 rounded-[14px] px-5 py-3.25 font-extrabold text-white transition hover:-translate-y-0.5" style={{ background: GRAD, boxShadow: '0 14px 28px -14px rgba(240,48,154,.7)' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M12 5v14M5 12h14" /></svg>
          Novo interesse
        </button>
      </div>

      {/* Stats */}
      <div className={`grid grid-cols-2 gap-4 ${hasStatus ? 'xl:grid-cols-4' : 'xl:grid-cols-1 max-w-xs'}`}>
        <StatCard value={isLoading ? '…' : String(stats.total)} label="Total de interesses" grad="linear-gradient(135deg,#7C5CFF,#a78bfa)" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.6-10-9C.6 9 2 5 5.5 5 8 5 9.4 6.6 12 9c2.6-2.4 4-4 6.5-4C22 5 23.4 9 22 12c-2.5 4.4-10 9-10 9z" /></svg>} />
        {hasStatus && <>
          <StatCard value={isLoading ? '…' : String(stats.approved)} label="Aprovados" grad="linear-gradient(135deg,#10A87D,#34d399)" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5" /></svg>} />
          <StatCard value={isLoading ? '…' : String(stats.pending)} label="Pendentes" grad="linear-gradient(135deg,#F59E0B,#fbbf24)" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>} />
          <StatCard value={isLoading ? '…' : String(stats.rejected)} label="Rejeitados" grad="linear-gradient(135deg,#ef4444,#f87171)" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="9" /><path d="M5.6 5.6l12.8 12.8" /></svg>} />
        </>}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-55">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--wp-muted)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
          </span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar interesse…" className="w-full rounded-[13px] pl-11 pr-4 py-3 text-[14px] font-medium outline-none transition focus:border-violet" style={{ background: '#fff', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }} />
        </div>
        {hasStatus && (
          <div className="flex p-1 rounded-[13px] flex-wrap" style={{ background: '#fff', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
            {([['all', 'Todos'], ['APPROVED', 'Aprovados'], ['PENDING', 'Pendentes'], ['REJECTED', 'Rejeitados']] as const).map(([v, l]) => (
              <button key={v} onClick={() => setFilter(v)} className="px-3.5 py-2 rounded-[10px] text-[13px] font-extrabold transition" style={filter === v ? { background: GRAD, color: '#fff' } : { color: 'var(--wp-muted)' }}>{l}</button>
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 min-[1280px]:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-[18px] h-24 animate-pulse" style={{ background: 'var(--line-2)' }} />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 py-16 rounded-[22px]" style={card}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--pink)" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></svg>
          <p className="text-[14px] font-semibold" style={{ color: 'var(--ink-soft)' }}>Não foi possível carregar os interesses</p>
          <button onClick={() => refetch()} className="rounded-[12px] px-5 py-2.5 font-extrabold text-[13.5px] text-white" style={{ background: GRAD }}>Tentar novamente</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 rounded-[22px]" style={card}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--wp-muted)" strokeWidth="1.6"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
          <span className="text-[14px] font-semibold" style={{ color: 'var(--wp-muted)' }}>{interests.length === 0 ? 'Nenhum interesse cadastrado ainda' : 'Nenhum interesse encontrado'}</span>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 min-[1280px]:grid-cols-3">
          {filtered.map((i) => {
            const busy = (update.isPending && update.variables?.id === i.id) || (remove.isPending && remove.variables === i.id)
            return (
              <div key={i.id} className="rounded-[18px] p-4 flex flex-col gap-3" style={{ ...card, opacity: busy ? 0.55 : 1 }}>
                <div className="flex items-start gap-3">
                  <span className="w-10 h-10 rounded-[12px] grid place-items-center text-white font-extrabold flex-none" style={{ background: CHIP_GRADS[hashIndex(i.id || i.name, CHIP_GRADS.length)], fontFamily: 'var(--font-bricolage)' }}>
                    {i.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold text-[15px] truncate" style={{ fontFamily: 'var(--font-bricolage)' }}>{i.name}</p>
                    {i.description ? (
                      <p className="text-[12.5px] font-medium line-clamp-2 mt-0.5" style={{ color: 'var(--wp-muted)' }}>{i.description}</p>
                    ) : (
                      <p className="text-[12.5px] font-medium mt-0.5 italic" style={{ color: 'var(--wp-muted)' }}>Sem descrição</p>
                    )}
                  </div>
                  {i.status && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold flex-none" style={{ background: STATUS_META[i.status].bg, color: STATUS_META[i.status].color }}>
                      {STATUS_META[i.status].label}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 mt-auto">
                  {i.status === 'PENDING' && (
                    <>
                      <button onClick={() => setStatus(i, 'APPROVED')} className="flex-1 flex items-center justify-center gap-1.5 rounded-[10px] py-2 text-[12.5px] font-extrabold transition hover:brightness-95" style={{ background: '#E6FBF3', color: 'var(--green)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M20 6L9 17l-5-5" /></svg>
                        Aprovar
                      </button>
                      <button onClick={() => setStatus(i, 'REJECTED')} className="flex-1 flex items-center justify-center gap-1.5 rounded-[10px] py-2 text-[12.5px] font-extrabold transition hover:brightness-95" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M6 6l12 12M18 6L6 18" /></svg>
                        Rejeitar
                      </button>
                    </>
                  )}
                  {i.status === 'REJECTED' && (
                    <button onClick={() => setStatus(i, 'APPROVED')} className="flex-1 flex items-center justify-center gap-1.5 rounded-[10px] py-2 text-[12.5px] font-extrabold transition hover:brightness-95" style={{ background: '#E6FBF3', color: 'var(--green)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M20 6L9 17l-5-5" /></svg>
                      Aprovar
                    </button>
                  )}
                  {i.status === 'APPROVED' && (
                    <button onClick={() => setStatus(i, 'REJECTED')} className="flex-1 flex items-center justify-center gap-1.5 rounded-[10px] py-2 text-[12.5px] font-extrabold transition hover:brightness-95" style={{ background: '#FFF4E0', color: 'var(--amber)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="9" /><path d="M5.6 5.6l12.8 12.8" /></svg>
                      Suspender
                    </button>
                  )}
                  <button onClick={() => setForm({ id: i.id, name: i.name, description: i.description ?? '' })} title="Editar" className="w-9 h-9 rounded-[10px] grid place-items-center flex-none transition hover:brightness-95" style={{ background: '#E0E7FF', color: '#4F46E5' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" /></svg>
                  </button>
                  <button onClick={() => setToDelete(i)} title="Excluir" className="w-9 h-9 rounded-[10px] grid place-items-center flex-none transition hover:brightness-95" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" /></svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create / edit modal */}
      {form && (
        <ModalShell onClose={() => !saving && setForm(null)}>
          <button onClick={() => !saving && setForm(null)} aria-label="Fechar" className="absolute top-4 right-4 w-8 h-8 rounded-[8px] grid place-items-center transition hover:bg-[#FFF0F3]" style={{ background: 'rgba(107,114,128,.1)', color: '#6b7280' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
          <h2 className="text-[20px] font-extrabold mb-1" style={{ fontFamily: 'var(--font-bricolage)' }}>{form.id ? 'Editar interesse' : 'Novo interesse'}</h2>
          <p className="text-[13.5px] font-medium mb-5" style={{ color: 'var(--ink-soft)' }}>{form.id ? 'Atualize o nome ou a descrição.' : 'Cadastre uma nova categoria de interesse.'}</p>

          <div className="flex flex-col gap-3.5">
            <div>
              <label className="block text-[13px] font-bold mb-1.5">Nome <span style={{ color: 'var(--pink)' }}>*</span></label>
              <input autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex.: Rock, Funk, Tecnologia…" className={inputCls} style={inputStyle} onKeyDown={(e) => { if (e.key === 'Enter') submitForm() }} />
            </div>
            <div>
              <label className="block text-[13px] font-bold mb-1.5">Descrição <span className="font-medium" style={{ color: 'var(--wp-muted)' }}>(opcional)</span></label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Breve descrição da categoria…" className={`${inputCls} resize-none`} style={inputStyle} />
            </div>
          </div>

          {(create.isError || update.isError) && (
            <p className="text-[12.5px] font-semibold mt-3" style={{ color: '#DC2626' }}>Não foi possível salvar. Tente novamente.</p>
          )}

          <div className="flex gap-2.5 mt-5">
            <button onClick={() => setForm(null)} disabled={saving} className="flex-1 rounded-[12px] py-3 font-extrabold text-[14px] transition hover:brightness-95 disabled:opacity-50" style={{ background: 'var(--line)', color: 'var(--ink-soft)' }}>Cancelar</button>
            <button onClick={submitForm} disabled={saving || !form.name.trim()} className="flex-1 rounded-[12px] py-3 font-extrabold text-[14px] text-white transition hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0" style={{ background: GRAD }}>
              {saving ? 'Salvando…' : form.id ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </ModalShell>
      )}

      {/* Delete confirm */}
      {toDelete && (
        <ModalShell onClose={() => !remove.isPending && setToDelete(null)} width={420}>
          <div className="text-center">
            <span className="w-16 h-16 rounded-full grid place-items-center mx-auto mb-4" style={{ background: '#FEE2E2', color: '#DC2626' }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6" /></svg>
            </span>
            <h3 className="text-[19px] font-extrabold mb-2" style={{ fontFamily: 'var(--font-bricolage)' }}>Excluir interesse?</h3>
            <p className="text-[14px] font-medium mb-5" style={{ color: 'var(--ink-soft)' }}>
              Excluir <strong>{toDelete.name}</strong> pode afetar eventos que usam essa categoria. Esta ação não pode ser desfeita.
            </p>
            {remove.isError && <p className="text-[12.5px] font-semibold mb-3" style={{ color: '#DC2626' }}>Falha ao excluir. Tente novamente.</p>}
            <div className="flex gap-2.5">
              <button onClick={() => setToDelete(null)} disabled={remove.isPending} className="flex-1 rounded-[12px] py-3 font-extrabold text-[14px] transition hover:brightness-95 disabled:opacity-50" style={{ background: 'var(--line)', color: 'var(--ink-soft)' }}>Cancelar</button>
              <button onClick={confirmDelete} disabled={remove.isPending} className="flex-1 rounded-[12px] py-3 font-extrabold text-[14px] text-white transition hover:-translate-y-0.5 disabled:opacity-50" style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}>
                {remove.isPending ? 'Excluindo…' : 'Excluir'}
              </button>
            </div>
          </div>
        </ModalShell>
      )}
    </div>
  )
}
