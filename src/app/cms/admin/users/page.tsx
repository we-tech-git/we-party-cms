'use client'

/**
 * Gestão de usuários (admin) — conectado à API real:
 *   GET  /users          (listagem, normalizada e ordenada por cadastro desc)
 *   GET  /users/{id}      (detalhe do perfil para o card de visualização)
 *   POST /users/{id}/block | /unblock   (bloqueio — impede login, mantém dados)
 *
 * Inclui busca, filtro por status, paginação, visualização detalhada e
 * exportação CSV. Trata erros de rede e impede ações duplicadas. O card de
 * visualização é o componente compartilhado UserDetailCard.
 */

import { useMemo, useState } from 'react'
import { GRAD } from '@/lib/brand'
import { BackButton } from '@/components/cms/back-button'
import { useAdminUsers, useUserBlockMutations } from '@/hooks/use-admin-users'
import { UserAvatar, UserStatusBadge, UserDetailCard, toUserDetails, fmtDate } from '@/components/cms/user-detail-card'
import type { AdminUser, UserStatus } from '@/types/users.types'

const card = { background: '#fff', border: '1px solid var(--line-2)', boxShadow: 'var(--shadow-sm)' } as const

const PER_PAGE = 8

function isAdminRole(role: string | null): boolean {
  return (role ?? '').toLowerCase().includes('admin')
}

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

