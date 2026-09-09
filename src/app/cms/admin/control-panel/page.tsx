'use client'

/**
 * Painel de Controle (dev/admin) — visão geral e controle das ações do site.
 *
 * Métricas e atividade vêm de GET /admin/stats e GET /admin/activities.
 * Denúncias/moderação e configurações do site ainda não têm API: aqueles blocos
 * seguem em estado indisponível de propósito, sem dados simulados.
 */

import Link from 'next/link'
import { useState } from 'react'
import { GRAD } from '@/lib/brand'
import { useAdminStats, usePlatformActivities } from '@/hooks/use-admin-overview'
import { PlatformActivityFeed } from '@/components/dashboard/platform-activity-feed'

/* ------------------------------------------------------------------ utils -- */

const card = {
  background: '#fff',
  border: '1px solid var(--line-2)',
  boxShadow: 'var(--shadow-sm)',
} as const

const panel = {
  background: 'linear-gradient(135deg,#FBFAFF 0%,#fff 100%)',
  border: '1px solid rgba(124,92,255,.14)',
  boxShadow: 'var(--shadow-sm)',
} as const

/* ------------------------------------------------------- shared subcomp --- */

function SectionTitle({ icon, children, badge }: { icon: React.ReactNode; children: React.ReactNode; badge?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="flex items-center gap-2 text-[16px] font-extrabold" style={{ fontFamily: 'var(--font-bricolage)' }}>
        <span style={{ color: 'var(--violet)' }}>{icon}</span>
        {children}
      </h2>
      {badge}
    </div>
  )
}

/**
 * `value` undefined = ainda carregando; null = métrica indisponível no backend
 * (mostra "—" em vez de zero, que seria uma informação falsa).
 */
function StatCard({
  label,
  grad,
  icon,
  value,
  isLoading,
  hint,
}: {
  label: string
  grad: string
  icon?: React.ReactNode
  value?: number | null
  isLoading?: boolean
  hint?: string
}) {
  const display = isLoading ? '…' : value == null ? '—' : value.toLocaleString('pt-BR')
  return (
    <div className="relative overflow-hidden rounded-[18px] px-6 py-5.5 text-white flex items-center justify-between" style={{ background: grad, boxShadow: 'var(--shadow-sm)' }} title={hint}>
      <div className="min-w-0">
        <div className="text-[26px] font-extrabold leading-none tabular-nums" style={{ fontFamily: 'var(--font-bricolage)' }}>{display}</div>
        <div className="text-[13px] font-semibold opacity-90 mt-1.5 truncate">{label}</div>
        {hint && <div className="text-[11px] font-semibold opacity-75 mt-0.5 truncate">{hint}</div>}
      </div>
      {icon && <span className="opacity-50 flex-none">{icon}</span>}
    </div>
  )
}

function EmptyState({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-7 text-center" style={{ color: 'var(--wp-muted)' }}>
      <span style={{ color: 'var(--line)' }}>{icon}</span>
      <span className="text-[13px] font-bold" style={{ color: 'var(--ink-soft)' }}>{title}</span>
      <span className="text-[12px] font-medium">{subtitle}</span>
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className="relative w-11 h-6.5 rounded-full flex-none transition-colors"
      style={{ background: checked ? GRAD : 'var(--line)' }}
    >
      <span
        className="absolute top-0.75 left-0.75 w-5 h-5 rounded-full bg-white transition-transform"
        style={{ transform: checked ? 'translateX(18px)' : 'translateX(0)', boxShadow: '0 1px 3px rgba(0,0,0,.25)' }}
      />
    </button>
  )
}

/* ----------------------------------------------------------- demo content - */

// No admin settings endpoint exists yet — toggles below are local UI state
// only and don't persist. Wire them to a real PATCH /admin/settings once it
// exists, keeping this shape.
const QUICK_SETTINGS = [
  { key: 'signups', label: 'Permitir cadastros', description: 'Novos usuários podem se registrar', defaultChecked: true },
  { key: 'maintenance', label: 'Modo manutenção', description: 'Site fica offline para usuários', defaultChecked: false },
  { key: 'autoApprove', label: 'Aprovar eventos automaticamente', description: 'Publicação sem revisão manual', defaultChecked: false },
  { key: 'thirdPartySync', label: 'Sincronizar eventos de terceiros', description: 'weparty-engine ingestão ativa', defaultChecked: true },
  { key: 'emailNotifications', label: 'Notificações por e-mail', description: 'Receber alertas administrativos', defaultChecked: true },
] as const

