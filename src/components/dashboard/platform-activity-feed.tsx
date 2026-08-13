'use client'

/**
 * Feed de auditoria da plataforma (admin) — GET /admin/activities.
 *
 * Diferente do ActivityInbox do produtor, que só mostra o que acontece nos
 * eventos do próprio usuário: aqui entram as ações de todos os usuários e
 * produtores, incluindo tipos que não são de evento (cadastro, follow).
 */

import { useI18n } from '@/i18n/context'
import { relativeTime } from '@/lib/date'
import { UserAvatar } from '@/components/cms/user-avatar'
import type { PlatformActivity, PlatformActivityType } from '@/types/admin.types'

/** Glifo, cores e verbo por tipo de ação. */
const TYPE_STYLE: Record<PlatformActivityType, { symbol: string; bg: string; color: string; verb: string }> = {
  comment: { symbol: '💬', bg: '#E6F1FF', color: 'var(--blue)', verb: 'comentou em' },
  like: { symbol: '♥', bg: '#FFE9F2', color: 'var(--pink)', verb: 'curtiu' },
  attendance: { symbol: '✓', bg: '#EEEAFF', color: 'var(--violet)', verb: 'confirmou presença em' },
  share: { symbol: '↗', bg: '#E6FBF3', color: 'var(--green)', verb: 'compartilhou' },
  event_created: { symbol: '✦', bg: '#FFF4E5', color: '#F59E0B', verb: 'criou o evento' },
  user_signup: { symbol: '👤', bg: '#EFF3F8', color: 'var(--ink-soft)', verb: 'entrou na plataforma' },
  follow: { symbol: '→', bg: '#EEEAFF', color: 'var(--violet)', verb: 'começou a seguir' },
}

function ActorAvatar({ activity }: { activity: PlatformActivity }) {
  return (
    <UserAvatar
      name={activity.actor.name}
      image={activity.actor.profileImage}
      seed={activity.actor.id}
      size={34}
      radius={10}
    />
  )
}

export function PlatformActivityFeed({
  activities,
  isLoading,
  isError,
  onRetry,
}: {
  activities?: PlatformActivity[]
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
}) {
  const { locale } = useI18n()
  const items = activities ?? []

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 py-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-11 rounded-[10px] animate-pulse" style={{ background: 'var(--line-2)' }} />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-2.5 py-7 text-center">
        <span style={{ color: 'var(--pink)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></svg>
        </span>
        <span className="text-[13px] font-bold" style={{ color: 'var(--ink-soft)' }}>Não foi possível carregar a atividade</span>
        {onRetry && (
          <button onClick={onRetry} className="text-[12.5px] font-extrabold" style={{ color: 'var(--violet)' }}>
            Tentar novamente
          </button>
        )}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1.5 py-7 text-center" style={{ color: 'var(--wp-muted)' }}>
        <span style={{ color: 'var(--line)' }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8v4l3 2" /><circle cx="12" cy="12" r="9" /></svg>
        </span>
        <span className="text-[13px] font-bold" style={{ color: 'var(--ink-soft)' }}>Nenhuma atividade ainda</span>
        <span className="text-[12px] font-medium">As ações dos usuários aparecerão aqui</span>
      </div>
    )
  }

  return (
    <ul className="flex flex-col overflow-y-auto -mr-1 pr-1" style={{ maxHeight: 300 }}>
      {items.map((a, i) => {
        const style = TYPE_STYLE[a.type]
        const time = relativeTime(a.createdAt, locale)
        return (
          <li
            key={`${a.type}-${a.id}`}
            className="flex gap-2.5 py-2.5 items-start"
            style={{ borderBottom: i < items.length - 1 ? '1px solid var(--line-2)' : 'none' }}
          >
            <ActorAvatar activity={a} />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold leading-snug">
                <strong>{a.actor.name}</strong> <span style={{ color: 'var(--ink-soft)' }}>{style.verb}</span>
                {a.target.label && <> <strong>{a.target.label}</strong></>}
              </p>
              {a.type === 'comment' && a.data && (
                <p className="text-[12.5px] mt-0.5 truncate" style={{ color: 'var(--wp-muted)', fontWeight: 500 }}>
                  &ldquo;{a.data}&rdquo;
                </p>
              )}
              {time && (
                <span className="text-[11.5px] font-semibold" style={{ color: 'var(--wp-muted)' }}>{time}</span>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
