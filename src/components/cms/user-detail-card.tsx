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

import { useEffect } from 'react'
import { useUserDetails } from '@/hooks/use-admin-users'
import type { AdminUser, AdminUserDetails, UserStatus } from '@/types/users.types'

const AVATAR_GRADS = [
  'linear-gradient(135deg,#7b5cff,#c54bff)',
  'linear-gradient(135deg,#FF9D3D,#F0309A)',
  'linear-gradient(135deg,#3E7BFB,#5b93ff)',
  'linear-gradient(135deg,#10A87D,#34d399)',
  'linear-gradient(135deg,#ec4899,#f472b6)',
]
function initials(name: string) {
  const p = name.trim().split(/\s+/)
  return ((p[0]?.[0] ?? '') + (p[1]?.[0] ?? '')).toUpperCase() || '?'
}
function hashIndex(s: string, mod: number) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h % mod
}

export function fmtDate(iso: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}
export function fmtNum(n: number | null) {
  return n == null ? '—' : n.toLocaleString('pt-BR')
}

export function UserAvatar({ user, size = 42 }: { user: { name: string; id: string; profileImage: string | null }; size?: number }) {
  if (user.profileImage) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={user.profileImage} alt={user.name} className="rounded-full object-cover flex-none" style={{ width: size, height: size }} />
  }
  return (
    <span className="grid place-items-center text-white font-extrabold flex-none rounded-full" style={{ width: size, height: size, background: AVATAR_GRADS[hashIndex(user.id || user.name, AVATAR_GRADS.length)], fontFamily: 'var(--font-bricolage)', fontSize: size * 0.4 }}>
      {initials(user.name)}
    </span>
  )
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
  return { ...user, lastActive: null, eventsConfirmed: null, eventsLiked: null, eventsCommented: null }
}

export function UserDetailCard({
  user,
  onClose,
  onToggleBlock,
  fetchDetails = true,
}: {
  user: AdminUserDetails
  onClose: () => void
  onToggleBlock?: (u: AdminUserDetails) => void
  fetchDetails?: boolean
}) {
  const { data, isLoading, isError } = useUserDetails(fetchDetails ? user.id : null)
  const u = data ?? user
  const loadingMetrics = fetchDetails && isLoading && !data
  const metric = (v: number | null) => (loadingMetrics && v == null ? '…' : fmtNum(v))

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
          <UserAvatar user={u} size={72} />
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

        {/* Event metrics */}
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {[
            { label: 'Confirmados', value: u.eventsConfirmed, color: 'var(--green)', bg: '#E6FBF3' },
            { label: 'Curtidos', value: u.eventsLiked, color: 'var(--pink)', bg: '#FFE9F2' },
            { label: 'Comentados', value: u.eventsCommented, color: 'var(--blue)', bg: '#E6F1FF' },
          ].map((m) => (
            <div key={m.label} className="rounded-[14px] px-3 py-3 text-center" style={{ background: m.bg }}>
              <div className="text-[20px] font-extrabold leading-none tabular-nums" style={{ color: m.color, fontFamily: 'var(--font-bricolage)' }}>{metric(m.value)}</div>
              <div className="text-[11.5px] font-bold mt-1" style={{ color: 'var(--ink-soft)' }}>{m.label}</div>
            </div>
          ))}
        </div>

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
  )
}
