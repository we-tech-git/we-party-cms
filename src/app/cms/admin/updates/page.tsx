'use client'

/**
 * Revisão e publicação das novidades de /public/updates (we-party-web-app).
 *
 * Cobre tanto a criação/edição manual quanto os rascunhos que chegam
 * automaticamente via webhook do GitHub (PR mesclado + checkbox de
 * elegibilidade marcado — ver
 * backend/docs-weparty-social-backed/.wp-social-script-tests/weparty-updates/).
 * Rascunhos com copyStatus=PENDING_AI aparecem com o badge "Gerando copy…"
 * até o opencode escrever o texto final; o botão "Gerar copy com IA" reroda
 * isso sob demanda.
 */

import { useMemo, useState } from 'react'
import { GRAD } from '@/lib/brand'
import { BackButton } from '@/components/cms/back-button'
import { useAdminPlatformUpdates, usePlatformUpdateMutations } from '@/hooks/use-admin-platform-updates'
import type {
  AdminPlatformUpdate,
  PlatformUpdateCategory,
  PlatformUpdateLifecycle,
  PlatformUpdateWorkflowStatus,
} from '@/types/platform-updates.types'

const card = { background: '#fff', border: '1px solid var(--line-2)', boxShadow: 'var(--shadow-sm)' } as const

const CATEGORY_META: Record<PlatformUpdateCategory, { label: string, color: string, bg: string }> = {
  FEATURE: { label: 'Novidade', color: 'var(--pink)', bg: '#FFF0F3' },
  IMPROVEMENT: { label: 'Melhoria', color: 'var(--violet)', bg: '#F3EEFF' },
  FIX: { label: 'Correção', color: '#3B82F6', bg: '#EFF6FF' },
}

const STATUS_META: Record<PlatformUpdateWorkflowStatus, { label: string, color: string, bg: string }> = {
  DRAFT: { label: 'Rascunho', color: 'var(--amber)', bg: '#FFF4E0' },
  PUBLISHED: { label: 'Publicada', color: 'var(--green)', bg: '#E6FBF3' },
}

const TAB_ITEMS: { key: 'all' | PlatformUpdateWorkflowStatus, label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'DRAFT', label: 'Rascunhos' },
  { key: 'PUBLISHED', label: 'Publicadas' },
]

/** Converte ISO -> yyyy-MM-dd pro value de <input type="date">. */
function toDateInputValue (iso: string | null): string {
  if (!iso) return ''
  return iso.slice(0, 10)
}

