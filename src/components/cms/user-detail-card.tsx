'use client'

/**
 * Card de visualização de usuário, compartilhado entre as telas de Usuários e
 * Eventos. Mostra e-mail, cadastro, última atividade e contagem de eventos
 * confirmados / curtidos / comentados.
 *
 * Quando `fetchDetails` é true (padrão), busca o perfil completo via
 * GET /users/{id} e mescla por cima dos dados recebidos; caso a busca falhe ou
 * esteja desativada, exibe o que foi passado em `user`.
 */

import { useEffect, useState } from 'react'
import { useUserDetails } from '@/hooks/use-admin-users'
import type { AdminUser, AdminUserDetails, UserComment, UserEventRef, UserStatus } from '@/types/users.types'
import { UserAvatar } from './user-avatar'

export function fmtDate(iso: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}
export function fmtNum(n: number | null) {
  return n == null ? '—' : n.toLocaleString('pt-BR')
}

export function UserStatusBadge({ status }: { status: UserStatus }) {
  const active = status === 'active'
  return (
    <span className="inline-flex items-center gap-1.5 px-2.75 py-1 rounded-full text-[12px] font-extrabold" style={{ background: active ? '#E6FBF3' : '#FEE2E2', color: active ? 'var(--green)' : '#DC2626' }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: active ? 'var(--green)' : '#DC2626' }} />
      {active ? 'Ativo' : 'Bloqueado'}
    </span>
  )
}

/** Build a details object from a list row, leaving the richer fields empty. */
export function toUserDetails(user: AdminUser): AdminUserDetails {
  return {
    ...user,
    lastActive: null,
    eventsConfirmed: null,
    eventsLiked: null,
    eventsCommented: null,
    confirmedEvents: [],
    likedEvents: [],
    comments: [],
  }
}

type ActivityTab = 'confirmed' | 'liked' | 'commented'

/** Small date used inside the activity lists (dd/mm/aa). */
function fmtShort(iso: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

function EventList({ items, emptyLabel }: { items: UserEventRef[]; emptyLabel: string }) {
  if (items.length === 0) return <EmptyActivity label={emptyLabel} />
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((e) => (
        <li key={e.id} className="flex items-center justify-between gap-3 rounded-[10px] px-3 py-2.25" style={{ background: '#fff', border: '1px solid var(--line-2)' }}>
          <span className="text-[13px] font-bold truncate">{e.title}</span>
          <span className="text-[11.5px] font-semibold tabular-nums flex-none" style={{ color: 'var(--wp-muted)' }}>
            {fmtShort(e.at ?? e.startDate)}
          </span>
        </li>
      ))}
    </ul>
  )
}

function CommentList({ items }: { items: UserComment[] }) {
  if (items.length === 0) return <EmptyActivity label="Nenhum comentário publicado" />
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((c) => (
        <li key={c.id} className="rounded-[10px] px-3 py-2.25" style={{ background: '#fff', border: '1px solid var(--line-2)' }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11.5px] font-extrabold truncate" style={{ color: 'var(--violet)' }}>
              {c.eventTitle ?? 'Evento removido'}
            </span>
            {c.isReply && (
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-[6px] flex-none" style={{ background: '#EEEAFF', color: 'var(--violet)' }}>
                resposta
              </span>
            )}
            <span className="ml-auto text-[11px] font-semibold tabular-nums flex-none" style={{ color: 'var(--wp-muted)' }}>
              {fmtShort(c.createdAt)}
            </span>
          </div>
          <p className="text-[13px] font-medium break-words" style={{ color: 'var(--ink-soft)' }}>{c.content}</p>
        </li>
      ))}
    </ul>
  )
}

function EmptyActivity({ label }: { label: string }) {
  return (
    <p className="text-[13px] font-semibold text-center py-5" style={{ color: 'var(--wp-muted)' }}>
      {label}
    </p>
  )
}

