'use client'

import { useMemo, useState } from 'react'
import { GRAD } from '@/lib/brand'
import { BackButton } from '@/components/cms/back-button'
import { useAdminReports, useReportMutations } from '@/hooks/use-admin-reports'
import type { ReportDto, ReportStatus, ReportType } from '@/types/reports.types'

const card = { background: '#fff', border: '1px solid var(--line-2)', boxShadow: 'var(--shadow-sm)' } as const

const STATUS_META: Record<ReportStatus, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Pendente', color: 'var(--amber)', bg: '#FFF4E0' },
  ACCEPTED: { label: 'Aceita', color: 'var(--green)', bg: '#E6FBF3' },
  REJECTED: { label: 'Rejeitada', color: '#DC2626', bg: '#FEE2E2' },
}

const TAB_ITEMS = [
  { key: 'all' as const, label: 'Todas' },
  { key: 'EVENT' as const, label: 'Eventos' },
  { key: 'COMMENT' as const, label: 'Comentários' },
  { key: 'INTEREST_COMMENT' as const, label: 'Comentários de interesse' },
]

const TYPE_LABEL: Record<ReportType, string> = {
  EVENT: 'Evento',
  COMMENT: 'Comentário',
  INTEREST_COMMENT: 'Comentário de interesse',
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

function ModalShell({ onClose, children, width = 520 }: { onClose: () => void; children: React.ReactNode; width?: number }) {
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{ background: 'rgba(17,24,39,.6)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div role="dialog" aria-modal="true" className="relative z-1 rounded-[24px] bg-white p-7 max-h-[85vh] overflow-y-auto" style={{ width: `min(92vw, ${width}px)`, boxShadow: 'var(--shadow)' }}>
        {children}
      </div>
    </div>
  )
}

export default function ReportsPage() {
  const [tab, setTab] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all')
  const [detail, setDetail] = useState<ReportDto | null>(null)

  const typeParam = tab === 'all' ? undefined : tab
  const statusParam = statusFilter === 'all' ? undefined : statusFilter

  const { data, isLoading, isError, refetch } = useAdminReports({
    status: statusParam,
    type: typeParam as ReportType | undefined,
    limit: 50,
  })
  const { updateStatus } = useReportMutations()

  const reports = useMemo(() => data?.data ?? [], [data])
  const stats = useMemo(() => ({
    total: data?.total ?? 0,
    pending: reports.filter((r) => r.status === 'PENDING').length,
    accepted: reports.filter((r) => r.status === 'ACCEPTED').length,
    rejected: reports.filter((r) => r.status === 'REJECTED').length,
  }), [reports, data?.total])

  const handleAction = (id: string, status: 'ACCEPTED' | 'REJECTED') => {
    updateStatus.mutate({ id, status }, { onSuccess: () => setDetail(null) })
  }

  return (
    <div className="flex flex-col gap-5">
      <BackButton fallback="/cms/admin/control-panel" />

      <div className="flex items-end gap-4 flex-wrap">
        <span className="w-14 h-14 rounded-[18px] grid place-items-center text-white flex-none" style={{ background: GRAD, boxShadow: '0 14px 28px -14px rgba(240,48,154,.7)' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 22s-8-4.5-10.5-9.5C-.5 9 1.5 5 5 5c1.8 0 3.5.9 7 3.5C15.5 5.9 17.2 5 19 5c3.5 0 5.5 4 3.5 7.5C20 17.5 12 22 12 22z" /><path d="M7 13l3 3 7-7" /></svg>
        </span>
        <div className="min-w-0">
          <h1 className="font-extrabold text-[clamp(22px,5vw,30px)] leading-[1.05]" style={{ fontFamily: 'var(--font-bricolage)' }}>
            Moderação de <span style={{ background: 'linear-gradient(120deg,var(--violet),var(--pink))', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>denúncias</span>
          </h1>
          <p className="font-semibold mt-0.5 text-[14px]" style={{ color: 'var(--ink-soft)' }}>
            Revise e gerencie denúncias de eventos e comentários
          </p>
        </div>
      </div>

      <div className={`grid grid-cols-2 gap-4 ${reports.length > 0 ? 'xl:grid-cols-4' : 'xl:grid-cols-1 max-w-xs'}`}>
        <StatCard value={isLoading ? '…' : String(stats.total)} label="Total de denúncias" grad="linear-gradient(135deg,#7C5CFF,#a78bfa)" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 22s-8-4.5-10.5-9.5C-.5 9 1.5 5 5 5c1.8 0 3.5.9 7 3.5C15.5 5.9 17.2 5 19 5c3.5 0 5.5 4 3.5 7.5C20 17.5 12 22 12 22z" /></svg>} />
        {reports.length > 0 && <>
          <StatCard value={isLoading ? '…' : String(stats.pending)} label="Pendentes" grad="linear-gradient(135deg,#F59E0B,#fbbf24)" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>} />
          <StatCard value={isLoading ? '…' : String(stats.accepted)} label="Aceitas" grad="linear-gradient(135deg,#10A87D,#34d399)" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5" /></svg>} />
          <StatCard value={isLoading ? '…' : String(stats.rejected)} label="Rejeitadas" grad="linear-gradient(135deg,#ef4444,#f87171)" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="9" /><path d="M5.6 5.6l12.8 12.8" /></svg>} />
        </>}
      </div>

      {/* Tabs */}
      <div className="flex p-1 rounded-[13px] flex-wrap self-start" style={{ background: '#fff', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
        {TAB_ITEMS.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)} className="px-4 py-2 rounded-[10px] text-[13px] font-extrabold transition" style={tab === key ? { background: GRAD, color: '#fff' } : { color: 'var(--wp-muted)' }}>{label}</button>
        ))}
      </div>

      {/* Status filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex p-1 rounded-[13px] flex-wrap" style={{ background: '#fff', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
          {([['all', 'Todos'], ['PENDING', 'Pendentes'], ['ACCEPTED', 'Aceitas'], ['REJECTED', 'Rejeitadas']] as const).map(([v, l]) => (
            <button key={v} onClick={() => setStatusFilter(v)} className="px-3.5 py-2 rounded-[10px] text-[13px] font-extrabold transition" style={statusFilter === v ? { background: GRAD, color: '#fff' } : { color: 'var(--wp-muted)' }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 min-[1280px]:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-[18px] h-28 animate-pulse" style={{ background: 'var(--line-2)' }} />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 py-16 rounded-[22px]" style={card}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--pink)" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></svg>
          <p className="text-[14px] font-semibold" style={{ color: 'var(--ink-soft)' }}>Não foi possível carregar as denúncias</p>
          <button onClick={() => refetch()} className="rounded-[12px] px-5 py-2.5 font-extrabold text-[13.5px] text-white" style={{ background: GRAD }}>Tentar novamente</button>
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 rounded-[22px]" style={card}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--wp-muted)" strokeWidth="1.6"><path d="M20 6L9 17l-5-5" /></svg>
          <span className="text-[14px] font-semibold" style={{ color: 'var(--wp-muted)' }}>Nenhuma denúncia encontrada</span>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 min-[1280px]:grid-cols-3">
          {reports.map((r) => {
            const busy = updateStatus.isPending
            const isEvent = r.type === 'EVENT'
            const isInterestComment = r.type === 'INTEREST_COMMENT'
            const badgeGrad = isEvent
              ? 'linear-gradient(135deg,#3E7BFB,#5b93ff)'
              : isInterestComment
                ? 'linear-gradient(135deg,#7C5CFF,#a78bfa)'
                : 'linear-gradient(135deg,#10A87D,#34d399)'
            const badgeLetter = isEvent ? 'E' : isInterestComment ? 'I' : 'C'
            const title = isEvent ? r.event?.title : isInterestComment ? r.interestComment?.content : r.comment?.content
            return (
              <div key={r.id} className="rounded-[18px] p-4 flex flex-col gap-3 cursor-pointer transition hover:-translate-y-0.5" style={{ ...card, opacity: busy ? 0.55 : 1 }} onClick={() => !busy && setDetail(r)}>
                <div className="flex items-start gap-3">
                  <span className="w-10 h-10 rounded-[12px] grid place-items-center text-white font-extrabold flex-none" style={{ background: badgeGrad, fontFamily: 'var(--font-bricolage)' }}>
                    {badgeLetter}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold text-[14px] line-clamp-2" style={{ fontFamily: 'var(--font-bricolage)' }}>
                      {title}
                    </p>
                    <p className="text-[11.5px] font-medium mt-0.5" style={{ color: 'var(--wp-muted)' }}>
                      {TYPE_LABEL[r.type]} · por @{r.reporter.username} · {new Date(r.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-extrabold flex-none" style={{ background: STATUS_META[r.status].bg, color: STATUS_META[r.status].color }}>
                    {STATUS_META[r.status].label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Detail modal */}
      {detail && (
        <ModalShell onClose={() => !updateStatus.isPending && setDetail(null)} width={560}>
          <button onClick={() => !updateStatus.isPending && setDetail(null)} aria-label="Fechar" className="absolute top-4 right-4 w-8 h-8 rounded-[8px] grid place-items-center transition hover:bg-[#FFF0F3]" style={{ background: 'rgba(107,114,128,.1)', color: '#6b7280' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
          <div className="flex flex-col gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold mb-2" style={{ background: STATUS_META[detail.status].bg, color: STATUS_META[detail.status].color }}>
                {STATUS_META[detail.status].label}
              </span>
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold ml-2"
                style={
                  detail.type === 'EVENT'
                    ? { background: '#E0E7FF', color: '#4F46E5' }
                    : detail.type === 'INTEREST_COMMENT'
                      ? { background: '#EDE9FE', color: '#7C5CFF' }
                      : { background: '#E6FBF3', color: 'var(--green)' }
                }
              >
                {TYPE_LABEL[detail.type]}
              </span>
              <h2 className="text-[20px] font-extrabold mt-2" style={{ fontFamily: 'var(--font-bricolage)' }}>
                {detail.type === 'EVENT' ? detail.event?.title : TYPE_LABEL[detail.type]}
              </h2>
            </div>

            {/* Reporter */}
            <div className="rounded-[14px] p-4" style={{ background: '#F9FAFB' }}>
              <p className="text-[11px] font-extrabold uppercase tracking-wider mb-2" style={{ color: 'var(--wp-muted)' }}>Denunciante</p>
              <p className="text-[14px] font-extrabold">{detail.reporter.name} <span className="font-medium" style={{ color: 'var(--wp-muted)' }}>@{detail.reporter.username}</span></p>
              <p className="text-[12px] font-medium mt-0.5" style={{ color: 'var(--wp-muted)' }}>
                {new Date(detail.createdAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {/* Content */}
            {detail.type === 'EVENT' && detail.event && (
              <div className="rounded-[14px] p-4" style={{ background: '#F9FAFB' }}>
                <p className="text-[11px] font-extrabold uppercase tracking-wider mb-2" style={{ color: 'var(--wp-muted)' }}>Evento reportado</p>
                <p className="text-[15px] font-extrabold" style={{ fontFamily: 'var(--font-bricolage)' }}>{detail.event.title}</p>
                <p className="text-[12px] font-medium mt-1" style={{ color: 'var(--wp-muted)' }}>
                  Criado por {detail.event.creator.name} · {new Date(detail.event.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}

            {detail.type === 'COMMENT' && detail.comment && (
              <div className="rounded-[14px] p-4" style={{ background: '#F9FAFB' }}>
                <p className="text-[11px] font-extrabold uppercase tracking-wider mb-2" style={{ color: 'var(--wp-muted)' }}>Comentário reportado</p>
                <p className="text-[14px] font-medium">{detail.comment.content}</p>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-[12px] font-extrabold">{detail.comment.user.name}</p>
                  <p className="text-[12px] font-medium" style={{ color: 'var(--wp-muted)' }}>
                    {new Date(detail.comment.createdAt).toLocaleDateString('pt-BR')}
                    {detail.comment.parentId ? ' · Resposta' : ''}
                  </p>
                </div>
              </div>
            )}

            {detail.type === 'INTEREST_COMMENT' && detail.interestComment && (
              <div className="rounded-[14px] p-4" style={{ background: '#F9FAFB' }}>
                <p className="text-[11px] font-extrabold uppercase tracking-wider mb-2" style={{ color: 'var(--wp-muted)' }}>Comentário reportado</p>
                <p className="text-[14px] font-medium">{detail.interestComment.content}</p>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-[12px] font-extrabold">{detail.interestComment.user.name}</p>
                  <p className="text-[12px] font-medium" style={{ color: 'var(--wp-muted)' }}>
                    {new Date(detail.interestComment.createdAt).toLocaleDateString('pt-BR')}
                    {detail.interestComment.parentId ? ' · Resposta' : ''}
                  </p>
                </div>
              </div>
            )}

            {/* Reason */}
            {detail.reason && (
              <div className="rounded-[14px] p-4" style={{ background: '#F9FAFB' }}>
                <p className="text-[11px] font-extrabold uppercase tracking-wider mb-2" style={{ color: 'var(--wp-muted)' }}>Motivo</p>
                <p className="text-[13px] font-medium" style={{ color: 'var(--ink-soft)' }}>{detail.reason}</p>
              </div>
            )}

            {/* Actions */}
            {detail.status === 'PENDING' && (
              <div className="flex gap-2.5 mt-1">
                <button
                  onClick={() => handleAction(detail.id, 'ACCEPTED')}
                  disabled={updateStatus.isPending}
                  className="flex-1 flex items-center justify-center gap-2 rounded-[12px] py-3 font-extrabold text-[14px] text-white transition hover:-translate-y-0.5 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#10A87D,#34d399)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M20 6L9 17l-5-5" /></svg>
                  {updateStatus.isPending ? 'Processando…' : 'Aceitar'}
                </button>
                <button
                  onClick={() => handleAction(detail.id, 'REJECTED')}
                  disabled={updateStatus.isPending}
                  className="flex-1 flex items-center justify-center gap-2 rounded-[12px] py-3 font-extrabold text-[14px] text-white transition hover:-translate-y-0.5 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M6 6l12 12M18 6L6 18" /></svg>
                  {updateStatus.isPending ? 'Processando…' : 'Rejeitar'}
                </button>
              </div>
            )}
          </div>
        </ModalShell>
      )}
    </div>
  )
}