/** Data + hora legível pro painel de metadados (só leitura). */
function formatDateTime (iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

/** Primeiros 7 caracteres do SHA — igual ao short hash que o GitHub mostra. */
function shortSha (sha: string): string {
  return sha.slice(0, 7)
}

interface FormState {
  category: PlatformUpdateCategory
  lifecycle: PlatformUpdateLifecycle
  title: string
  description: string
  tag: string
  badge: string
  version: string
  actionLabel: string
  actionPath: string
  highlights: string
  releasedAt: string
  expectedAt: string
}

function toFormState (u?: AdminPlatformUpdate | null): FormState {
  return {
    category: u?.category ?? 'FEATURE',
    lifecycle: u?.lifecycle ?? 'RELEASED',
    title: u?.title ?? '',
    description: u?.description ?? '',
    tag: u?.tag ?? '',
    badge: u?.badge ?? '',
    version: u?.version ?? '',
    actionLabel: u?.actionLabel ?? '',
    actionPath: u?.actionPath ?? '',
    highlights: u?.highlights?.join('\n') ?? '',
    releasedAt: toDateInputValue(u?.releasedAt ?? null),
    expectedAt: toDateInputValue(u?.expectedAt ?? null),
  }
}

function formToPayload (form: FormState) {
  return {
    category: form.category,
    lifecycle: form.lifecycle,
    title: form.title.trim(),
    description: form.description.trim(),
    tag: form.tag.trim() || undefined,
    badge: form.badge.trim() || undefined,
    version: form.version.trim() || undefined,
    actionLabel: form.actionLabel.trim() || undefined,
    actionPath: form.actionPath.trim() || undefined,
    highlights: form.highlights.split('\n').map(h => h.trim()).filter(Boolean),
    releasedAt: form.releasedAt || undefined,
    expectedAt: form.expectedAt || undefined,
  }
}

function ModalShell ({ onClose, children, width = 560 }: { onClose: () => void, children: React.ReactNode, width?: number }) {
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{ background: 'rgba(17,24,39,.6)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div role="dialog" aria-modal="true" className="relative z-1 rounded-[24px] bg-white p-7 max-h-[85vh] overflow-y-auto" style={{ width: `min(92vw, ${width}px)`, boxShadow: 'var(--shadow)' }}>
        {children}
      </div>
    </div>
  )
}

function fieldLabel (text: string) {
  return <label className="text-[11px] font-extrabold uppercase tracking-wider mb-1 block" style={{ color: 'var(--wp-muted)' }}>{text}</label>
}

const inputClass = 'w-full rounded-[10px] px-3 py-2 text-[13.5px] font-medium outline-none'
const inputStyle = { border: '1px solid var(--line)', background: '#fff' } as const

export default function PlatformUpdatesPage () {
  const [tab, setTab] = useState<'all' | PlatformUpdateWorkflowStatus>('all')
  const [editing, setEditing] = useState<AdminPlatformUpdate | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<FormState>(toFormState())
  const [formError, setFormError] = useState<string | null>(null)

  const statusParam = tab === 'all' ? undefined : tab
  const { data, isLoading, isError, refetch } = useAdminPlatformUpdates(statusParam)
  const { create, update, publish, remove, generateCopy } = usePlatformUpdateMutations()

  const updates = useMemo(() => data ?? [], [data])
  const busy = create.isPending || update.isPending || publish.isPending || remove.isPending || generateCopy.isPending

  function openEdit (u: AdminPlatformUpdate) {
    setFormError(null)
    setEditing(u)
    setForm(toFormState(u))
  }

  function openCreate () {
    setFormError(null)
    setCreating(true)
    setForm(toFormState())
  }

  function closeModal () {
    if (busy) return
    setEditing(null)
    setCreating(false)
    setFormError(null)
  }

  function handleSave () {
    setFormError(null)
    const payload = formToPayload(form)
    if (!payload.title || !payload.description) {
      setFormError('Título e descrição são obrigatórios.')
      return
    }

    if (creating) {
      create.mutate(payload, { onSuccess: closeModal, onError: () => setFormError('Não foi possível criar. Confira os campos.') })
    } else if (editing) {
      update.mutate({ id: editing.id, payload }, { onSuccess: closeModal, onError: () => setFormError('Não foi possível salvar. Confira os campos.') })
    }
  }

  function handlePublish () {
    if (!editing) return
    setFormError(null)
    const version = form.version.trim() || undefined
    publish.mutate(
      { id: editing.id, payload: { version } },
      {
        onSuccess: closeModal,
        onError: (err: unknown) => {
          const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
          setFormError(message ?? 'Não foi possível publicar — confira releasedAt/expectedAt e version.')
        },
      },
    )
  }

  function handleDelete () {
    if (!editing) return
    remove.mutate(editing.id, { onSuccess: closeModal })
  }

  function handleGenerateCopy () {
    if (!editing) return
    setFormError(null)
    generateCopy.mutate(editing.id, {
      onSuccess: updated => {
        setEditing(updated)
        setForm(toFormState(updated))
      },
      onError: () => setFormError('Não foi possível gerar o copy agora — tente de novo em instantes.'),
    })
  }

  const showModal = creating || Boolean(editing)
  const canPublish = editing?.status === 'DRAFT' && editing?.copyStatus === 'READY'
  const canDelete = editing?.status === 'DRAFT'

  return (
    <div className="flex flex-col gap-5">
      <BackButton fallback="/cms/admin/control-panel" />

      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="flex items-end gap-4 flex-wrap">
          <span className="w-14 h-14 rounded-[18px] grid place-items-center text-white flex-none" style={{ background: GRAD, boxShadow: '0 14px 28px -14px rgba(240,48,154,.7)' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 2v20M2 12h20" /></svg>
          </span>
          <div className="min-w-0">
            <h1 className="font-extrabold text-[clamp(22px,5vw,30px)] leading-[1.05]" style={{ fontFamily: 'var(--font-bricolage)' }}>
              Novidades da <span style={{ background: 'linear-gradient(120deg,var(--violet),var(--pink))', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>plataforma</span>
            </h1>
            <p className="font-semibold mt-0.5 text-[14px]" style={{ color: 'var(--ink-soft)' }}>
              Revise e publique o que aparece em /public/updates
            </p>
          </div>
        </div>
        <button onClick={openCreate} className="rounded-[12px] px-5 py-2.5 font-extrabold text-[13.5px] text-white" style={{ background: GRAD }}>
          + Nova novidade
        </button>
      </div>

      {/* Tabs */}
      <div className="flex p-1 rounded-[13px] flex-wrap self-start" style={{ background: '#fff', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
        {TAB_ITEMS.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)} className="px-4 py-2 rounded-[10px] text-[13px] font-extrabold transition" style={tab === key ? { background: GRAD, color: '#fff' } : { color: 'var(--wp-muted)' }}>{label}</button>
        ))}
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
          <p className="text-[14px] font-semibold" style={{ color: 'var(--ink-soft)' }}>Não foi possível carregar as novidades</p>
          <button onClick={() => refetch()} className="rounded-[12px] px-5 py-2.5 font-extrabold text-[13.5px] text-white" style={{ background: GRAD }}>Tentar novamente</button>
        </div>
      ) : updates.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 rounded-[22px]" style={card}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--wp-muted)" strokeWidth="1.6"><path d="M12 2v20M2 12h20" /></svg>
          <span className="text-[14px] font-semibold" style={{ color: 'var(--wp-muted)' }}>Nenhuma novidade encontrada</span>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 min-[1280px]:grid-cols-3">
          {updates.map(u => (
            <div key={u.id} className="rounded-[18px] p-4 flex flex-col gap-2.5 cursor-pointer transition hover:-translate-y-0.5" style={card} onClick={() => openEdit(u)}>
              <div className="flex items-start justify-between gap-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-extrabold flex-none" style={{ background: CATEGORY_META[u.category].bg, color: CATEGORY_META[u.category].color }}>
                  {CATEGORY_META[u.category].label}
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-extrabold flex-none" style={{ background: STATUS_META[u.status].bg, color: STATUS_META[u.status].color }}>
                  {STATUS_META[u.status].label}
                </span>
              </div>
              <p className="font-extrabold text-[14px] line-clamp-2" style={{ fontFamily: 'var(--font-bricolage)' }}>{u.title}</p>
              <p className="text-[12.5px] font-medium line-clamp-2" style={{ color: 'var(--ink-soft)' }}>{u.description}</p>
              <div className="flex items-center gap-2 text-[11px] font-semibold flex-wrap" style={{ color: 'var(--wp-muted)' }}>
                {u.version && <span>{u.version}</span>}
                {u.tag && <span>· {u.tag}</span>}
                <span>· {u.lifecycle === 'RELEASED' ? 'Já entregue' : 'Planejada'}</span>
                {u.copyStatus === 'PENDING_AI' && <span style={{ color: 'var(--amber)' }}>· Gerando copy…</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de edição/criação — mais largo quando editando (sobra espaço pro
          painel de metadados) pra caber tudo sem espremer em desktop. */}
      {showModal && (
        <ModalShell onClose={closeModal} width={editing ? 920 : 640}>
          <button onClick={closeModal} disabled={busy} aria-label="Fechar" className="absolute top-4 right-4 w-8 h-8 rounded-[8px] grid place-items-center transition hover:bg-[#FFF0F3] disabled:opacity-40" style={{ background: 'rgba(107,114,128,.1)', color: '#6b7280' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>

          <div className="mb-4">
            <h2 className="text-[19px] font-extrabold" style={{ fontFamily: 'var(--font-bricolage)' }}>
              {creating ? 'Nova novidade' : 'Editar novidade'}
            </h2>
            {editing?.copyStatus === 'PENDING_AI' && (
              <p className="text-[12.5px] font-semibold mt-1" style={{ color: 'var(--amber)' }}>
                Aguardando o opencode gerar o copy — o texto abaixo é o rascunho cru. Salvar ou gerar de novo já libera a publicação.
              </p>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-6 lg:items-start">
          <div className="flex flex-col gap-3.5 flex-1 min-w-0">
            <div className="grid grid-cols-2 gap-3">
              <div>
                {fieldLabel('Categoria')}
                <select className={inputClass} style={inputStyle} value={form.category} onChange={e => setForm({ ...form, category: e.target.value as PlatformUpdateCategory })}>
                  <option value="FEATURE">Novidade</option>
                  <option value="IMPROVEMENT">Melhoria</option>
                  <option value="FIX">Correção</option>
                </select>
              </div>
              <div>
                {fieldLabel('Ciclo de vida')}
                <select className={inputClass} style={inputStyle} value={form.lifecycle} onChange={e => setForm({ ...form, lifecycle: e.target.value as PlatformUpdateLifecycle })}>
                  <option value="RELEASED">Já entregue</option>
                  <option value="UPCOMING">Planejada</option>
                </select>
              </div>
            </div>

            <div>
              {fieldLabel('Título')}
              <input className={inputClass} style={inputStyle} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} maxLength={200} />
            </div>

            <div>
              {fieldLabel('Descrição')}
              <textarea className={inputClass} style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} maxLength={2000} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                {fieldLabel('Tag')}
                <input className={inputClass} style={inputStyle} value={form.tag} onChange={e => setForm({ ...form, tag: e.target.value })} placeholder="Social & Feed" />
              </div>
              <div>
                {fieldLabel('Badge')}
                <input className={inputClass} style={inputStyle} value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })} placeholder="DESTAQUE" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                {fieldLabel('Versão')}
                <input className={inputClass} style={inputStyle} value={form.version} onChange={e => setForm({ ...form, version: e.target.value })} placeholder="1.4.0" />
              </div>
              <div>
                {fieldLabel(form.lifecycle === 'RELEASED' ? 'Data de lançamento' : 'Data prevista')}
                <input
                  type="date"
                  className={inputClass}
                  style={inputStyle}
                  value={form.lifecycle === 'RELEASED' ? form.releasedAt : form.expectedAt}
                  onChange={e => setForm(form.lifecycle === 'RELEASED'
                    ? { ...form, releasedAt: e.target.value }
                    : { ...form, expectedAt: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                {fieldLabel('Texto do botão (opcional)')}
                <input className={inputClass} style={inputStyle} value={form.actionLabel} onChange={e => setForm({ ...form, actionLabel: e.target.value })} placeholder="Ver no feed" />
              </div>
              <div>
                {fieldLabel('Rota do botão (opcional)')}
                <input className={inputClass} style={inputStyle} value={form.actionPath} onChange={e => setForm({ ...form, actionPath: e.target.value })} placeholder="/public/explore" />
              </div>
            </div>

            <div>
              {fieldLabel('Destaques (um por linha)')}
              <textarea className={inputClass} style={{ ...inputStyle, resize: 'vertical', minHeight: 64 }} value={form.highlights} onChange={e => setForm({ ...form, highlights: e.target.value })} />
            </div>

            {formError && (
              <p className="text-[12.5px] font-semibold rounded-[10px] px-3 py-2" style={{ background: '#FEE2E2', color: '#DC2626' }}>{formError}</p>
            )}

            <div className="flex gap-2.5 mt-1 flex-wrap">
              <button
                onClick={handleSave}
                disabled={busy}
                className="flex-1 rounded-[12px] py-3 font-extrabold text-[14px] text-white transition hover:-translate-y-0.5 disabled:opacity-50"
                style={{ background: GRAD }}
              >
                {busy ? 'Salvando…' : 'Salvar'}
              </button>
              {!creating && editing?.status === 'DRAFT' && (
                <button
                  onClick={handleGenerateCopy}
                  disabled={busy}
                  className="flex-1 rounded-[12px] py-3 font-extrabold text-[14px] transition hover:-translate-y-0.5 disabled:opacity-50"
                  style={{ background: '#F3EEFF', color: 'var(--violet)' }}
                >
                  {generateCopy.isPending ? 'Gerando…' : 'Gerar copy com IA'}
                </button>
              )}
              {!creating && canPublish && (
                <button
                  onClick={handlePublish}
                  disabled={busy}
                  className="flex-1 rounded-[12px] py-3 font-extrabold text-[14px] text-white transition hover:-translate-y-0.5 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#10A87D,#34d399)' }}
                >
                  Publicar
                </button>
              )}
              {!creating && canDelete && (
                <button
                  onClick={handleDelete}
                  disabled={busy}
                  className="rounded-[12px] px-4 py-3 font-extrabold text-[14px] transition disabled:opacity-50"
                  style={{ background: '#FEE2E2', color: '#DC2626' }}
                >
                  Descartar
                </button>
              )}
            </div>
          </div>

          {/* Painel de metadados — só leitura, só quando editando (nada a mostrar
              numa novidade que ainda não existe). Fica ao lado em desktop
              (lg:flex-row no pai) e embaixo do form em telas menores. */}
          {editing && (
            <div className="w-full lg:w-64 flex-none rounded-[16px] p-4 flex flex-col gap-3.5" style={{ background: '#FAFAFB', border: '1px solid var(--line-2)' }}>
              <p className="text-[11px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--wp-muted)' }}>Detalhes</p>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-extrabold" style={{ background: STATUS_META[editing.status].bg, color: STATUS_META[editing.status].color }}>
                  {STATUS_META[editing.status].label}
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-extrabold" style={editing.copyStatus === 'READY' ? { background: '#E6FBF3', color: 'var(--green)' } : { background: '#FFF4E0', color: 'var(--amber)' }}>
                  {editing.copyStatus === 'READY' ? 'Copy pronto' : 'Gerando copy…'}
                </span>
              </div>

              <div>
                {fieldLabel('Origem')}
                {editing.origin === 'MANUAL' ? (
                  <p className="text-[13px] font-semibold">Criada manualmente no CMS</p>
                ) : (
                  <div className="text-[13px] font-semibold flex flex-col gap-1">
                    <span>{editing.sourceRepo}</span>
                    {editing.sourcePrUrl && (
                      <a href={editing.sourcePrUrl} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--violet)' }}>
                        PR #{editing.sourcePrNumber}
                      </a>
                    )}
                    {editing.sourceCommitShas.length > 0 && (
                      <div className="flex flex-col gap-0.5 mt-1">
                        {editing.sourceCommitShas.map(sha => (
                          <span key={sha} className="font-mono text-[11.5px]" style={{ color: 'var(--wp-muted)' }}>{shortSha(sha)}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                {fieldLabel('Criada em')}
                <p className="text-[13px] font-semibold">{formatDateTime(editing.createdAt)}</p>
              </div>
              <div>
                {fieldLabel('Atualizada em')}
                <p className="text-[13px] font-semibold">{formatDateTime(editing.updatedAt)}</p>
              </div>
              <div>
                {fieldLabel('Publicada em')}
                <p className="text-[13px] font-semibold">{formatDateTime(editing.publishedAt)}</p>
              </div>
            </div>
          )}
          </div>
        </ModalShell>
      )}
    </div>
  )
}
