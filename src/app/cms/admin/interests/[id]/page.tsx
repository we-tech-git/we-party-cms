'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { GRAD } from '@/lib/brand'
import { BackButton } from '@/components/cms/back-button'
import { useInterestDetail } from '@/hooks/use-admin-interests'
import type { InterestDetailUserDto, InterestDetailEventDto, InterestStatus } from '@/types/events.types'

const PER_PAGE = 10

const detailCard = { background: '#fff', border: '1px solid var(--line-2)', boxShadow: 'var(--shadow-sm)' } as const

const DETAIL_STATUS_META: Record<InterestStatus, { label: string; color: string; bg: string }> = {
  APPROVED: { label: 'Aprovado', color: 'var(--green)', bg: '#E6FBF3' },
  PENDING: { label: 'Pendente', color: 'var(--amber)', bg: '#FFF4E0' },
  REJECTED: { label: 'Rejeitado', color: '#DC2626', bg: '#FEE2E2' },
}

function normalizeDetailStatus(raw?: string | null): InterestStatus {
  const k = raw?.toUpperCase()
  return k === 'APPROVED' || k === 'REJECTED' ? k : 'PENDING'
}

function DetailStatCard({ value, label, grad, icon }: { value: string; label: string; grad: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 rounded-[18px] px-5 py-4.5" style={detailCard}>
      <span className="w-12 h-12 rounded-[14px] grid place-items-center text-white flex-none" style={{ background: grad }}>{icon}</span>
      <div className="min-w-0">
        <div className="text-[24px] font-extrabold leading-none tabular-nums" style={{ fontFamily: 'var(--font-bricolage)' }}>{value}</div>
        <div className="text-[13px] font-semibold mt-1 truncate" style={{ color: 'var(--wp-muted)' }}>{label}</div>
      </div>
    </div>
  )
}

