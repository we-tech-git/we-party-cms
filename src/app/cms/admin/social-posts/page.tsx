'use client'

/**
 * Fila de aprovação de Posts Sociais (admin) — conectado à API real:
 *   GET  /admin/social-posts        (lista, filtro por status)
 *   GET  /admin/social-posts/{id}   (prévia completa)
 *   POST /admin/social-posts/{id}/approve
 *   POST /admin/social-posts/{id}/reject
 *
 * Os posts chegam aqui via POST /social-posts, gerado pelo squad
 * `weparty-mkt-content` (Opensquad, repo separado) — carrossel/story já
 * renderizado com o texto aplicado, não uma descrição. Aprovar/Rejeitar
 * aqui só muda o status da fila: publicar de fato no Instagram é uma
 * etapa futura, ainda não implementada (ver
 * openspec/changes/social-posts-approval-queue no repo do backend).
 */

import { useMemo, useState } from 'react'
import { GRAD } from '@/lib/brand'
import { BackButton } from '@/components/cms/back-button'
import { relativeTime } from '@/lib/date'
import { useI18n } from '@/i18n/context'
import { useAdminSocialPosts, useSocialPostMutations } from '@/hooks/use-admin-social-posts'
import type { SocialPostDto, SocialPostFormat, SocialPostStatus } from '@/types/social-posts.types'

/* ---------------------------------------------------------------- helpers -- */

const card = { background: '#fff', border: '1px solid var(--line-2)', boxShadow: 'var(--shadow-sm)' } as const

const STATUS_META: Record<SocialPostStatus, { label: string; color: string; bg: string }> = {
  PENDING_APPROVAL: { label: 'Pendente', color: 'var(--amber)', bg: '#FFF4E0' },
  APPROVED: { label: 'Aprovado', color: 'var(--green)', bg: '#E6FBF3' },
  REJECTED: { label: 'Rejeitado', color: '#DC2626', bg: '#FEE2E2' },
}

const FORMAT_META: Record<SocialPostFormat, { label: string; ratio: string }> = {
  FEED_CAROUSEL: { label: 'Carrossel (Feed)', ratio: '3 / 4' },
  STORY: { label: 'Story', ratio: '9 / 16' },
}

const STATUS_TABS: { value: SocialPostStatus | undefined; label: string }[] = [
  { value: 'PENDING_APPROVAL', label: 'Pendentes' },
  { value: 'APPROVED', label: 'Aprovados' },
  { value: 'REJECTED', label: 'Rejeitados' },
  { value: undefined, label: 'Todos' },
]

/* ------------------------------------------------------------ media view -- */

function PostThumb({ post }: { post: SocialPostDto }) {
  const ratio = FORMAT_META[post.format].ratio
  return (
    <div className="rounded-[12px] overflow-hidden flex-none" style={{ width: 52, aspectRatio: ratio, background: 'var(--line-2)' }}>
      {post.mediaUrls[0] && (
        // eslint-disable-next-line @next/next/no-img-element -- URL externa (R2), sem next/image configurado pro domínio ainda
        <img src={post.mediaUrls[0]} alt="" className="w-full h-full object-cover" />
      )}
    </div>
  )
}