const QUICK_LINKS = [
  { href: '/cms/admin/users', label: 'Gerenciar usuários', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="9" cy="8" r="3.5" /><path d="M3 21v-1a6 6 0 0112 0v1M16 4.5a3.5 3.5 0 010 7M21 21v-1a6 6 0 00-4-5.7" /></svg> },
  { href: '/cms/admin/feedbacks', label: 'Ver feedbacks', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 15a4 4 0 01-4 4H8l-5 4V7a4 4 0 014-4h10a4 4 0 014 4z" /></svg> },
  { href: '/cms/admin/interests', label: 'Gerenciar interesses', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.6-10-9C.6 9 2 5 5.5 5 8 5 9.4 6.6 12 9c2.6-2.4 4-4 6.5-4C22 5 23.4 9 22 12c-2.5 4.4-10 9-10 9z" /></svg> },
  { href: '/cms/admin/events', label: 'Gerenciar eventos', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="4" width="18" height="18" rx="3" /><path d="M3 9h18M8 2v4M16 2v4" /></svg> },
  { href: '/cms/admin/updates', label: 'Revisar novidades', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 2v20M2 12h20" /></svg> },
]

/* ------------------------------------------------------------------- page -- */

export default function ControlPanelPage() {
  const [settings, setSettings] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(QUICK_SETTINGS.map((s) => [s.key, s.defaultChecked])),
  )

  const { data: stats, isLoading: statsLoading } = useAdminStats()
  const { data: activities, isLoading: activitiesLoading, isError: activitiesError, refetch: refetchActivities } = usePlatformActivities(30)

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className="w-14 h-14 rounded-[18px] grid place-items-center text-white flex-none" style={{ background: GRAD, boxShadow: '0 14px 28px -14px rgba(240,48,154,.7)' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 12h4l2 6 4-14 2 8h6" /></svg>
        </span>
        <div className="min-w-0">
          <h1 className="font-extrabold text-[clamp(20px,4vw,30px)] leading-[1.05] whitespace-nowrap" style={{ fontFamily: 'var(--font-bricolage)' }}>
            Painel de <span style={{ background: 'linear-gradient(120deg,var(--violet),var(--pink))', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>Controle</span>
          </h1>
          <p className="font-semibold mt-0.5 text-[14px] whitespace-nowrap" style={{ color: 'var(--ink-soft)' }}>
            Visão geral e controle das ações do site
          </p>
        </div>
      </div>

      {/* Métricas da plataforma — GET /admin/stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Usuários cadastrados"
          grad="linear-gradient(135deg,#7C5CFF,#a78bfa)"
          value={stats?.totalUsers}
          isLoading={statsLoading}
          hint={stats && stats.blockedUsers > 0 ? `${stats.blockedUsers} bloqueado(s)` : undefined}
          icon={<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="9" cy="8" r="3.5" /><path d="M3 21v-1a6 6 0 0112 0v1M16 4.5a3.5 3.5 0 010 7M21 21v-1a6 6 0 00-4-5.7" /></svg>}
        />
        <StatCard
          label="Total de eventos"
          grad="linear-gradient(135deg,#10A87D,#34d399)"
          value={stats?.totalEvents}
          isLoading={statsLoading}
          hint={stats ? `${stats.publishedEvents.toLocaleString('pt-BR')} publicado(s)` : undefined}
          icon={<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="4" width="18" height="18" rx="3" /><path d="M3 9h18M8 2v4M16 2v4" /></svg>}
        />
        <StatCard
          label="Ações pendentes"
          grad="linear-gradient(135deg,#F59E0B,#fbbf24)"
          value={stats?.pendingActions}
          isLoading={statsLoading}
          hint="interesses na fila"
          icon={<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="9" /><path d="M12 8v4l3 2" /></svg>}
        />
        <StatCard
          label="Pendências"
          grad="linear-gradient(135deg,#3E7BFB,#60a5fa)"
          value={stats?.openReports}
          isLoading={statsLoading}
          hint="denúncias — módulo não implementado"
          icon={<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><path d="M4 22V15" /></svg>}
        />
      </div>

      {/* Main grid — two rows of three cards, all the same size/dimension */}
      <div className="grid gap-5 grid-cols-1 md:grid-cols-3 items-stretch">
        {/* Pending actions */}
        <div className="rounded-[22px] p-5 sm:p-6 flex flex-col min-h-70" style={panel}>
          <SectionTitle
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="9" /><path d="M12 8v4l3 2" /></svg>}
          >
            Ações pendentes
          </SectionTitle>
          <div className="flex-1 flex flex-col justify-center">
            {statsLoading ? (
              <div className="h-24 rounded-[14px] animate-pulse" style={{ background: 'var(--line-2)' }} />
            ) : stats && stats.pendingActions > 0 ? (
              <Link
                href="/cms/admin/interests"
                className="flex items-center gap-3.5 rounded-[14px] px-4 py-4 transition hover:-translate-y-0.5"
                style={{ background: '#fff', border: '1px solid var(--line-2)' }}
              >
                <span className="w-11 h-11 rounded-[13px] grid place-items-center flex-none text-white" style={{ background: 'linear-gradient(135deg,#F59E0B,#fbbf24)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.6-10-9C.6 9 2 5 5.5 5 8 5 9.4 6.6 12 9c2.6-2.4 4-4 6.5-4C22 5 23.4 9 22 12c-2.5 4.4-10 9-10 9z" /></svg>
                </span>
                <div className="min-w-0">
                  <p className="font-extrabold text-[15px] leading-tight">
                    {stats.pendingActions} interesse(s) aguardando aprovação
                  </p>
                  <p className="text-[12.5px] font-semibold mt-0.5" style={{ color: 'var(--violet)' }}>
                    Revisar agora →
                  </p>
                </div>
              </Link>
            ) : (
              <EmptyState
                icon={<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>}
                title="Nada pendente"
                subtitle="Nenhuma ação aguardando sua decisão."
              />
            )}
          </div>
        </div>

        {/* Atividade recente — auditoria de toda a plataforma */}
        <div className="rounded-[22px] p-5 sm:p-6 flex flex-col min-h-70" style={panel}>
          <SectionTitle
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 8v4l3 2" /><circle cx="12" cy="12" r="9" /></svg>}
            badge={
              activities?.total ? (
                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-[8px]" style={{ background: '#EEEAFF', color: 'var(--violet)' }}>
                  {activities.total.toLocaleString('pt-BR')} no total
                </span>
              ) : undefined
            }
          >
            Atividade recente
          </SectionTitle>
          <div className="flex-1 flex flex-col justify-center">
            <PlatformActivityFeed
              activities={activities?.items}
              isLoading={activitiesLoading}
              isError={activitiesError}
              onRetry={() => refetchActivities()}
            />
          </div>
        </div>

        {/* Quick links */}
        <div className="rounded-[22px] p-5 sm:p-6 flex flex-col min-h-70" style={card}>
          <SectionTitle icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M10 13a5 5 0 007 0l3-3a5 5 0 00-7-7l-1.5 1.5M14 11a5 5 0 00-7 0l-3 3a5 5 0 007 7l1.5-1.5" /></svg>}>
            Acesso rápido
          </SectionTitle>
          <div className="flex-1 grid grid-cols-2 gap-2.5">
            {QUICK_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="flex flex-col gap-2 rounded-[14px] p-3.5 transition hover:-translate-y-0.5" style={{ background: '#FBFAFE', border: '1px solid var(--line-2)' }}>
                <span style={{ color: 'var(--violet)' }}>{l.icon}</span>
                <span className="text-[13px] font-bold leading-tight">{l.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick settings — local UI state only, no admin settings endpoint yet */}
        <div className="rounded-[22px] p-5 sm:p-6 flex flex-col min-h-70" style={card}>
          <SectionTitle
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>}
          >
            Configurações rápidas
          </SectionTitle>
          <div className="flex flex-col">
            {QUICK_SETTINGS.map((s, i) => (
              <div
                key={s.key}
                className="flex items-center gap-3 py-3"
                style={i < QUICK_SETTINGS.length - 1 ? { borderBottom: '1px solid var(--line-2)' } : undefined}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-[13.5px] truncate">{s.label}</p>
                  <p className="text-[12px] font-medium truncate" style={{ color: 'var(--wp-muted)' }}>{s.description}</p>
                </div>
                <Toggle checked={settings[s.key]} onChange={() => setSettings((prev) => ({ ...prev, [s.key]: !prev[s.key] }))} />
              </div>
            ))}
          </div>
        </div>

        {/* Reports — no moderation/reports endpoint yet */}
        <div className="rounded-[22px] p-5 sm:p-6 flex flex-col min-h-70" style={card}>
          <SectionTitle
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><path d="M4 22V15" /></svg>}
          >
            Denúncias
          </SectionTitle>
          <div className="flex-1 flex flex-col justify-center">
            <EmptyState
              icon={<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></svg>}
              title="Indisponível"
              subtitle="Ainda não há uma API de denúncias/moderação."
            />
          </div>
        </div>
      </div>
    </div>
  )
}