export function UserDetailCard({
  user,
  onClose,
  onToggleBlock,
  onMakeAdmin,
  fetchDetails = true,
}: {
  user: AdminUserDetails
  onClose: () => void
  onToggleBlock?: (u: AdminUserDetails) => void
  onMakeAdmin?: (u: AdminUserDetails) => void
  fetchDetails?: boolean
}) {
  const { data, isLoading, isError } = useUserDetails(fetchDetails ? user.id : null)
  const u = data ?? user
  const loadingMetrics = fetchDetails && isLoading && !data
  const metric = (v: number | null) => (loadingMetrics && v == null ? '…' : fmtNum(v))

  // Aba de atividade aberta; `null` mantém o card compacto (estado inicial).
  const [tab, setTab] = useState<ActivityTab | null>(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.removeProperty('overflow')
    }
  }, [])

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{ background: 'rgba(17,24,39,.6)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div role="dialog" aria-modal="true" className="relative z-1 rounded-[24px] bg-white p-7" style={{ width: 'min(92vw, 500px)', boxShadow: 'var(--shadow)' }}>
        <button onClick={onClose} aria-label="Fechar" className="absolute top-4 right-4 w-8 h-8 rounded-[8px] grid place-items-center transition hover:bg-[#FFF0F3]" style={{ background: 'rgba(107,114,128,.1)', color: '#6b7280' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>

        <div className="flex items-center gap-4 mb-5">
          <UserAvatar name={u.name} image={u.profileImage} seed={u.id || u.name} size={72} />
          <div className="min-w-0">
            <h2 className="text-[20px] font-extrabold leading-tight truncate" style={{ fontFamily: 'var(--font-bricolage)' }}>{u.name}</h2>
            {u.username && <p className="text-[13px] font-medium mb-1.5" style={{ color: 'var(--wp-muted)' }}>@{u.username}</p>}
            <UserStatusBadge status={u.status} />
          </div>
        </div>

        {isError && (
          <p className="text-[12.5px] font-semibold mb-3 rounded-[10px] px-3 py-2" style={{ background: '#FEE2E2', color: '#DC2626' }}>
            Não foi possível carregar todos os detalhes. Exibindo o que já tínhamos.
          </p>
        )}

        {/* Event metrics — clicáveis: abrem a lista da atividade correspondente */}
        <div className={tab ? 'grid grid-cols-3 gap-2.5 mb-2.5' : 'grid grid-cols-3 gap-2.5 mb-4'}>
          {([
            { id: 'confirmed', label: 'Confirmados', value: u.eventsConfirmed, count: u.confirmedEvents.length, color: 'var(--green)', bg: '#E6FBF3' },
            { id: 'liked', label: 'Curtidos', value: u.eventsLiked, count: u.likedEvents.length, color: 'var(--pink)', bg: '#FFE9F2' },
            { id: 'commented', label: 'Comentados', value: u.eventsCommented, count: u.comments.length, color: 'var(--blue)', bg: '#E6F1FF' },
          ] as const).map((m) => {
            const open = tab === m.id
            // Sem itens não há o que abrir — o tile vira um indicador estático.
            const clickable = m.count > 0
            return (
              <button
                key={m.id}
                type="button"
                disabled={!clickable}
                aria-expanded={open}
                onClick={() => setTab(open ? null : m.id)}
                title={clickable ? `Ver ${m.label.toLowerCase()}` : undefined}
                className="rounded-[14px] px-3 py-3 text-center transition disabled:cursor-default enabled:hover:-translate-y-0.5"
                style={{ background: m.bg, boxShadow: open ? `inset 0 0 0 2px ${m.color}` : undefined }}
              >
                <div className="text-[20px] font-extrabold leading-none tabular-nums" style={{ color: m.color, fontFamily: 'var(--font-bricolage)' }}>{metric(m.value)}</div>
                <div className="text-[11.5px] font-bold mt-1" style={{ color: 'var(--ink-soft)' }}>{m.label}</div>
              </button>
            )
          })}
        </div>

        {/* Painel de atividade da aba aberta */}
        {tab && (
          <div className="rounded-[14px] p-2.5 mb-4 max-h-56 overflow-y-auto" style={{ background: '#FBFAFE', border: '1px solid var(--line-2)' }}>
            {tab === 'confirmed' && <EventList items={u.confirmedEvents} emptyLabel="Nenhuma presença confirmada" />}
            {tab === 'liked' && <EventList items={u.likedEvents} emptyLabel="Nenhum evento curtido" />}
            {tab === 'commented' && <CommentList items={u.comments} />}
          </div>
        )}

        <div className="flex flex-col gap-2 mb-5">
          {([
            ['E-mail', u.email],
            ['Função', u.role ?? '—'],
            ['Cadastrado em', fmtDate(u.createdAt)],
            ['Última atividade', loadingMetrics && !u.lastActive ? '…' : fmtDate(u.lastActive)],
          ] as const).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-3 rounded-[10px] px-4 py-2.75" style={{ background: '#FBFAFE' }}>
              <span className="text-[13px] font-medium" style={{ color: 'var(--wp-muted)' }}>{label}</span>
              <span className="text-[13.5px] font-bold text-right truncate">{value}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2.5">
          {onMakeAdmin && (
            <button onClick={() => onMakeAdmin(u)} className="w-full flex items-center justify-center gap-2 rounded-[12px] py-3 font-extrabold text-[14px] transition hover:brightness-95" style={{ background: '#EEEAFF', color: 'var(--violet)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 2l2.4 6.9H22l-6 4.3 2.3 7-6.3-4.6L5.7 20l2.3-7-6-4.3h7.6z" /></svg>Tornar admin
            </button>
          )}
          {onToggleBlock && (
            <button onClick={() => onToggleBlock(u)} className="w-full flex items-center justify-center gap-2 rounded-[12px] py-3 font-extrabold text-[14px] transition hover:brightness-95" style={u.status === 'active' ? { background: '#FEE2E2', color: '#DC2626' } : { background: '#E6FBF3', color: 'var(--green)' }}>
              {u.status === 'active' ? (
                <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="9" /><path d="M5.6 5.6l12.8 12.8" /></svg>Bloquear usuário</>
              ) : (
                <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5" /></svg>Desbloquear usuário</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