/** Carrossel navegável (3:4) pro feed, ou peça única (9:16) pro story. */
function MediaViewer({ post }: { post: SocialPostDto }) {
  const [index, setIndex] = useState(0)
  const ratio = FORMAT_META[post.format].ratio
  const urls = post.mediaUrls
  const current = urls[Math.min(index, Math.max(urls.length - 1, 0))]

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative rounded-[18px] overflow-hidden w-full"
        style={{ maxWidth: post.format === 'STORY' ? 260 : 340, aspectRatio: ratio, background: 'var(--line-2)', border: '1px solid var(--line-2)' }}
      >
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element -- URL externa (R2), sem next/image configurado pro domínio ainda
          <img key={current} src={current} alt={`Peça ${index + 1} de ${urls.length}`} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid place-items-center text-[13px] font-semibold text-center px-4" style={{ color: 'var(--wp-muted)' }}>
            Sem mídia recebida
          </div>
        )}

        {urls.length > 1 && (
          <>
            <button
              onClick={() => setIndex((i) => (i - 1 + urls.length) % urls.length)}
              aria-label="Peça anterior"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full grid place-items-center text-white transition hover:brightness-110"
              style={{ background: 'rgba(0,0,0,.45)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <button
              onClick={() => setIndex((i) => (i + 1) % urls.length)}
              aria-label="Próxima peça"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full grid place-items-center text-white transition hover:brightness-110"
              style={{ background: 'rgba(0,0,0,.45)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M9 18l6-6-6-6" /></svg>
            </button>
            <span
              className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10.5px] font-extrabold text-white"
              style={{ background: 'rgba(0,0,0,.45)' }}
            >
              {index + 1}/{urls.length}
            </span>
          </>
        )}
      </div>

      {urls.length > 1 && (
        <div className="flex items-center gap-1.5">
          {urls.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Ir pra peça ${i + 1}`}
              className="rounded-full transition-all"
              style={{ width: i === index ? 18 : 6, height: 6, background: i === index ? GRAD : 'var(--line)' }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* --------------------------------------------------------- detail panel -- */

function DetailPanel({
  post,
  onApprove,
  onReject,
  approving,
  rejecting,
}: {
  post: SocialPostDto
  onApprove: () => void
  onReject: (reason: string) => void
  approving: boolean
  rejecting: boolean
}) {
  const { locale } = useI18n()
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [reason, setReason] = useState('')
  const busy = approving || rejecting

  function submitReject() {
    if (!reason.trim()) return
    onReject(reason.trim())
    setShowRejectForm(false)
    setReason('')
  }

  return (
    <div className="rounded-[22px] p-5 flex flex-col gap-5" style={card}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold" style={{ background: '#EEEAFF', color: 'var(--violet)' }}>
            {FORMAT_META[post.format].label}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold" style={{ background: STATUS_META[post.status].bg, color: STATUS_META[post.status].color }}>
            {STATUS_META[post.status].label}
          </span>
        </div>
        <span className="text-[11.5px] font-semibold" style={{ color: 'var(--wp-muted)' }}>{relativeTime(post.createdAt, locale)}</span>
      </div>

      <MediaViewer post={post} />

      {post.eventTitle && (
        <p className="text-[13.5px] font-bold text-center">{post.eventTitle}</p>
      )}

      <div>
        <p className="text-[11.5px] font-extrabold uppercase tracking-wide mb-1.5" style={{ color: 'var(--wp-muted)' }}>Legenda</p>
        <p className="text-[13.5px] font-medium whitespace-pre-wrap leading-relaxed">{post.caption}</p>
      </div>

      {post.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.hashtags.map((h) => (
            <span key={h} className="px-2 py-0.5 rounded-full text-[11.5px] font-bold" style={{ background: '#FBFAFE', border: '1px solid var(--line-2)', color: 'var(--violet)' }}>
              #{h.replace(/^#/, '')}
            </span>
          ))}
        </div>
      )}

      {post.squadRunId && (
        <p className="text-[11.5px] font-semibold" style={{ color: 'var(--wp-muted)' }}>
          Gerado pelo squad · run <code>{post.squadRunId}</code>
        </p>
      )}

      {post.status === 'REJECTED' && post.rejectionReason && (
        <div className="rounded-[12px] px-3 py-2.5" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
          <p className="text-[11.5px] font-extrabold" style={{ color: '#DC2626' }}>Motivo da rejeição</p>
          <p className="text-[13px] font-medium mt-0.5" style={{ color: 'var(--ink-soft)' }}>{post.rejectionReason}</p>
        </div>
      )}

      {post.status === 'PENDING_APPROVAL' && (
        <div className="flex flex-col gap-2.5 pt-1 border-t" style={{ borderColor: 'var(--line-2)' }}>
          {!showRejectForm ? (
            <div className="flex items-center gap-2 pt-3">
              <button
                onClick={onApprove}
                disabled={busy}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-[12px] px-4 py-2.75 text-[13.5px] font-extrabold text-white transition hover:brightness-105 disabled:opacity-50"
                style={{ background: GRAD }}
              >
                {approving ? 'Aprovando…' : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M20 6L9 17l-5-5" /></svg>
                    Aprovar
                  </>
                )}
              </button>
              <button
                onClick={() => setShowRejectForm(true)}
                disabled={busy}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-[12px] px-4 py-2.75 text-[13.5px] font-extrabold transition hover:brightness-95 disabled:opacity-50"
                style={{ background: '#FEE2E2', color: '#DC2626' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M6 6l12 12M18 6L6 18" /></svg>
                Rejeitar
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-3">
              <label className="text-[12px] font-bold" style={{ color: 'var(--ink-soft)' }}>Motivo da rejeição</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex.: legenda soou como venda direta, imagem com baixo contraste…"
                rows={3}
                className="w-full rounded-[12px] px-3.5 py-2.5 text-[13px] font-medium outline-none resize-none"
                style={{ background: '#fff', border: '1px solid var(--line)' }}
                autoFocus
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={submitReject}
                  disabled={busy || !reason.trim()}
                  className="flex-1 rounded-[12px] px-4 py-2.5 text-[13px] font-extrabold text-white transition disabled:opacity-50"
                  style={{ background: '#DC2626' }}
                >
                  {rejecting ? 'Rejeitando…' : 'Confirmar rejeição'}
                </button>
                <button
                  onClick={() => { setShowRejectForm(false); setReason('') }}
                  disabled={busy}
                  className="rounded-[12px] px-4 py-2.5 text-[13px] font-bold"
                  style={{ color: 'var(--wp-muted)' }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------- page -- */

export default function SocialPostsPage() {
  const { locale } = useI18n()
  const [statusTab, setStatusTab] = useState<SocialPostStatus | undefined>('PENDING_APPROVAL')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const { data: posts, isLoading, isError, refetch, isFetching } = useAdminSocialPosts(statusTab)
  const { approve, reject } = useSocialPostMutations()

  const list = useMemo(() => posts ?? [], [posts])
  const selected = useMemo(() => list.find((p) => p.id === selectedId) ?? list[0] ?? null, [list, selectedId])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }

  function handleApprove(id: string) {
    approve.mutate(id, {
      onSuccess: () => showToast('Post aprovado.'),
      onError: () => showToast('Não foi possível aprovar. Tente novamente.'),
    })
  }

  function handleReject(id: string, reason: string) {
    reject.mutate({ id, reason }, {
      onSuccess: () => showToast('Post rejeitado.'),
      onError: () => showToast('Não foi possível rejeitar. Tente novamente.'),
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <BackButton fallback="/cms/admin/control-panel" />

      {/* Header */}
      <div className="flex items-end gap-4 flex-wrap">
        <span className="w-14 h-14 rounded-[18px] grid place-items-center text-white flex-none" style={{ background: GRAD, boxShadow: '0 14px 28px -14px rgba(240,48,154,.7)' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="2" y="3" width="20" height="14" rx="3" /><path d="M8 21h8M12 17v4" /></svg>
        </span>
        <div className="min-w-0">
          <h1 className="font-extrabold text-[clamp(22px,5vw,30px)] leading-[1.05]" style={{ fontFamily: 'var(--font-bricolage)' }}>
            <span style={{ background: 'linear-gradient(120deg,var(--violet),var(--pink))', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>Posts Sociais</span>
          </h1>
          <p className="font-semibold mt-0.5 text-[14px]" style={{ color: 'var(--ink-soft)' }}>
            Prévia dos carrosséis/stories gerados pelo squad — aprove ou rejeite antes de publicar
            {isFetching && !isLoading && <span style={{ color: 'var(--violet)' }}> · atualizando…</span>}
          </p>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex p-1 rounded-[13px] flex-wrap w-fit" style={{ background: '#fff', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
        {STATUS_TABS.map((t) => (
          <button
            key={t.label}
            onClick={() => { setStatusTab(t.value); setSelectedId(null) }}
            className="px-3.5 py-2 rounded-[10px] text-[13px] font-extrabold transition"
            style={statusTab === t.value ? { background: GRAD, color: '#fff' } : { color: 'var(--wp-muted)' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-[18px] h-20 animate-pulse" style={{ background: 'var(--line-2)' }} />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 py-16 rounded-[22px]" style={card}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--pink)" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></svg>
          <p className="text-[14px] font-semibold" style={{ color: 'var(--ink-soft)' }}>Não foi possível carregar os posts sociais</p>
          <button onClick={() => refetch()} className="rounded-[12px] px-5 py-2.5 font-extrabold text-[13.5px] text-white" style={{ background: GRAD }}>Tentar novamente</button>
        </div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 rounded-[22px]" style={card}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="3" /><path d="M8 21h8M12 17v4" /></svg>
          <span className="text-[14px] font-semibold" style={{ color: 'var(--wp-muted)' }}>Nenhum post social nessa categoria</span>
          <span className="text-[12.5px] font-medium max-w-72 text-center" style={{ color: 'var(--wp-muted)' }}>
            Os posts aparecem aqui quando o squad weparty-mkt-content envia um carrossel ou story pra revisão.
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-5 items-start">
          {/* Lista */}
          <div className="flex flex-col gap-2.5 order-2 lg:order-1">
            {list.map((post) => {
              const isSelected = selected?.id === post.id
              return (
                <button
                  key={post.id}
                  onClick={() => setSelectedId(post.id)}
                  className="flex items-center gap-3 rounded-[16px] p-3 text-left transition"
                  style={{ ...card, outline: isSelected ? '2px solid var(--violet)' : 'none', outlineOffset: -2 }}
                >
                  <PostThumb post={post} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[12px] font-extrabold" style={{ color: 'var(--violet)' }}>{FORMAT_META[post.format].label}</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-extrabold" style={{ background: STATUS_META[post.status].bg, color: STATUS_META[post.status].color }}>
                        {STATUS_META[post.status].label}
                      </span>
                    </div>
                    <p className="text-[13px] font-semibold truncate mt-0.5">{post.eventTitle || post.caption}</p>
                    <p className="text-[11.5px] font-medium" style={{ color: 'var(--wp-muted)' }}>{relativeTime(post.createdAt, locale)}</p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Detalhe / prévia */}
          <div className="order-1 lg:order-2 lg:sticky lg:top-4">
            {selected && (
              <DetailPanel
                post={selected}
                onApprove={() => handleApprove(selected.id)}
                onReject={(reason) => handleReject(selected.id, reason)}
                approving={approve.isPending && approve.variables === selected.id}
                rejecting={reject.isPending && reject.variables?.id === selected.id}
              />
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-[16px] px-5 py-4 text-[14px] font-semibold text-white shadow-xl pointer-events-none"
          style={{ background: 'linear-gradient(135deg,#1a0b2e,#3a1060)', border: '1px solid rgba(255,77,141,.35)', whiteSpace: 'nowrap' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff4d8d" strokeWidth="2.4"><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></svg>
          {toast}
        </div>
      )}
    </div>
  )
}
