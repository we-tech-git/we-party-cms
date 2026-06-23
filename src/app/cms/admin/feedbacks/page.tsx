'use client'

/**
 * Central de feedbacks (admin) — triagem de sugestões, bugs, reclamações e
 * elogios enviados pelos usuários. Layout master-detail: lista à esquerda,
 * detalhe + resposta à direita.
 *
 * Inspirado no FeedbacksCenter do projeto OPS, adaptado aos tokens da marca.
 * Dados de amostra — troque `INITIAL_FEEDBACKS`/`stats` por um hook de fetch
 * (GET /admin/feedbacks, PATCH /admin/feedbacks/:id) quando houver API.
 */

import { useMemo, useState } from 'react'
import { GRAD } from '@/lib/brand'
import { BackButton } from '@/components/cms/back-button'

/* ------------------------------------------------------------------ types -- */

type FbType = 'suggestion' | 'bug' | 'complaint' | 'praise'
type FbStatus = 'pending' | 'inProgress' | 'resolved'

type Feedback = {
  id: number
  name: string
  email: string
  type: FbType
  status: FbStatus
  message: string
  date: string
  rating?: number
  response?: string
  responseDate?: string
}

/* ---------------------------------------------------------------- helpers -- */

const card = { background: '#fff', border: '1px solid var(--line-2)', boxShadow: 'var(--shadow-sm)' } as const

const AVATAR_GRADS = [
  'linear-gradient(135deg,#7b5cff,#c54bff)',
  'linear-gradient(135deg,#FF9D3D,#F0309A)',
  'linear-gradient(135deg,#3E7BFB,#5b93ff)',
  'linear-gradient(135deg,#10A87D,#34d399)',
  'linear-gradient(135deg,#ec4899,#f472b6)',
]
function initials(name: string) {
  const p = name.trim().split(/\s+/)
  return ((p[0]?.[0] ?? '') + (p[1]?.[0] ?? '')).toUpperCase()
}

const TYPE_META: Record<FbType, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  suggestion: { label: 'Sugestão', color: 'var(--violet)', bg: '#EEEAFF', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z" /></svg> },
  bug: { label: 'Bug', color: '#DC2626', bg: '#FEE2E2', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="8" y="6" width="8" height="14" rx="4" /><path d="M8 10H3M21 10h-5M8 16H3M21 16h-5M12 2v4M9 4l1 2M15 4l-1 2" /></svg> },
  complaint: { label: 'Reclamação', color: 'var(--amber)', bg: '#FFF4E0', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></svg> },
  praise: { label: 'Elogio', color: 'var(--pink)', bg: '#FFE9F2', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.6-10-9C.6 9 2 5 5.5 5 8 5 9.4 6.6 12 9c2.6-2.4 4-4 6.5-4C22 5 23.4 9 22 12c-2.5 4.4-10 9-10 9z" /></svg> },
}
const STATUS_META: Record<FbStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pendente', color: 'var(--amber)', bg: '#FFF4E0' },
  inProgress: { label: 'Em andamento', color: 'var(--blue)', bg: '#E6F1FF' },
  resolved: { label: 'Resolvido', color: 'var(--green)', bg: '#E6FBF3' },
}

/* --------------------------------------------------------------- mock data - */

const INITIAL_FEEDBACKS: Feedback[] = [
  { id: 1, name: 'João Silva', email: 'joao.silva@email.com', type: 'suggestion', status: 'pending', date: '02/02/2026', rating: 4, message: 'Seria muito útil ter a opção de compartilhar eventos diretamente para o WhatsApp com uma prévia personalizada. Muitos dos meus amigos usam mais o WhatsApp do que outras redes sociais para combinar eventos.' },
  { id: 2, name: 'Maria Santos', email: 'maria.santos@email.com', type: 'bug', status: 'inProgress', date: '01/02/2026', message: 'Quando tento fazer o check-in no evento, o aplicativo fecha sozinho. Já tentei reinstalar mas o problema persiste. Estou usando um iPhone 14 com iOS 17.' },
  { id: 3, name: 'Pedro Costa', email: 'pedro.costa@email.com', type: 'praise', status: 'resolved', date: '30/01/2026', rating: 5, message: 'Parabéns pelo aplicativo! A experiência de compra de ingressos é muito fluida e o design é lindo. Recomendo para todos os meus amigos. Continuem assim!', response: 'Muito obrigado pelo feedback positivo, Pedro! Ficamos felizes que você esteja gostando da plataforma.', responseDate: '31/01/2026' },
  { id: 4, name: 'Ana Oliveira', email: 'ana.oliveira@email.com', type: 'complaint', status: 'pending', date: '28/01/2026', rating: 1, message: 'Comprei ingresso para um evento que foi cancelado e até agora não recebi o reembolso. Já se passaram 15 dias e ninguém me dá uma resposta. Isso é muito frustrante!' },
  { id: 5, name: 'Lucas Ferreira', email: 'lucas.ferreira@email.com', type: 'suggestion', status: 'resolved', date: '25/01/2026', rating: 4, message: 'Gostaria de poder filtrar eventos por distância da minha localização. Às vezes aparecem eventos muito longe e fica difícil encontrar os que são perto de casa.', response: 'Ótima sugestão, Lucas! Acabamos de implementar o filtro por distância na última atualização. Confira!', responseDate: '27/01/2026' },
  { id: 6, name: 'Beatriz Souza', email: 'beatriz.souza@email.com', type: 'bug', status: 'pending', date: '24/01/2026', rating: 2, message: 'As notificações push não estão chegando mesmo com tudo ativado nas configurações. Acabei perdendo um evento por causa disso.' },
]