function InterestUserRow({ user }: { user: InterestDetailUserDto }) {
  return (
    <div className="flex items-center gap-3 rounded-[14px] px-4 py-3" style={{ background: '#F9FAFB' }}>
      <span className="w-9 h-9 rounded-[10px] grid place-items-center text-white text-[13px] font-extrabold flex-none" style={{ background: 'linear-gradient(135deg,#7b5cff,#c54bff)', fontFamily: 'var(--font-bricolage)' }}>
        {user.name.charAt(0).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-extrabold truncate" style={{ fontFamily: 'var(--font-bricolage)' }}>{user.name}</p>
        <p className="text-[12px] font-medium" style={{ color: 'var(--wp-muted)' }}>@{user.username}</p>
      </div>
    </div>
  )
}

function InterestEventRow({ event }: { event: InterestDetailEventDto }) {
  return (
    <div className="flex items-center gap-3 rounded-[14px] px-4 py-3" style={{ background: '#F9FAFB' }}>
      <span className="w-9 h-9 rounded-[10px] grid place-items-center text-white text-[13px] font-extrabold flex-none" style={{ background: 'linear-gradient(135deg,#10A87D,#34d399)', fontFamily: 'var(--font-bricolage)' }}>
        {event.title.charAt(0).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-extrabold truncate" style={{ fontFamily: 'var(--font-bricolage)' }}>{event.title}</p>
        <div className="flex items-center gap-2 text-[12px] font-medium" style={{ color: 'var(--wp-muted)' }}>
          {event.city && <span>{event.city}{event.state ? `/${event.state}` : ''}</span>}
          <span>{new Date(event.startDate).toLocaleDateString('pt-BR')}</span>
          <span className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
            {event.viewCount}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function InterestDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params?.id
  const { data, isLoading, isError } = useInterestDetail(id)
  const [showUsers, setShowUsers] = useState(PER_PAGE)
  const [showEvents, setShowEvents] = useState(PER_PAGE)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5">
        <BackButton fallback="/cms/admin/interests" />
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 rounded-full border-[3px] border-transparent animate-spin" style={{ borderTopColor: 'var(--violet)' }} />
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col gap-5">
        <BackButton fallback="/cms/admin/interests" />
        <div className="flex flex-col items-center gap-3 py-16 rounded-[22px]" style={detailCard}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--pink)" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></svg>
          <p className="text-[14px] font-semibold" style={{ color: 'var(--ink-soft)' }}>Não foi possível carregar os detalhes do interesse</p>
          <button onClick={() => router.push('/cms/admin/interests')} className="rounded-[12px] px-5 py-2.5 font-extrabold text-[13.5px] text-white" style={{ background: GRAD }}>Voltar para interesses</button>
        </div>
      </div>
    )
  }

  const { interest, totalUsers, users, totalEvents, events } = data
  const status = normalizeDetailStatus(interest.status)
  const statusMeta = DETAIL_STATUS_META[status]

  return (
    <div className="flex flex-col gap-5">
      <BackButton fallback="/cms/admin/interests" />

      <div className="flex items-end gap-4 flex-wrap">
        <span className="w-14 h-14 rounded-[18px] grid place-items-center text-white flex-none" style={{ background: GRAD, boxShadow: '0 14px 28px -14px rgba(240,48,154,.7)' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.6-10-9C.6 9 2 5 5.5 5 8 5 9.4 6.6 12 9c2.6-2.4 4-4 6.5-4C22 5 23.4 9 22 12c-2.5 4.4-10 9-10 9z" /></svg>
        </span>
        <div className="min-w-0">
          <h1 className="font-extrabold text-[clamp(22px,5vw,30px)] leading-[1.05]" style={{ fontFamily: 'var(--font-bricolage)' }}>
            {interest.name}
          </h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold" style={{ background: statusMeta.bg, color: statusMeta.color }}>{statusMeta.label}</span>
            <span className="text-[13px] font-semibold" style={{ color: 'var(--ink-soft)' }}>
              Criado em {new Date(interest.createdAt).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>
      </div>

      {interest.description && (
        <p className="text-[14px] font-medium" style={{ color: 'var(--ink-soft)' }}>{interest.description}</p>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <DetailStatCard value={String(totalEvents)} label="Eventos" grad="linear-gradient(135deg,#10A87D,#34d399)" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>} />
        <DetailStatCard value={String(interest.eventViewCount)} label="Visualizações" grad="linear-gradient(135deg,#3E7BFB,#5b93ff)" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>} />
        <DetailStatCard value={String(totalUsers)} label="Usuários" grad="linear-gradient(135deg,#7C5CFF,#a78bfa)" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>} />
        <DetailStatCard value={String(interest.eventCount)} label="Vínculos evento" grad="linear-gradient(135deg,#F59E0B,#fbbf24)" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg>} />
      </div>

      <div className="rounded-[18px] p-5" style={detailCard}>
        <h2 className="text-[18px] font-extrabold mb-4" style={{ fontFamily: 'var(--font-bricolage)' }}>
          Usuários ({totalUsers})
        </h2>
        {users.length === 0 ? (
          <p className="text-[13px] font-medium" style={{ color: 'var(--wp-muted)' }}>Nenhum usuário possui este interesse.</p>
        ) : (
          <>
            <div className="grid gap-2">
              {users.slice(0, showUsers).map((u) => <InterestUserRow key={u.id} user={u} />)}
            </div>
            {showUsers < totalUsers && (
              <button onClick={() => setShowUsers((p) => p + PER_PAGE)} className="mt-3 w-full rounded-[12px] py-2.5 text-[13px] font-extrabold transition hover:brightness-95" style={{ background: 'var(--line)', color: 'var(--ink-soft)' }}>
                Carregar mais usuários ({Math.min(totalUsers - showUsers, PER_PAGE)} restantes)
              </button>
            )}
          </>
        )}
      </div>

      <div className="rounded-[18px] p-5" style={detailCard}>
        <h2 className="text-[18px] font-extrabold mb-4" style={{ fontFamily: 'var(--font-bricolage)' }}>
          Eventos ({totalEvents})
        </h2>
        {events.length === 0 ? (
          <p className="text-[13px] font-medium" style={{ color: 'var(--wp-muted)' }}>Nenhum evento associado a este interesse.</p>
        ) : (
          <>
            <div className="grid gap-2">
              {events.slice(0, showEvents).map((e) => <InterestEventRow key={e.id} event={e} />)}
            </div>
            {showEvents < totalEvents && (
              <button onClick={() => setShowEvents((p) => p + PER_PAGE)} className="mt-3 w-full rounded-[12px] py-2.5 text-[13px] font-extrabold transition hover:brightness-95" style={{ background: 'var(--line)', color: 'var(--ink-soft)' }}>
                Carregar mais eventos ({Math.min(totalEvents - showEvents, PER_PAGE)} restantes)
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}