export default function UsersPage() {
  const { data, isLoading, isError, refetch, isFetching } = useAdminUsers()
  const { block, unblock, remove, makeAdmin } = useUserBlockMutations()

  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | UserStatus>('all')
  const [page, setPage] = useState(1)
  const [detail, setDetail] = useState<AdminUser | null>(null)
  const [toToggle, setToToggle] = useState<AdminUser | null>(null)
  const [toDelete, setToDelete] = useState<AdminUser | null>(null)
  const [toMakeAdmin, setToMakeAdmin] = useState<AdminUser | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const users = useMemo(() => data?.users ?? [], [data])

  const stats = useMemo(() => {
    const total = users.length
    const blocked = users.filter((u) => u.status === 'blocked').length
    const producers = users.filter((u) => (u.role ?? '').toUpperCase().includes('PROD')).length
    return { total, active: total - blocked, blocked, producers }
  }, [users])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return users.filter((u) => {
      if (filter !== 'all' && u.status !== filter) return false
      if (!q) return true
      return u.name.toLowerCase().includes(q) || (u.username ?? '').toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    })
  }, [users, query, filter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const pageItems = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)

  const pendingId = block.isPending
    ? block.variables
    : unblock.isPending
      ? unblock.variables
      : remove.isPending
        ? remove.variables
        : makeAdmin.isPending
          ? makeAdmin.variables
          : null

  function applyToggle() {
    if (!toToggle) return
    setActionError(null)
    const mut = toToggle.status === 'active' ? block : unblock
    mut.mutate(toToggle.id, {
      onSuccess: () => setToToggle(null),
      onError: () => setActionError('Não foi possível concluir a ação. Verifique sua conexão e tente novamente.'),
    })
  }

  function applyDelete() {
    if (!toDelete) return
    setActionError(null)
    remove.mutate(toDelete.id, {
      onSuccess: () => setToDelete(null),
      onError: () => setActionError('Não foi possível excluir o usuário. Verifique sua conexão e tente novamente.'),
    })
  }

  function applyMakeAdmin() {
    if (!toMakeAdmin) return
    setActionError(null)
    makeAdmin.mutate(toMakeAdmin.id, {
      onSuccess: () => setToMakeAdmin(null),
      onError: () => setActionError('Não foi possível conceder o privilégio de admin. Verifique sua conexão e tente novamente.'),
    })
  }

  function exportCsv() {
    const header = ['Nome', 'Usuário', 'E-mail', 'Função', 'Status', 'Cadastro']
    const rows = filtered.map((u) => [u.name, u.username ?? '', u.email, u.role ?? '', u.status === 'active' ? 'Ativo' : 'Bloqueado', fmtDate(u.createdAt)])
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `usuarios-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-5">
      <BackButton fallback="/cms/admin/control-panel" />

      {/* Header */}
      <div className="flex items-end gap-4 flex-wrap">
        <span className="w-14 h-14 rounded-[18px] grid place-items-center text-white flex-none" style={{ background: GRAD, boxShadow: '0 14px 28px -14px rgba(240,48,154,.7)' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="9" cy="8" r="3.5" /><path d="M3 21v-1a6 6 0 0112 0v1M16 4.5a3.5 3.5 0 010 7M21 21v-1a6 6 0 00-4-5.7" /></svg>
        </span>
        <div className="min-w-0">
          <h1 className="font-extrabold text-[clamp(22px,5vw,30px)] leading-[1.05]" style={{ fontFamily: 'var(--font-bricolage)' }}>
            Gestão de <span style={{ background: 'linear-gradient(120deg,var(--violet),var(--pink))', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>usuários</span>
          </h1>
          <p className="font-semibold mt-0.5 text-[14px]" style={{ color: 'var(--ink-soft)' }}>
            Visualize e modere todas as contas da plataforma
            {isFetching && !isLoading && <span style={{ color: 'var(--violet)' }}> · atualizando…</span>}
          </p>
        </div>
        <button onClick={exportCsv} disabled={isLoading || filtered.length === 0} className="ml-auto flex items-center gap-2 rounded-[14px] px-5 py-3.25 font-extrabold text-white transition hover:-translate-y-0.5 disabled:opacity-40 disabled:translate-y-0" style={{ background: GRAD, boxShadow: '0 14px 28px -14px rgba(240,48,154,.7)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></svg>
          Exportar CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard value={isLoading ? '…' : String(stats.total)} label="Total de usuários" grad="linear-gradient(135deg,#3E7BFB,#60a5fa)" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="9" cy="8" r="3.2" /><path d="M3 20v-1a6 6 0 0112 0v1M16 5a3.2 3.2 0 010 6M21 20v-1a6 6 0 00-4-5.6" /></svg>} />
        <StatCard value={isLoading ? '…' : String(stats.active)} label="Usuários ativos" grad="linear-gradient(135deg,#10A87D,#34d399)" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5" /></svg>} />
        <StatCard value={isLoading ? '…' : String(stats.blocked)} label="Bloqueados" grad="linear-gradient(135deg,#ef4444,#f87171)" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="9" /><path d="M5.6 5.6l12.8 12.8" /></svg>} />
        <StatCard value={isLoading ? '…' : String(stats.producers)} label="Produtores" grad="linear-gradient(135deg,#7C5CFF,#a78bfa)" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 2l2.4 6.9H22l-6 4.3 2.3 7-6.3-4.6L5.7 20l2.3-7-6-4.3h7.6z" /></svg>} />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-55">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--wp-muted)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
          </span>
          <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }} placeholder="Buscar por nome, @usuário ou e-mail…" className="w-full rounded-[13px] pl-11 pr-4 py-3 text-[14px] font-medium outline-none transition focus:border-violet" style={{ background: '#fff', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }} />
        </div>
        <div className="flex p-1 rounded-[13px]" style={{ background: '#fff', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
          {([['all', 'Todos'], ['active', 'Ativos'], ['blocked', 'Bloqueados']] as const).map(([val, label]) => (
            <button key={val} onClick={() => { setFilter(val); setPage(1) }} className="px-3.5 py-2 rounded-[10px] text-[13px] font-extrabold transition" style={filter === val ? { background: GRAD, color: '#fff' } : { color: 'var(--wp-muted)' }}>{label}</button>
          ))}
        </div>
      </div>

      {/* Action error banner */}
      {actionError && (
        <div className="flex items-center gap-2.5 rounded-[14px] px-4 py-3" style={{ background: '#FEE2E2', border: '1px solid #fecaca' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.2"><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></svg>
          <span className="text-[13px] font-semibold flex-1" style={{ color: '#DC2626' }}>{actionError}</span>
          <button onClick={() => setActionError(null)} className="text-[18px] leading-none px-1" style={{ color: '#DC2626' }} aria-label="Fechar">×</button>
        </div>
      )}

      {/* Body */}
      {isLoading ? (
        <div className="rounded-[22px] p-5" style={card}>
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-13 rounded-[12px] mb-2 animate-pulse" style={{ background: 'var(--line-2)' }} />)}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 py-16 rounded-[22px]" style={card}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--pink)" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></svg>
          <p className="text-[14px] font-semibold" style={{ color: 'var(--ink-soft)' }}>Não foi possível carregar os usuários</p>
          <button onClick={() => refetch()} className="rounded-[12px] px-5 py-2.5 font-extrabold text-[13.5px] text-white" style={{ background: GRAD }}>Tentar novamente</button>
        </div>
      ) : (
        <div className="rounded-[22px] overflow-hidden" style={card}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-180">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  {['Usuário', 'E-mail', 'Função', 'Cadastro', 'Status', 'Ações'].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-[11.5px] font-extrabold uppercase tracking-wide" style={{ color: 'var(--wp-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageItems.map((u) => {
                  const busy = pendingId === u.id
                  return (
                    <tr key={u.id} className="transition-colors hover:bg-[#FBFAFE]" style={{ borderBottom: '1px solid var(--line-2)', opacity: busy ? 0.55 : 1 }}>
                      <td className="px-5 py-3.5">
                        <button onClick={() => setDetail(u)} className="flex items-center gap-3 text-left transition hover:opacity-80" title="Ver perfil">
                          <UserAvatar user={u} />
                          <div className="min-w-0">
                            <p className="font-bold text-[14px] truncate">{u.name}</p>
                            {u.username && <p className="text-[12px] font-medium" style={{ color: 'var(--wp-muted)' }}>@{u.username}</p>}
                          </div>
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-[13.5px] font-medium" style={{ color: 'var(--ink-soft)' }}>{u.email}</td>
                      <td className="px-5 py-3.5">
                        {u.role ? <span className="text-[12px] font-bold px-2.5 py-1 rounded-[8px]" style={(u.role).toUpperCase().includes('PROD') ? { background: '#EEEAFF', color: 'var(--violet)' } : { background: 'var(--line-2)', color: 'var(--ink-soft)' }}>{u.role}</span> : <span style={{ color: 'var(--wp-muted)' }}>—</span>}
                      </td>
                      <td className="px-5 py-3.5 text-[13.5px] font-medium tabular-nums" style={{ color: 'var(--ink-soft)' }}>{fmtDate(u.createdAt)}</td>
                      <td className="px-5 py-3.5"><UserStatusBadge status={u.status} /></td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-1.5">
                          <button onClick={() => setDetail(u)} title="Ver perfil" className="w-9 h-9 rounded-[10px] grid place-items-center transition hover:brightness-95" style={{ background: '#E0E7FF', color: '#4F46E5' }}>
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>
                          </button>
                          {!isAdminRole(u.role) && (
                            <button onClick={() => { setActionError(null); setToMakeAdmin(u) }} disabled={busy} title="Tornar admin" className="w-9 h-9 rounded-[10px] grid place-items-center transition hover:brightness-95 disabled:opacity-50" style={{ background: '#EEEAFF', color: 'var(--violet)' }}>
                              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 2l2.4 6.9H22l-6 4.3 2.3 7-6.3-4.6L5.7 20l2.3-7-6-4.3h7.6z" /></svg>
                            </button>
                          )}
                          <button onClick={() => { setActionError(null); setToToggle(u) }} disabled={busy} title={u.status === 'active' ? 'Bloquear' : 'Desbloquear'} className="w-9 h-9 rounded-[10px] grid place-items-center transition hover:brightness-95 disabled:opacity-50" style={u.status === 'active' ? { background: '#FEE2E2', color: '#DC2626' } : { background: '#E6FBF3', color: 'var(--green)' }}>
                            {u.status === 'active'
                              ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="9" /><path d="M5.6 5.6l12.8 12.8" /></svg>
                              : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5" /></svg>}
                          </button>
                          <button onClick={() => { setActionError(null); setToDelete(u) }} disabled={busy} title="Excluir" className="w-9 h-9 rounded-[10px] grid place-items-center transition hover:brightness-95 disabled:opacity-50" style={{ background: 'var(--line)', color: 'var(--ink-soft)' }}>
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {pageItems.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-14" style={{ color: 'var(--wp-muted)' }}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
              <span className="text-[14px] font-semibold">{users.length === 0 ? 'Nenhum usuário cadastrado' : 'Nenhum usuário encontrado'}</span>
            </div>
          )}

          {pageItems.length > 0 && (
            <div className="flex items-center justify-between gap-4 px-5 py-4" style={{ borderTop: '1px solid var(--line-2)' }}>
              <span className="text-[13px] font-medium" style={{ color: 'var(--wp-muted)' }}>{filtered.length} usuário(s) · página {safePage} de {totalPages}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} className="w-9 h-9 rounded-[10px] grid place-items-center transition disabled:opacity-40 hover:bg-[#FBFAFE]" style={{ border: '1px solid var(--line)' }} aria-label="Anterior">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="w-9 h-9 rounded-[10px] grid place-items-center transition disabled:opacity-40 hover:bg-[#FBFAFE]" style={{ border: '1px solid var(--line)' }} aria-label="Próxima">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M9 18l6-6-6-6" /></svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail card */}
      {detail && (
        <UserDetailCard
          user={toUserDetails(detail)}
          onClose={() => setDetail(null)}
          onToggleBlock={(u) => { setActionError(null); setToToggle(u) }}
          onMakeAdmin={!isAdminRole(detail.role) ? (u) => { setActionError(null); setToMakeAdmin(u) } : undefined}
        />
      )}

      {/* Block / unblock confirm */}
      {toToggle && (() => {
        const blocking = toToggle.status === 'active'
        const busy = pendingId === toToggle.id
        return (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <div className="absolute inset-0" style={{ background: 'rgba(17,24,39,.6)', backdropFilter: 'blur(4px)' }} onClick={() => !busy && setToToggle(null)} />
            <div role="dialog" aria-modal="true" className="relative z-1 rounded-[24px] bg-white p-7 text-center" style={{ width: 'min(92vw, 420px)', boxShadow: 'var(--shadow)' }}>
              <span className="w-16 h-16 rounded-full grid place-items-center mx-auto mb-4" style={{ background: blocking ? '#FEE2E2' : '#E6FBF3', color: blocking ? '#DC2626' : 'var(--green)' }}>
                {blocking
                  ? <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="9" /><path d="M5.6 5.6l12.8 12.8" /></svg>
                  : <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5" /></svg>}
              </span>
              <h3 className="text-[19px] font-extrabold mb-2" style={{ fontFamily: 'var(--font-bricolage)' }}>{blocking ? 'Bloquear usuário?' : 'Desbloquear usuário?'}</h3>
              <p className="text-[14px] font-medium mb-5" style={{ color: 'var(--ink-soft)' }}>
                {blocking ? 'O usuário perderá o acesso à plataforma (os dados são mantidos):' : 'O usuário voltará a ter acesso à plataforma:'} <strong>{toToggle.name}</strong>
              </p>
              {actionError && <p className="text-[12.5px] font-semibold mb-3" style={{ color: '#DC2626' }}>{actionError}</p>}
              <div className="flex gap-2.5">
                <button onClick={() => setToToggle(null)} disabled={busy} className="flex-1 rounded-[12px] py-3 font-extrabold text-[14px] transition hover:brightness-95 disabled:opacity-50" style={{ background: 'var(--line)', color: 'var(--ink-soft)' }}>Cancelar</button>
                <button onClick={applyToggle} disabled={busy} className="flex-1 rounded-[12px] py-3 font-extrabold text-[14px] text-white transition hover:-translate-y-0.5 disabled:opacity-60" style={{ background: blocking ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'linear-gradient(135deg,#10b981,#059669)' }}>
                  {busy ? 'Processando…' : blocking ? 'Bloquear' : 'Desbloquear'}
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Make admin confirm */}
      {toMakeAdmin && (() => {
        const busy = pendingId === toMakeAdmin.id
        return (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <div className="absolute inset-0" style={{ background: 'rgba(17,24,39,.6)', backdropFilter: 'blur(4px)' }} onClick={() => !busy && setToMakeAdmin(null)} />
            <div role="dialog" aria-modal="true" className="relative z-1 rounded-[24px] bg-white p-7 text-center" style={{ width: 'min(92vw, 420px)', boxShadow: 'var(--shadow)' }}>
              <span className="w-16 h-16 rounded-full grid place-items-center mx-auto mb-4" style={{ background: '#EEEAFF', color: 'var(--violet)' }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 2l2.4 6.9H22l-6 4.3 2.3 7-6.3-4.6L5.7 20l2.3-7-6-4.3h7.6z" /></svg>
              </span>
              <h3 className="text-[19px] font-extrabold mb-2" style={{ fontFamily: 'var(--font-bricolage)' }}>Tornar admin?</h3>
              <p className="text-[14px] font-medium mb-5" style={{ color: 'var(--ink-soft)' }}>
                <strong>{toMakeAdmin.name}</strong> passará a ter acesso total de administrador na plataforma.
              </p>
              {actionError && <p className="text-[12.5px] font-semibold mb-3" style={{ color: '#DC2626' }}>{actionError}</p>}
              <div className="flex gap-2.5">
                <button onClick={() => setToMakeAdmin(null)} disabled={busy} className="flex-1 rounded-[12px] py-3 font-extrabold text-[14px] transition hover:brightness-95 disabled:opacity-50" style={{ background: 'var(--line)', color: 'var(--ink-soft)' }}>Cancelar</button>
                <button onClick={applyMakeAdmin} disabled={busy} className="flex-1 rounded-[12px] py-3 font-extrabold text-[14px] text-white transition hover:-translate-y-0.5 disabled:opacity-60" style={{ background: GRAD }}>
                  {busy ? 'Processando…' : 'Tornar admin'}
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Delete confirm */}
      {toDelete && (() => {
        const busy = pendingId === toDelete.id
        return (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <div className="absolute inset-0" style={{ background: 'rgba(17,24,39,.6)', backdropFilter: 'blur(4px)' }} onClick={() => !busy && setToDelete(null)} />
            <div role="dialog" aria-modal="true" className="relative z-1 rounded-[24px] bg-white p-7 text-center" style={{ width: 'min(92vw, 420px)', boxShadow: 'var(--shadow)' }}>
              <span className="w-16 h-16 rounded-full grid place-items-center mx-auto mb-4" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6" /></svg>
              </span>
              <h3 className="text-[19px] font-extrabold mb-2" style={{ fontFamily: 'var(--font-bricolage)' }}>Excluir usuário?</h3>
              <p className="text-[14px] font-medium mb-5" style={{ color: 'var(--ink-soft)' }}>
                Esta ação é permanente e remove todos os dados de <strong>{toDelete.name}</strong>. Considere bloquear em vez de excluir.
              </p>
              {actionError && <p className="text-[12.5px] font-semibold mb-3" style={{ color: '#DC2626' }}>{actionError}</p>}
              <div className="flex gap-2.5">
                <button onClick={() => setToDelete(null)} disabled={busy} className="flex-1 rounded-[12px] py-3 font-extrabold text-[14px] transition hover:brightness-95 disabled:opacity-50" style={{ background: 'var(--line)', color: 'var(--ink-soft)' }}>Cancelar</button>
                <button onClick={applyDelete} disabled={busy} className="flex-1 rounded-[12px] py-3 font-extrabold text-[14px] text-white transition hover:-translate-y-0.5 disabled:opacity-60" style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}>
                  {busy ? 'Excluindo…' : 'Excluir'}
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
