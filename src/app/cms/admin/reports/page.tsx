'use client'

/**
 * Moderação de denúncias (admin) — conectado à API real:
 *   GET   /reports       (lista, filtros status/type)
 *   PATCH /reports/{id}  (aceitar/rejeitar)
 *
 * Sem dados mockados — usa React Query (useAdminReports / useReportMutations).
 * A API pagina em no máximo 100 itens por chamada; a UI busca 100 por aba de
 * status e avisa quando `total` é maior do que o que veio, em vez de fingir
 * paginação de verdade.
 */

import { useMemo, useState } from 'react'
import { GRAD } from '@/lib/brand'
import { BackButton } from '@/components/cms/back-button'
import { UserAvatar } from '@/components/cms/user-avatar'
import { relativeTime } from '@/lib/date'
import { useI18n } from '@/i18n/context'
import { useAdminReports, useReportMutations } from '@/hooks/use-admin-reports'
import type { ReportDto, ReportStatus } from '@/types/reports.types'

/* ---------------------------------------------------------------- helpers -- */

const card = { background: '#fff', border: '1px solid var(--line-2)', boxShadow: 'var(--shadow-sm)' } as const

const STATUS_META: Record<ReportStatus, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Pendente', color: 'var(--amber)', bg: '#FFF4E0' },
  ACCEPTED: { label: 'Aceita', color: 'var(--green)', bg: '#E6FBF3' },
  REJECTED: { label: 'Rejeitada', color: '#DC2626', bg: '#FEE2E2' },
}

const eventIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="4" width="18" height="18" rx="3" /><path d="M3 9h18M8 2v4M16 2v4" /></svg>
)
const commentIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 15a4 4 0 01-4 4H8l-5 4V7a4 4 0 014-4h10a4 4 0 014 4z" /></svg>
)

const TYPE_META: Record<ReportDto['type'], { label: string; icon: React.ReactNode }> = {
  EVENT: { label: 'Evento', icon: eventIcon },
  COMMENT: { label: 'Comentário', icon: commentIcon },
  INTEREST_COMMENT: { label: 'Comentário de interesse', icon: commentIcon },
}

const STATUS_TABS: { value: ReportStatus | undefined; label: string }[] = [
  { value: 'PENDING', label: 'Pendentes' },
  { value: 'ACCEPTED', label: 'Aceitas' },
  { value: 'REJECTED', label: 'Rejeitadas' },
  { value: undefined, label: 'Todas' },
]

const TYPE_TABS: { value: 'ALL' | 'EVENT' | 'COMMENT'; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'EVENT', label: 'Eventos' },
  { value: 'COMMENT', label: 'Comentários' },
]

/** Resumo do conteúdo denunciado — evento ou comentário (de evento ou de
 * interesse), tolerando o alvo ter sido removido nesse meio tempo. */
function TargetPreview({ report }: { report: ReportDto }) {
  const muted = { color: 'var(--wp-muted)' } as const

  if (report.type === 'EVENT') {
    if (!report.event) {
      return <p className="text-[13px] font-medium italic" style={muted}>Evento não encontrado (pode ter sido removido).</p>
    }
    return (
      <div>
        <p className="text-[13.5px] font-bold truncate">{report.event.title}</p>
        <p className="text-[12px] font-medium" style={muted}>Criado por {report.event.creator.name}</p>
      </div>
    )
  }

  const comment = report.type === 'COMMENT' ? report.comment : report.interestComment
  if (!comment) {
    return <p className="text-[13px] font-medium italic" style={muted}>Comentário não encontrado (pode ter sido removido).</p>
  }
  return (
    <div>
      <p className="text-[13.5px] font-semibold italic line-clamp-2">&ldquo;{comment.content}&rdquo;</p>
      <p className="text-[12px] font-medium mt-0.5" style={muted}>por {comment.user.name}</p>
    </div>
  )
}

/* ------------------------------------------------------------------- page -- */