/* ----------------------------------------------------------- subcomponents - */

function Avatar({ name, id, size = 40 }: { name: string; id: number; size?: number }) {
  return (
    <span className="grid place-items-center text-white font-extrabold flex-none rounded-full" style={{ width: size, height: size, background: AVATAR_GRADS[id % AVATAR_GRADS.length], fontFamily: 'var(--font-bricolage)', fontSize: size * 0.4 }}>
      {initials(name)}
    </span>
  )
}

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i <= value ? '#E8920C' : 'none'} stroke="#E8920C" strokeWidth="1.6"><path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7z" /></svg>
      ))}
    </span>
  )
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

function TypeBadge({ type }: { type: FbType }) {
  const m = TYPE_META[type]
  return <span className="inline-flex items-center gap-1 px-2.25 py-1 rounded-[8px] text-[11.5px] font-extrabold" style={{ background: m.bg, color: m.color }}>{m.icon}{m.label}</span>
}
function StatusBadge({ status }: { status: FbStatus }) {
  const m = STATUS_META[status]
  return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-extrabold" style={{ background: m.bg, color: m.color }}><span className="w-1.5 h-1.5 rounded-full" style={{ background: m.color }} />{m.label}</span>
}

/* ------------------------------------------------------------------- page -- */

export default function FeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(INITIAL_FEEDBACKS)
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | FbType>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | FbStatus>('all')
  const [selectedId, setSelectedId] = useState<number | null>(INITIAL_FEEDBACKS[0]?.id ?? null)
  const [responseText, setResponseText] = useState('')

  const stats = useMemo(() => {
    const total = feedbacks.length
    const pending = feedbacks.filter((f) => f.status === 'pending').length
    const resolved = feedbacks.filter((f) => f.status === 'resolved').length
    const rated = feedbacks.filter((f) => f.rating)
    const avg = rated.length ? (rated.reduce((s, f) => s + (f.rating ?? 0), 0) / rated.length).toFixed(1) : '—'
    return { total, pending, resolved, avg }
  }, [feedbacks])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return feedbacks.filter((f) => {
      if (typeFilter !== 'all' && f.type !== typeFilter) return false
      if (statusFilter !== 'all' && f.status !== statusFilter) return false
      if (!q) return true
      return f.name.toLowerCase().includes(q) || f.message.toLowerCase().includes(q)
    })
  }, [feedbacks, query, typeFilter, statusFilter])

  const selected = feedbacks.find((f) => f.id === selectedId) ?? null

  function patch(id: number, data: Partial<Feedback>) {
    setFeedbacks((prev) => prev.map((f) => (f.id === id ? { ...f, ...data } : f)))
  }
  function sendResponse() {
    if (!selected || !responseText.trim()) return
    patch(selected.id, { response: responseText.trim(), responseDate: new Date().toLocaleDateString('pt-BR'), status: 'resolved' })
    setResponseText('')
  }
  function remove(id: number) {
    setFeedbacks((prev) => prev.filter((f) => f.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  return (
    <div className="flex flex-col gap-5">
      <BackButton fallback="/cms/admin/control-panel" />

      {/* Header */}
      <div className="flex items-end gap-4 flex-wrap">
        <span className="w-14 h-14 rounded-[18px] grid place-items-center text-white flex-none" style={{ background: GRAD, boxShadow: '0 14px 28px -14px rgba(240,48,154,.7)' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 15a4 4 0 01-4 4H8l-5 4V7a4 4 0 014-4h10a4 4 0 014 4z" /></svg>
        </span>
        <div className="min-w-0">
          <h1 className="font-extrabold text-[clamp(22px,5vw,30px)] leading-[1.05]" style={{ fontFamily: 'var(--font-bricolage)' }}>
            Central de <span style={{ background: 'linear-gradient(120deg,var(--violet),var(--pink))', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>feedbacks</span>
          </h1>
          <p className="font-semibold mt-0.5 text-[14px]" style={{ color: 'var(--ink-soft)' }}>Acompanhe e responda o que os usuários estão dizendo</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard value={String(stats.total)} label="Total de feedbacks" grad="linear-gradient(135deg,#3E7BFB,#60a5fa)" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 15a4 4 0 01-4 4H8l-5 4V7a4 4 0 014-4h10a4 4 0 014 4z" /></svg>} />
        <StatCard value={String(stats.pending)} label="Pendentes" grad="linear-gradient(135deg,#F59E0B,#fbbf24)" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>} />
        <StatCard value={String(stats.resolved)} label="Resolvidos" grad="linear-gradient(135deg,#10A87D,#34d399)" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5" /></svg>} />
        <StatCard value={String(stats.avg)} label="Avaliação média" grad="linear-gradient(135deg,#ec4899,#f472b6)" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7z" /></svg>} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--wp-muted)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
          </span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por usuário ou conteúdo…" className="w-full rounded-[13px] pl-11 pr-4 py-3 text-[14px] font-medium outline-none transition focus:border-violet" style={{ background: '#fff', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {([['all', 'Todos os tipos'], ['suggestion', 'Sugestões'], ['bug', 'Bugs'], ['complaint', 'Reclamações'], ['praise', 'Elogios']] as const).map(([v, l]) => (
            <button key={v} onClick={() => setTypeFilter(v)} className="px-3.5 py-2 rounded-[11px] text-[13px] font-bold transition" style={typeFilter === v ? { background: GRAD, color: '#fff' } : { background: '#fff', color: 'var(--wp-muted)', border: '1px solid var(--line)' }}>{l}</button>
          ))}
          <span className="w-px self-stretch mx-1" style={{ background: 'var(--line)' }} />
          {([['all', 'Todos'], ['pending', 'Pendentes'], ['inProgress', 'Em andamento'], ['resolved', 'Resolvidos']] as const).map(([v, l]) => (
            <button key={v} onClick={() => setStatusFilter(v)} className="px-3.5 py-2 rounded-[11px] text-[13px] font-bold transition" style={statusFilter === v ? { background: 'var(--ink)', color: '#fff' } : { background: '#fff', color: 'var(--wp-muted)', border: '1px solid var(--line)' }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Master-detail */}
      <div className="grid gap-5 grid-cols-1 min-[1024px]:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] items-start">
        {/* List */}
        <div className="flex flex-col gap-3">
          {filtered.map((f) => {
            const active = f.id === selectedId
            return (
              <button key={f.id} onClick={() => { setSelectedId(f.id); setResponseText('') }} className="text-left rounded-[18px] p-4 transition hover:-translate-y-0.5" style={{ ...card, outline: active ? '2px solid var(--violet)' : 'none', outlineOffset: active ? '0' : undefined }}>
                <div className="flex items-center gap-3 mb-2.5">
                  <Avatar name={f.name} id={f.id} />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-[14px] truncate">{f.name}</p>
                    <p className="text-[12px] font-medium" style={{ color: 'var(--wp-muted)' }}>{f.date}</p>
                  </div>
                  <TypeBadge type={f.type} />
                </div>
                <p className="text-[13px] leading-relaxed line-clamp-2" style={{ color: 'var(--ink-soft)' }}>{f.message}</p>
                <div className="flex items-center justify-between mt-2.5">
                  <StatusBadge status={f.status} />
                  {f.rating && <Stars value={f.rating} />}
                </div>
              </button>
            )
          })}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-14 rounded-[18px]" style={card}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--wp-muted)" strokeWidth="1.8"><path d="M21 15a4 4 0 01-4 4H8l-5 4V7a4 4 0 014-4h10a4 4 0 014 4z" /></svg>
              <span className="text-[14px] font-semibold" style={{ color: 'var(--wp-muted)' }}>Nenhum feedback encontrado</span>
            </div>
          )}
        </div>

        {/* Detail */}
        <div className="min-[1024px]:sticky min-[1024px]:top-24">
          {selected ? (
            <div className="rounded-[22px] p-5 sm:p-6" style={card}>
              <div className="flex items-center gap-3 mb-4">
                <Avatar name={selected.name} id={selected.id} size={52} />
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold text-[16px] truncate" style={{ fontFamily: 'var(--font-bricolage)' }}>{selected.name}</p>
                  <p className="text-[13px] font-medium truncate" style={{ color: 'var(--wp-muted)' }}>{selected.email}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-4">
                <TypeBadge type={selected.type} />
                <span className="text-[12.5px] font-medium" style={{ color: 'var(--wp-muted)' }}>· {selected.date}</span>
                {selected.rating && <span className="ml-auto"><Stars value={selected.rating} /></span>}
              </div>

              {/* Status selector */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="text-[13px] font-bold" style={{ color: 'var(--ink-soft)' }}>Status:</span>
                {(Object.keys(STATUS_META) as FbStatus[]).map((s) => (
                  <button key={s} onClick={() => patch(selected.id, { status: s })} className="px-3 py-1.5 rounded-[10px] text-[12.5px] font-bold transition" style={selected.status === s ? { background: STATUS_META[s].bg, color: STATUS_META[s].color, outline: `1.5px solid ${STATUS_META[s].color}` } : { background: '#FBFAFE', color: 'var(--wp-muted)', border: '1px solid var(--line-2)' }}>
                    {STATUS_META[s].label}
                  </button>
                ))}
              </div>

              <div className="rounded-[14px] p-4 mb-4" style={{ background: '#FBFAFE', border: '1px solid var(--line-2)' }}>
                <h4 className="text-[12px] font-extrabold uppercase tracking-wide mb-1.5" style={{ color: 'var(--wp-muted)' }}>Mensagem</h4>
                <p className="text-[14px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>{selected.message}</p>
              </div>

              {/* Response */}
              <div className="mb-4">
                <h4 className="text-[12px] font-extrabold uppercase tracking-wide mb-2" style={{ color: 'var(--wp-muted)' }}>Resposta</h4>
                {selected.response ? (
                  <div className="rounded-[14px] p-4" style={{ background: 'linear-gradient(135deg,rgba(124,92,255,.07),rgba(216,27,126,.06))', border: '1px solid rgba(124,92,255,.18)' }}>
                    <p className="text-[14px] leading-relaxed">{selected.response}</p>
                    <p className="text-[12px] font-medium mt-2" style={{ color: 'var(--wp-muted)' }}>Respondido em {selected.responseDate}</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    <textarea value={responseText} onChange={(e) => setResponseText(e.target.value)} rows={3} placeholder="Escreva uma resposta ao usuário…" className="w-full rounded-[12px] px-3.5 py-3 text-[14px] font-medium outline-none resize-none transition focus:border-violet" style={{ background: '#fff', border: '1px solid var(--line)' }} />
                    <button onClick={sendResponse} disabled={!responseText.trim()} className="self-end flex items-center gap-2 rounded-[11px] px-5 py-2.5 font-extrabold text-[13.5px] text-white transition hover:-translate-y-0.5 disabled:opacity-40 disabled:translate-y-0" style={{ background: GRAD }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" /></svg>
                      Enviar resposta
                    </button>
                  </div>
                )}
              </div>

              {/* Quick actions */}
              <div className="flex gap-2.5 pt-1">
                <button onClick={() => patch(selected.id, { status: 'resolved' })} className="flex-1 flex items-center justify-center gap-2 rounded-[12px] py-2.75 font-extrabold text-[13.5px] transition hover:brightness-95" style={{ background: '#E6FBF3', color: 'var(--green)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5" /></svg>
                  Resolver
                </button>
                <button onClick={() => remove(selected.id)} className="flex-1 flex items-center justify-center gap-2 rounded-[12px] py-2.75 font-extrabold text-[13.5px] transition hover:brightness-95" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" /></svg>
                  Excluir
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-20 rounded-[22px]" style={card}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--wp-muted)" strokeWidth="1.6"><path d="M21 15a4 4 0 01-4 4H8l-5 4V7a4 4 0 014-4h10a4 4 0 014 4z" /></svg>
              <p className="text-[14px] font-semibold" style={{ color: 'var(--wp-muted)' }}>Selecione um feedback para ver os detalhes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