export default function ReportsPage() {
  const { locale } = useI18n()
  const [statusTab, setStatusTab] = useState<ReportStatus | undefined>('PENDING')
  const [typeTab, setTypeTab] = useState<'ALL' | 'EVENT' | 'COMMENT'>('ALL')
  const [query, setQuery] = useState('')

  const { data, isLoading, isError, refetch, isFetching } = useAdminReports(statusTab)
  const { updateStatus } = useReportMutations()

  const reports = useMemo(() => data?.data ?? [], [data])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return reports.filter((r) => {
      if (typeTab === 'EVENT' && r.type !== 'EVENT') return false
      if (typeTab === 'COMMENT' && r.type === 'EVENT') return false
      if (!q) return true
      const haystack = [
        r.reason,
        r.reporter.name,
        r.reporter.username,
        r.event?.title,
        r.comment?.content,
        r.interestComment?.content,
      ].filter(Boolean).join(' ').toLowerCase()
      return haystack.includes(q)
    })
  }, [reports, typeTab, query])

  function setDecision(id: string, status: ReportStatus) {
    updateStatus.mutate({ id, status })
  }

  return (
    <div className="flex flex-col gap-5">
      <BackButton fallback="/cms/admin/control-panel" />

      {/* Header */}
      <div className="flex items-end gap-4 flex-wrap">
        <span className="w-14 h-14 rounded-[18px] grid place-items-center text-white flex-none" style={{ background: GRAD, boxShadow: '0 14px 28px -14px rgba(240,48,154,.7)' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><path d="M4 22V15" /></svg>
        </span>
        <div className="min-w-0">
          <h1 className="font-extrabold text-[clamp(22px,5vw,30px)] leading-[1.05]" style={{ fontFamily: 'var(--font-bricolage)' }}>
            <span style={{ background: 'linear-gradient(120deg,var(--violet),var(--pink))', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>Denúncias</span>
          </h1>
          <p className="font-semibold mt-0.5 text-[14px]" style={{ color: 'var(--ink-soft)' }}>
            Eventos e comentários denunciados por usuários
            {isFetching && !isLoading && <span style={{ color: 'var(--violet)' }}> · atualizando…</span>}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-55">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--wp-muted)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por motivo, denunciante ou conteúdo…"
              className="w-full rounded-[13px] pl-11 pr-4 py-3 text-[14px] font-medium outline-none transition focus:border-violet"
              style={{ background: '#fff', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}
            />
          </div>
          <div className="flex p-1 rounded-[13px] flex-wrap" style={{ background: '#fff', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
            {TYPE_TABS.map((t) => (
              <button key={t.value} onClick={() => setTypeTab(t.value)} className="px-3.5 py-2 rounded-[10px] text-[13px] font-extrabold transition" style={typeTab === t.value ? { background: GRAD, color: '#fff' } : { color: 'var(--wp-muted)' }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex p-1 rounded-[13px] flex-wrap w-fit" style={{ background: '#fff', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
          {STATUS_TABS.map((t) => (
            <button key={t.label} onClick={() => setStatusTab(t.value)} className="px-3.5 py-2 rounded-[10px] text-[13px] font-extrabold transition" style={statusTab === t.value ? { background: GRAD, color: '#fff' } : { color: 'var(--wp-muted)' }}>
              {t.label}
            </button>
          ))}
        </div>

        {!isLoading && !isError && data && data.total > data.data.length && (
          <p className="text-[12px] font-semibold" style={{ color: 'var(--wp-muted)' }}>
            Mostrando {data.data.length} de {data.total.toLocaleString('pt-BR')} — refine o filtro de status pra ver o restante.
          </p>
        )}
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-[18px] h-28 animate-pulse" style={{ background: 'var(--line-2)' }} />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 py-16 rounded-[22px]" style={card}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--pink)" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></svg>
          <p className="text-[14px] font-semibold" style={{ color: 'var(--ink-soft)' }}>Não foi possível carregar as denúncias</p>
          <button onClick={() => refetch()} className="rounded-[12px] px-5 py-2.5 font-extrabold text-[13.5px] text-white" style={{ background: GRAD }}>Tentar novamente</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 rounded-[22px]" style={card}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
          <span className="text-[14px] font-semibold" style={{ color: 'var(--wp-muted)' }}>
            {reports.length === 0 ? 'Nenhuma denúncia nessa categoria' : 'Nenhuma denúncia encontrada'}
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((r) => {
            const busy = updateStatus.isPending && updateStatus.variables?.id === r.id
            return (
              <div key={r.id} className="rounded-[18px] p-4 flex flex-col sm:flex-row sm:items-center gap-4" style={{ ...card, opacity: busy ? 0.55 : 1 }}>
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <UserAvatar name={r.reporter.name} seed={r.reporter.id} size={38} radius={12} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[13.5px] font-extrabold truncate">{r.reporter.name}</p>
                      <span className="text-[11px] font-bold" style={{ color: 'var(--wp-muted)' }}>@{r.reporter.username}</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-extrabold" style={{ background: '#EEEAFF', color: 'var(--violet)' }}>
                        {TYPE_META[r.type].icon}
                        {TYPE_META[r.type].label}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-extrabold" style={{ background: STATUS_META[r.status].bg, color: STATUS_META[r.status].color }}>
                        {STATUS_META[r.status].label}
                      </span>
                    </div>
                    {r.reason && (
                      <p className="text-[13px] font-medium mt-1" style={{ color: 'var(--ink-soft)' }}>&ldquo;{r.reason}&rdquo;</p>
                    )}
                    <div className="mt-2 rounded-[12px] px-3 py-2" style={{ background: '#FBFAFE', border: '1px solid var(--line-2)' }}>
                      <TargetPreview report={r} />
                    </div>
                    <p className="text-[11.5px] font-semibold mt-1.5" style={{ color: 'var(--wp-muted)' }}>{relativeTime(r.createdAt, locale)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-none">
                  {r.status === 'PENDING' && (
                    <>
                      <button onClick={() => setDecision(r.id, 'ACCEPTED')} disabled={busy} className="flex items-center justify-center gap-1.5 rounded-[10px] px-3.5 py-2 text-[12.5px] font-extrabold transition hover:brightness-95 disabled:opacity-50" style={{ background: '#E6FBF3', color: 'var(--green)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M20 6L9 17l-5-5" /></svg>
                        Aceitar
                      </button>
                      <button onClick={() => setDecision(r.id, 'REJECTED')} disabled={busy} className="flex items-center justify-center gap-1.5 rounded-[10px] px-3.5 py-2 text-[12.5px] font-extrabold transition hover:brightness-95 disabled:opacity-50" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M6 6l12 12M18 6L6 18" /></svg>
                        Rejeitar
                      </button>
                    </>
                  )}
                  {r.status === 'ACCEPTED' && (
                    <button onClick={() => setDecision(r.id, 'REJECTED')} disabled={busy} className="flex items-center justify-center gap-1.5 rounded-[10px] px-3.5 py-2 text-[12.5px] font-extrabold transition hover:brightness-95 disabled:opacity-50" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                    Marcar como rejeitada
                    </button>
                  )}
                  {r.status === 'REJECTED' && (
                    <button onClick={() => setDecision(r.id, 'ACCEPTED')} disabled={busy} className="flex items-center justify-center gap-1.5 rounded-[10px] px-3.5 py-2 text-[12.5px] font-extrabold transition hover:brightness-95 disabled:opacity-50" style={{ background: '#E6FBF3', color: 'var(--green)' }}>
                    Marcar como aceita
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {updateStatus.isError && (
        <p className="text-[12.5px] font-semibold text-center" style={{ color: '#DC2626' }}>Não foi possível atualizar a denúncia. Tente novamente.</p>
      )}
    </div>
  )
}
