'use client'

/**
 * Painel de Controle (dev/admin) — visão geral e controle das ações do site.
 *
 * Combina duas camadas:
 *  - Operacional (inspirado no painel do projeto OPS): stats de negócio, ações
 *    pendentes, atividade recente, configurações rápidas, acesso rápido e
 *    denúncias/moderação.
 *  - Observabilidade: telemetria ao vivo (throughput, latência, serviços,
 *    recursos, stream de logs).
 *
 * Os números são simulados — quando houver uma API de métricas/admin, troque o
 * `useLiveMetrics` e os arrays de demonstração por hooks de fetch reais
 * mantendo o mesmo shape.
 */

import Link from 'next/link'
import { useMemo, useEffect, useRef, useState } from 'react'
import { GRAD } from '@/lib/brand'
import { BackButton } from '@/components/cms/back-button'

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

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}
function jitter(base: number, spread: number) {
  return base + (Math.random() - 0.5) * spread
}
function fmtInt(n: number) {
  return Math.round(n).toLocaleString('pt-BR')
}
function timeNow() {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

/* ----------------------------------------------------------------- types --- */

type Severity = 'info' | 'success' | 'warn' | 'error'
type ServiceStatus = 'operational' | 'degraded' | 'down'

type LogEntry = {
  id: number
  time: string
  severity: Severity
  service: string
  method: string
  message: string
  ms: number
}
type Service = { name: string; desc: string; status: ServiceStatus; latency: number; icon: React.ReactNode }

type PendingAction = { id: number; type: 'event' | 'user' | 'interest' | 'feedback'; title: string; description: string }
type Activity = { id: number; type: 'create' | 'update' | 'delete' | 'login' | 'purchase'; user: string; action: string; time: string }
type Report = { id: number; type: string; severity: 'low' | 'medium' | 'high'; content: string; date: string; target: string }

/* --------------------------------------------------------- live data hook -- */

const SERVICE_DEFS = [
  { name: 'API Gateway', desc: 'REST · /api/v1', base: 86 },
  { name: 'Banco de Dados', desc: 'PostgreSQL · pool 20', base: 12 },
  { name: 'Autenticação', desc: 'JWT · sessões ativas', base: 41 },
  { name: 'Armazenamento', desc: 'S3 · uploads & CDN', base: 64 },
  { name: 'Fila de Jobs', desc: 'Redis · workers x4', base: 8 },
  { name: 'Pagamentos', desc: 'Gateway externo', base: 220 },
] as const

const SERVICE_ICONS: React.ReactNode[] = [
  <svg key="a" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M4 6h16M4 12h16M4 18h16" /></svg>,
  <svg key="b" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" /></svg>,
  <svg key="c" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 018 0v3" /></svg>,
  <svg key="d" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 15a4 4 0 004 4h11a3 3 0 000-6 5 5 0 00-9.6-1.6A3.5 3.5 0 003 15z" /></svg>,
  <svg key="e" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M4 7h16M4 12h16M4 17h10" /></svg>,
  <svg key="f" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>,
]

const LOG_SAMPLES: { severity: Severity; service: string; method: string; message: string }[] = [
  { severity: 'success', service: 'api', method: 'POST', message: '/events — evento criado' },
  { severity: 'info', service: 'api', method: 'GET', message: '/events/:id/dashboard' },
  { severity: 'success', service: 'auth', method: 'POST', message: '/auth/login — sessão iniciada' },
  { severity: 'info', service: 'storage', method: 'PUT', message: '/uploads/photos (multipart)' },
  { severity: 'warn', service: 'api', method: 'GET', message: '/events — resposta lenta (p95)' },
  { severity: 'success', service: 'jobs', method: 'JOB', message: 'send-notifications concluído' },
  { severity: 'error', service: 'payments', method: 'POST', message: '/charge — timeout do gateway' },
  { severity: 'info', service: 'db', method: 'SQL', message: 'SELECT events JOIN interests' },
  { severity: 'success', service: 'api', method: 'PATCH', message: '/events/:id — publicado' },
  { severity: 'warn', service: 'auth', method: 'POST', message: 'rate-limit aproximando do teto' },
]

function useLiveMetrics(running: boolean) {
  const [kpis, setKpis] = useState({ rpm: 1840, latency: 128, errorRate: 0.42, uptime: 99.98 })
  const [throughput, setThroughput] = useState<number[]>(() =>
    Array.from({ length: 40 }, (_, i) => 60 + Math.sin(i / 3) * 22 + Math.random() * 14),
  )
  const [resources, setResources] = useState({ cpu: 38, mem: 61, db: 9, net: 44 })
  const [services, setServices] = useState<Service[]>(() =>
    SERVICE_DEFS.map((s, i) => ({ name: s.name, desc: s.desc, status: 'operational' as ServiceStatus, latency: s.base, icon: SERVICE_ICONS[i] })),
  )
  const [logs, setLogs] = useState<LogEntry[]>([])
  const logId = useRef(0)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setKpis((k) => ({
        rpm: clamp(jitter(k.rpm, 240), 900, 3200),
        latency: clamp(jitter(k.latency, 26), 70, 280),
        errorRate: clamp(jitter(k.errorRate, 0.28), 0.02, 3.5),
        uptime: clamp(jitter(k.uptime, 0.005), 99.7, 100),
      }))
      setThroughput((prev) => [...prev.slice(1), clamp(jitter(prev[prev.length - 1], 30), 20, 130)])
      setResources((r) => ({
        cpu: clamp(jitter(r.cpu, 12), 8, 92),
        mem: clamp(jitter(r.mem, 6), 30, 88),
        db: clamp(jitter(r.db, 4), 1, 20),
        net: clamp(jitter(r.net, 14), 10, 95),
      }))
      setServices((prev) =>
        prev.map((s, i) => {
          const latency = clamp(jitter(s.latency, SERVICE_DEFS[i].base * 0.4), 4, 600)
          const roll = Math.random()
          const status: ServiceStatus =
            latency > SERVICE_DEFS[i].base * 2.4 ? 'down' : latency > SERVICE_DEFS[i].base * 1.7 || roll < 0.04 ? 'degraded' : 'operational'
          return { ...s, latency, status }
        }),
      )
      const count = 1 + Math.floor(Math.random() * 2)
      setLogs((prev) => {
        const fresh: LogEntry[] = Array.from({ length: count }, () => {
          const s = LOG_SAMPLES[Math.floor(Math.random() * LOG_SAMPLES.length)]
          return { id: logId.current++, time: timeNow(), severity: s.severity, service: s.service, method: s.method, message: s.message, ms: Math.round(jitter(90, 160) + (s.severity === 'error' ? 400 : 0)) }
        })
        return [...fresh, ...prev].slice(0, 28)
      })
    }, 2000)
    return () => clearInterval(id)
  }, [running])

  return { kpis, throughput, resources, services, logs }
}

/* --------------------------------------------------------------- metadata - */

const STATUS_META: Record<ServiceStatus, { label: string; color: string; bg: string }> = {
  operational: { label: 'Operacional', color: 'var(--green)', bg: '#E6FBF3' },
  degraded: { label: 'Degradado', color: 'var(--amber)', bg: '#FFF4E0' },
  down: { label: 'Fora do ar', color: 'var(--pink)', bg: '#FFE9F2' },
}
const SEV_META: Record<Severity, { color: string; bg: string; label: string }> = {
  info: { color: 'var(--blue)', bg: '#E6F1FF', label: 'INFO' },
  success: { color: 'var(--green)', bg: '#E6FBF3', label: 'OK' },
  warn: { color: 'var(--amber)', bg: '#FFF4E0', label: 'WARN' },
  error: { color: 'var(--pink)', bg: '#FFE9F2', label: 'ERRO' },
}
const ACTION_ICON: Record<PendingAction['type'], { icon: React.ReactNode; grad: string }> = {
  event: { grad: 'linear-gradient(135deg,#3E7BFB,#60a5fa)', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="4" width="18" height="18" rx="3" /><path d="M3 9h18M8 2v4M16 2v4" /></svg> },
  user: { grad: 'linear-gradient(135deg,#7C5CFF,#a78bfa)', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a6 6 0 0112 0v1" /></svg> },
  interest: { grad: 'linear-gradient(135deg,#ec4899,#f472b6)', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.6-10-9C.6 9 2 5 5.5 5 8 5 9.4 6.6 12 9c2.6-2.4 4-4 6.5-4C22 5 23.4 9 22 12c-2.5 4.4-10 9-10 9z" /></svg> },
  feedback: { grad: 'linear-gradient(135deg,#10A87D,#34d399)', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 15a4 4 0 01-4 4H8l-5 4V7a4 4 0 014-4h10a4 4 0 014 4z" /></svg> },
}
const ACTIVITY_ICON: Record<Activity['type'], { icon: React.ReactNode; color: string; bg: string }> = {
  create: { color: '#059669', bg: '#D1FAE5', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M12 5v14M5 12h14" /></svg> },
  update: { color: '#2563EB', bg: '#DBEAFE', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" /></svg> },
  delete: { color: '#DC2626', bg: '#FEE2E2', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" /></svg> },
  login: { color: '#4F46E5', bg: '#E0E7FF', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" /></svg> },
  purchase: { color: '#D97706', bg: '#FEF3C7', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.7 13.4a2 2 0 002 1.6h9.7a2 2 0 002-1.6L23 6H6" /></svg> },
}
const REPORT_SEV: Record<Report['severity'], { label: string; color: string; bg: string }> = {
  low: { label: 'Baixa', color: 'var(--amber)', bg: '#FFF4E0' },
  medium: { label: 'Média', color: '#EA580C', bg: '#FFEAD5' },
  high: { label: 'Alta', color: '#DC2626', bg: '#FEE2E2' },
}

/* ------------------------------------------------------- shared subcomp --- */

function Dot({ color, pulse }: { color: string; pulse?: boolean }) {
  return (
    <span className="relative grid place-items-center w-2.5 h-2.5 flex-none">
      {pulse && <span className="absolute inset-0 rounded-full animate-ping" style={{ background: color, opacity: 0.5 }} />}
      <span className="relative w-2.5 h-2.5 rounded-full" style={{ background: color }} />
    </span>
  )
}

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

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className="relative w-12 h-6.5 rounded-full transition-colors flex-none"
      style={{ background: checked ? GRAD : 'var(--line)' }}
    >
      <span className="absolute top-0.75 left-0.75 w-5 h-5 rounded-full bg-white transition-transform" style={{ transform: checked ? 'translateX(22px)' : undefined, boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
    </button>
  )
}

function StatCard({ value, label, grad, trend, icon }: { value: string; label: string; grad: string; trend?: string; icon?: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-[18px] px-5 py-4.5 text-white flex items-center justify-between" style={{ background: grad, boxShadow: 'var(--shadow-sm)' }}>
      <div className="min-w-0">
        <div className="text-[26px] font-extrabold leading-none tabular-nums" style={{ fontFamily: 'var(--font-bricolage)' }}>{value}</div>
        <div className="text-[13px] font-semibold opacity-90 mt-1.5 truncate">{label}</div>
      </div>
      {trend ? (
        <span className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-extrabold flex-none" style={{ background: 'rgba(255,255,255,.22)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M3 17l6-6 4 4 8-8M21 7v5h-5" /></svg>
          {trend}
        </span>
      ) : (
        icon && <span className="opacity-50 flex-none">{icon}</span>
      )}
    </div>
  )
}

/* ----------------------------------------------------------- telemetry UI - */

function MetricCard({ icon, iconBg, iconColor, value, unit, label, trend, trendUp, series, seriesColor }: {
  icon: React.ReactNode; iconBg: string; iconColor: string; value: string; unit?: string; label: string; trend: string; trendUp: boolean; series: number[]; seriesColor: string
}) {
  const path = useMemo(() => {
    const min = Math.min(...series)
    const range = Math.max(...series) - min || 1
    return series.map((v, i) => `${i === 0 ? 'M' : 'L'}${((i / (series.length - 1)) * 90).toFixed(1)} ${(34 - ((v - min) / range) * 30 - 2).toFixed(1)}`).join(' ')
  }, [series])
  return (
    <div className="relative overflow-hidden rounded-[20px] px-5 py-4.5" style={card}>
      <div className="flex items-center justify-between">
        <span className="w-10.5 h-10.5 rounded-[13px] grid place-items-center flex-none" style={{ background: iconBg, color: iconColor }}>{icon}</span>
        <span className="text-[13px] font-extrabold" style={{ color: trendUp ? 'var(--green)' : 'var(--pink)' }}>{trendUp ? '▲' : '▼'} {trend}</span>
      </div>
      <div className="mt-3.5 leading-none flex items-baseline gap-1">
        <span className="text-[30px] font-extrabold tabular-nums" style={{ fontFamily: 'var(--font-bricolage)' }}>{value}</span>
        {unit && <span className="text-[14px] font-bold" style={{ color: 'var(--wp-muted)' }}>{unit}</span>}
      </div>
      <div className="text-[13.5px] font-semibold mt-1" style={{ color: 'var(--wp-muted)' }}>{label}</div>
      <svg className="absolute right-0 bottom-0 w-22.5 h-9 opacity-90" viewBox="0 0 90 34" preserveAspectRatio="none">
        <path d={path} fill="none" stroke={seriesColor} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

function ThroughputChart({ data, running }: { data: number[]; running: boolean }) {
  const { line, area } = useMemo(() => {
    const max = Math.max(...data, 1)
    const pts = data.map((v, i) => [(i / (data.length - 1)) * 100, 100 - (v / max) * 92 - 4] as const)
    const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ')
    return { line, area: `${line} L100 100 L0 100 Z` }
  }, [data])
  return (
    <div className="rounded-[22px] p-5 sm:p-6" style={card}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-[17px] font-extrabold" style={{ fontFamily: 'var(--font-bricolage)' }}>Tráfego em tempo real</h2>
          <p className="text-[13px] font-medium mt-0.5" style={{ color: 'var(--wp-muted)' }}>Requisições por segundo · janela de 80s</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-extrabold" style={{ background: '#E6FBF3', color: 'var(--green)' }}>
          <Dot color="var(--green)" pulse={running} /> ao vivo
        </div>
      </div>
      <div className="mt-4 relative w-full h-44">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id="thru-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#F0309A" stopOpacity="0.28" /><stop offset="100%" stopColor="#F0309A" stopOpacity="0" /></linearGradient>
            <linearGradient id="thru-stroke" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#FF9D3D" /><stop offset="55%" stopColor="#FF5F8D" /><stop offset="100%" stopColor="#F0309A" /></linearGradient>
          </defs>
          {[25, 50, 75].map((y) => <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(34,26,61,.06)" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />)}
          <path d={area} fill="url(#thru-fill)" />
          <path d={line} fill="none" stroke="url(#thru-stroke)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
    </div>
  )
}

function ResourceBar({ label, value, color, suffix = '%' }: { label: string; value: number; color: string; suffix?: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[13px] mb-1.5">
        <span className="font-semibold" style={{ color: 'var(--ink-soft)' }}>{label}</span>
        <span className="font-extrabold tabular-nums">{Math.round(value)}{suffix}</span>
      </div>
      <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--line)' }}>
        <div className="h-full rounded-full transition-[width] duration-700 ease-out" style={{ width: `${suffix === '%' ? value : (value / 20) * 100}%`, background: color }} />
      </div>
    </div>
  )
}

/* ----------------------------------------------------------- demo content - */

const INITIAL_PENDING: PendingAction[] = [
  { id: 1, type: 'event', title: 'Novo evento pendente', description: 'Festa Junina 2026 aguarda aprovação' },
  { id: 2, type: 'interest', title: 'Novo interesse solicitado', description: 'Categoria "Sertanejo" foi sugerida' },
  { id: 3, type: 'user', title: 'Verificação de produtor', description: 'João Silva solicitou verificação' },
]
const RECENT_ACTIVITY: Activity[] = [
  { id: 1, type: 'create', user: 'Maria Santos', action: 'criou o evento "Summer Vibes"', time: 'há 5 min' },
  { id: 2, type: 'purchase', user: 'Pedro Costa', action: 'comprou 2 ingressos', time: 'há 12 min' },
  { id: 3, type: 'login', user: 'Ana Oliveira', action: 'fez login no sistema', time: 'há 25 min' },
  { id: 4, type: 'update', user: 'Lucas Ferreira', action: 'atualizou seu perfil', time: 'há 1 hora' },
  { id: 5, type: 'delete', user: 'Juliana Lima', action: 'cancelou inscrição no evento', time: 'há 2 horas' },
]
const INITIAL_REPORTS: Report[] = [
  { id: 1, type: 'Spam', severity: 'medium', content: 'Usuário enviando mensagens promocionais em massa nos comentários.', date: '02/02/2026', target: 'Carlos Mendes' },
  { id: 2, type: 'Conteúdo inadequado', severity: 'high', content: 'Evento com descrição contendo linguagem ofensiva.', date: '01/02/2026', target: 'Evento Suspeito' },
]
const QUICK_LINKS = [
  { href: '/cms/admin/users', label: 'Gerenciar usuários', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="9" cy="8" r="3.5" /><path d="M3 21v-1a6 6 0 0112 0v1M16 4.5a3.5 3.5 0 010 7M21 21v-1a6 6 0 00-4-5.7" /></svg> },
  { href: '/cms/admin/feedbacks', label: 'Ver feedbacks', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 15a4 4 0 01-4 4H8l-5 4V7a4 4 0 014-4h10a4 4 0 014 4z" /></svg> },
  { href: '/cms/admin/interests', label: 'Gerenciar interesses', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.6-10-9C.6 9 2 5 5.5 5 8 5 9.4 6.6 12 9c2.6-2.4 4-4 6.5-4C22 5 23.4 9 22 12c-2.5 4.4-10 9-10 9z" /></svg> },
  { href: '/cms/admin/events', label: 'Gerenciar eventos', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="4" width="18" height="18" rx="3" /><path d="M3 9h18M8 2v4M16 2v4" /></svg> },
]

/* ------------------------------------------------------------------- page -- */

export default function ControlPanelPage() {
  const [running, setRunning] = useState(true)
  const [env, setEnv] = useState<'producao' | 'staging'>('producao')
  const [spin, setSpin] = useState(false)
  const { kpis, throughput, resources, services, logs } = useLiveMetrics(running)

  const [pending, setPending] = useState(INITIAL_PENDING)
  const [reports, setReports] = useState(INITIAL_REPORTS)
  const [settings, setSettings] = useState({ allowRegistrations: true, maintenanceMode: false, autoApproveEvents: false, emailNotifications: true })

  const lastSync = logs[0]?.time ?? '—'
  const downCount = services.filter((s) => s.status !== 'operational').length
  const globalOk = downCount === 0
  const kpiSeries = throughput

  function refresh() {
    setSpin(true)
    setTimeout(() => setSpin(false), 900)
  }
  function toggle(key: keyof typeof settings) {
    setSettings((s) => ({ ...s, [key]: !s[key] }))
  }

  const settingDefs: { key: keyof typeof settings; name: string; desc: string }[] = [
    { key: 'allowRegistrations', name: 'Permitir cadastros', desc: 'Novos usuários podem se registrar' },
    { key: 'maintenanceMode', name: 'Modo manutenção', desc: 'Site fica offline para usuários' },
    { key: 'autoApproveEvents', name: 'Aprovar eventos automaticamente', desc: 'Eventos publicam sem revisão' },
    { key: 'emailNotifications', name: 'Notificações por e-mail', desc: 'Receber alertas por e-mail' },
  ]

  return (
    <div className="flex flex-col gap-5">
      <BackButton fallback="/cms/home" />

      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className="w-14 h-14 rounded-[18px] grid place-items-center text-white flex-none" style={{ background: GRAD, boxShadow: '0 14px 28px -14px rgba(240,48,154,.7)' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 12h4l2 6 4-14 2 8h6" /></svg>
        </span>
        <div className="min-w-0">
          <h1 className="font-extrabold text-[clamp(22px,5vw,30px)] leading-[1.05]" style={{ fontFamily: 'var(--font-bricolage)' }}>
            Painel de <span style={{ background: 'linear-gradient(120deg,var(--violet),var(--pink))', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>Controle</span>
          </h1>
          <p className="font-semibold mt-0.5 text-[14px]" style={{ color: 'var(--ink-soft)' }}>
            Visão geral e controle das ações do site · sincronizado às {lastSync}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2.5 flex-wrap">
          <div className="flex p-1 rounded-[14px]" style={{ background: '#fff', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
            {(['producao', 'staging'] as const).map((e) => (
              <button key={e} onClick={() => setEnv(e)} className="px-3.5 py-2 rounded-[10px] text-[13px] font-extrabold transition" style={env === e ? { background: GRAD, color: '#fff' } : { color: 'var(--wp-muted)' }}>
                {e === 'producao' ? 'Produção' : 'Staging'}
              </button>
            ))}
          </div>
          <button onClick={refresh} className="flex items-center gap-2 rounded-[14px] px-4.5 py-3 font-extrabold transition hover:-translate-y-0.5" style={{ background: '#fff', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={spin ? 'animate-spin' : undefined}><path d="M21 12a9 9 0 11-3-6.7L21 8M21 3v5h-5" /></svg>
            Atualizar
          </button>
          <button onClick={() => setRunning((v) => !v)} className="flex items-center gap-2 rounded-[14px] px-4.5 py-3 font-extrabold transition hover:-translate-y-0.5" style={{ background: '#fff', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
            {running ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5l12 7-12 7z" /></svg>}
            {running ? 'Pausar' : 'Retomar'}
          </button>
        </div>
      </div>

      {/* Business quick stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard value={fmtInt(1542)} label="Usuários online" grad="linear-gradient(135deg,#7C5CFF,#a78bfa)" trend="+12%" />
        <StatCard value={fmtInt(86)} label="Total de eventos" grad="linear-gradient(135deg,#10A87D,#34d399)" trend="+8%" />
        <StatCard value={String(pending.length)} label="Ações pendentes" grad="linear-gradient(135deg,#F59E0B,#fbbf24)" icon={<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></svg>} />
        <StatCard value={`R$ ${fmtInt(45680)}`} label="Receita (mês)" grad="linear-gradient(135deg,#3E7BFB,#60a5fa)" trend="+24%" />
      </div>

      {/* Global status banner */}
      <div className="flex items-center gap-3.5 rounded-[18px] px-5 py-4" style={{ background: globalOk ? 'linear-gradient(110deg,rgba(16,168,125,.10),rgba(16,168,125,.02))' : 'linear-gradient(110deg,rgba(232,146,12,.12),rgba(216,27,126,.05))', border: `1px solid ${globalOk ? 'rgba(16,168,125,.25)' : 'rgba(232,146,12,.3)'}` }}>
        <Dot color={globalOk ? 'var(--green)' : 'var(--amber)'} pulse={running} />
        <div className="min-w-0">
          <p className="font-extrabold text-[15px]">{globalOk ? 'Todos os sistemas operacionais' : `${downCount} serviço(s) com atenção`}</p>
          <p className="text-[13px] font-medium" style={{ color: 'var(--ink-soft)' }}>
            Ambiente: <strong>{env === 'producao' ? 'Produção' : 'Staging'}</strong> · monitorando {services.length} serviços
            {settings.maintenanceMode && <span style={{ color: 'var(--amber)' }}> · ⚠ modo manutenção ativo</span>}
          </p>
        </div>
        <span className="ml-auto hidden sm:block text-[13px] font-extrabold tabular-nums" style={{ color: 'var(--green)' }}>{kpis.uptime.toFixed(2)}% uptime</span>
      </div>

      {/* Telemetry KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M13 2L3 14h7l-1 8 11-13h-7z" /></svg>} iconBg="#EEEAFF" iconColor="var(--violet)" value={fmtInt(kpis.rpm)} unit="req/min" label="Throughput" trend="tempo real" trendUp series={kpiSeries} seriesColor="#7C5CFF" />
        <MetricCard icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>} iconBg="#E6F1FF" iconColor="var(--blue)" value={Math.round(kpis.latency).toString()} unit="ms" label="Latência média (p50)" trend="p95 estável" trendUp={kpis.latency < 160} series={kpiSeries.map((v) => 130 - v)} seriesColor="#3E7BFB" />
        <MetricCard icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 9v4M12 17h.01M10.3 3.9l-8 14A2 2 0 004 21h16a2 2 0 001.7-3l-8-14a2 2 0 00-3.4 0z" /></svg>} iconBg="#FFE9F2" iconColor="var(--pink)" value={kpis.errorRate.toFixed(2)} unit="%" label="Taxa de erro (5xx)" trend={kpis.errorRate < 1 ? 'saudável' : 'acima do alvo'} trendUp={kpis.errorRate < 1} series={kpiSeries.map((v) => v * 0.4)} seriesColor="#F0309A" />
        <MetricCard icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>} iconBg="#E6FBF3" iconColor="var(--green)" value={kpis.uptime.toFixed(2)} unit="%" label="Disponibilidade (30d)" trend="SLA 99.9%" trendUp series={kpiSeries.map((v) => v * 0.2 + 60)} seriesColor="#10A87D" />
      </div>

      {/* Main grid */}
      <div className="grid gap-5 grid-cols-1 min-[1181px]:grid-cols-[minmax(0,1fr)_372px]">
        {/* Left column */}
        <div className="flex flex-col gap-5 min-w-0">
          <ThroughputChart data={throughput} running={running} />

          {/* Pending actions + Recent activity */}
          <div className="grid gap-5 md:grid-cols-2">
            {/* Pending actions */}
            <div className="rounded-[22px] p-5 sm:p-6" style={panel}>
              <SectionTitle
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="9" /><path d="M12 8v4l3 2" /></svg>}
                badge={<span className="text-[12px] font-extrabold px-2.5 py-1 rounded-full" style={{ background: '#FFF4E0', color: 'var(--amber)' }}>{pending.length}</span>}
              >
                Ações pendentes
              </SectionTitle>
              <div className="flex flex-col gap-2.5">
                {pending.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 rounded-[14px] p-3" style={card}>
                    <span className="w-9.5 h-9.5 rounded-[11px] grid place-items-center text-white flex-none" style={{ background: ACTION_ICON[a.type].grad }}>{ACTION_ICON[a.type].icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-[13.5px] truncate">{a.title}</p>
                      <p className="text-[12px] font-medium truncate" style={{ color: 'var(--wp-muted)' }}>{a.description}</p>
                    </div>
                    <div className="flex gap-1.5 flex-none">
                      <button onClick={() => setPending((p) => p.filter((x) => x.id !== a.id))} className="w-8 h-8 rounded-[9px] grid place-items-center transition hover:brightness-95" style={{ background: '#D1FAE5', color: '#059669' }} aria-label="Aprovar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8"><path d="M5 13l4 4L19 7" /></svg>
                      </button>
                      <button onClick={() => setPending((p) => p.filter((x) => x.id !== a.id))} className="w-8 h-8 rounded-[9px] grid place-items-center transition hover:brightness-95" style={{ background: '#FEE2E2', color: '#DC2626' }} aria-label="Rejeitar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8"><path d="M6 6l12 12M18 6L6 18" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
                {pending.length === 0 && (
                  <div className="flex flex-col items-center gap-2 py-7" style={{ color: 'var(--wp-muted)' }}>
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" /></svg>
                    <span className="text-[13px] font-semibold">Nenhuma ação pendente</span>
                  </div>
                )}
              </div>
            </div>

            {/* Recent activity */}
            <div className="rounded-[22px] p-5 sm:p-6" style={panel}>
              <SectionTitle
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 8v4l3 2" /><circle cx="12" cy="12" r="9" /></svg>}
              >
                Atividade recente
              </SectionTitle>
              <div className="flex flex-col">
                {RECENT_ACTIVITY.map((a, i) => {
                  const m = ACTIVITY_ICON[a.type]
                  return (
                    <div key={a.id} className="flex items-center gap-3 py-2.5" style={i < RECENT_ACTIVITY.length - 1 ? { borderBottom: '1px solid var(--line-2)' } : undefined}>
                      <span className="w-8.5 h-8.5 rounded-full grid place-items-center flex-none" style={{ background: m.bg, color: m.color }}>{m.icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] leading-snug" style={{ color: 'var(--ink-soft)' }}><strong style={{ color: 'var(--ink)' }}>{a.user}</strong> {a.action}</p>
                        <p className="text-[11.5px] font-medium" style={{ color: 'var(--wp-muted)' }}>{a.time}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="rounded-[22px] p-5 sm:p-6" style={card}>
            <SectionTitle
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 12h4l2-7 4 14 2-7h6" /></svg>}
              badge={<span className="text-[12px] font-bold px-2.5 py-1 rounded-full" style={{ background: '#EEEAFF', color: 'var(--violet)' }}>{services.length}</span>}
            >
              Saúde do sistema · serviços
            </SectionTitle>
            <div className="grid sm:grid-cols-2 gap-3">
              {services.map((s) => {
                const meta = STATUS_META[s.status]
                return (
                  <div key={s.name} className="flex items-center gap-3 rounded-[16px] p-3.5" style={{ background: '#FBFAFE', border: '1px solid var(--line-2)' }}>
                    <span className="w-10 h-10 rounded-[12px] grid place-items-center flex-none" style={{ background: meta.bg, color: meta.color }}>{s.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold text-[14px] truncate">{s.name}</p>
                      <p className="text-[12px] font-medium truncate" style={{ color: 'var(--wp-muted)' }}>{s.desc}</p>
                    </div>
                    <div className="text-right flex-none">
                      <div className="flex items-center gap-1.5 justify-end">
                        <Dot color={meta.color} pulse={running && s.status !== 'operational'} />
                        <span className="text-[11px] font-extrabold uppercase tracking-wide" style={{ color: meta.color }}>{meta.label}</span>
                      </div>
                      <p className="text-[12px] font-bold tabular-nums mt-0.5" style={{ color: 'var(--ink-soft)' }}>{Math.round(s.latency)} ms</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Resources */}
          <div className="rounded-[22px] p-5 sm:p-6" style={card}>
            <h2 className="text-[17px] font-extrabold mb-4" style={{ fontFamily: 'var(--font-bricolage)' }}>Uso de recursos</h2>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4.5">
              <ResourceBar label="CPU" value={resources.cpu} color="linear-gradient(90deg,#7C5CFF,#9b6bff)" />
              <ResourceBar label="Memória" value={resources.mem} color="linear-gradient(90deg,#3E7BFB,#5b93ff)" />
              <ResourceBar label="Conexões DB" value={resources.db} suffix="/20" color="linear-gradient(90deg,#10A87D,#3fcea7)" />
              <ResourceBar label="Rede I/O" value={resources.net} color={GRAD} />
            </div>
          </div>

          {/* Reports / moderation */}
          <div className="rounded-[22px] p-5 sm:p-6" style={card}>
            <SectionTitle
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M4 21V4h13l-2 4 2 4H4" /></svg>}
              badge={<span className="text-[12px] font-extrabold px-2.5 py-1 rounded-full" style={{ background: '#FEE2E2', color: '#DC2626' }}>{reports.length}</span>}
            >
              Denúncias
            </SectionTitle>
            <div className="flex flex-col gap-3">
              {reports.map((r) => {
                const sev = REPORT_SEV[r.severity]
                return (
                  <div key={r.id} className="rounded-[16px] p-4" style={{ background: '#FFFBFB', border: '1px solid #FEE2E2' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-[7px]" style={{ background: sev.bg, color: sev.color }}>{r.type} · {sev.label}</span>
                      <span className="text-[12px] font-medium" style={{ color: 'var(--wp-muted)' }}>{r.date}</span>
                    </div>
                    <p className="text-[13.5px] leading-relaxed mb-3" style={{ color: 'var(--ink-soft)' }}>{r.content}</p>
                    <div className="flex items-center gap-2.5">
                      <span className="text-[12.5px] font-bold flex-1 truncate">Alvo: {r.target}</span>
                      <button className="rounded-[9px] px-3.5 py-2 text-[12.5px] font-bold transition hover:brightness-95" style={{ background: '#E0E7FF', color: '#4F46E5' }}>Ver detalhes</button>
                      <button onClick={() => setReports((p) => p.filter((x) => x.id !== r.id))} className="rounded-[9px] px-3.5 py-2 text-[12.5px] font-bold transition hover:brightness-95" style={{ background: 'var(--line)', color: 'var(--ink-soft)' }}>Ignorar</button>
                    </div>
                  </div>
                )
              })}
              {reports.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-7" style={{ color: 'var(--wp-muted)' }}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" /></svg>
                  <span className="text-[13px] font-semibold">Nenhuma denúncia em aberto</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5 min-w-0">
          {/* Quick settings */}
          <div className="rounded-[22px] p-5 sm:p-6" style={card}>
            <SectionTitle icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-2.7 1.1V21a2 2 0 11-4 0v-.1A1.6 1.6 0 005 19.4l-.1.1a2 2 0 11-2.8-2.8l.1-.1A1.6 1.6 0 003.3 14H3a2 2 0 110-4h.1A1.6 1.6 0 004.6 7.3L4.5 7.2A2 2 0 117.3 4.4l.1.1A1.6 1.6 0 0010 3.3V3a2 2 0 014 0v.1a1.6 1.6 0 002.7 1.1l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 00-.3 1.8" /></svg>}>
              Configurações rápidas
            </SectionTitle>
            <div className="flex flex-col">
              {settingDefs.map((s, i) => (
                <div key={s.key} className="flex items-center justify-between gap-3 py-3" style={i < settingDefs.length - 1 ? { borderBottom: '1px solid var(--line-2)' } : undefined}>
                  <div className="min-w-0">
                    <p className="font-bold text-[13.5px]">{s.name}</p>
                    <p className="text-[12px] font-medium" style={{ color: 'var(--wp-muted)' }}>{s.desc}</p>
                  </div>
                  <Toggle checked={settings[s.key]} onChange={() => toggle(s.key)} />
                </div>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="rounded-[22px] p-5 sm:p-6" style={card}>
            <SectionTitle icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M10 13a5 5 0 007 0l3-3a5 5 0 00-7-7l-1.5 1.5M14 11a5 5 0 00-7 0l-3 3a5 5 0 007 7l1.5-1.5" /></svg>}>
              Acesso rápido
            </SectionTitle>
            <div className="grid grid-cols-2 gap-2.5">
              {QUICK_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="flex flex-col gap-2 rounded-[14px] p-3.5 transition hover:-translate-y-0.5" style={{ background: '#FBFAFE', border: '1px solid var(--line-2)' }}>
                  <span style={{ color: 'var(--violet)' }}>{l.icon}</span>
                  <span className="text-[13px] font-bold leading-tight">{l.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Live log stream */}
          <div className="rounded-[22px] p-5 sm:p-6 flex flex-col" style={card}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[17px] font-extrabold" style={{ fontFamily: 'var(--font-bricolage)' }}>Stream de eventos</h2>
                <p className="text-[12.5px] font-medium mt-0.5" style={{ color: 'var(--wp-muted)' }}>Logs do servidor · {running ? 'transmitindo' : 'pausado'}</p>
              </div>
              <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold" style={{ background: running ? '#FFE9F2' : 'var(--line)', color: running ? 'var(--pink)' : 'var(--wp-muted)' }}>
                <Dot color={running ? 'var(--pink)' : 'var(--wp-muted)'} pulse={running} />
                {running ? 'REC' : 'OFF'}
              </div>
            </div>
            <div className="flex flex-col gap-1.5 max-h-110 overflow-y-auto pr-1 -mr-1">
              {logs.length === 0 && <p className="text-[13px] font-medium py-8 text-center" style={{ color: 'var(--wp-muted)' }}>Aguardando eventos…</p>}
              {logs.map((log) => {
                const meta = SEV_META[log.severity]
                return (
                  <div key={log.id} className="flex items-start gap-2.5 rounded-[12px] px-3 py-2.5" style={{ background: '#FBFAFE', border: '1px solid var(--line-2)' }}>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-[6px] flex-none mt-0.5" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12.5px] font-bold leading-snug">
                        <span className="font-mono" style={{ color: 'var(--violet)' }}>{log.method}</span> <span style={{ color: 'var(--ink)' }}>{log.message}</span>
                      </p>
                      <p className="text-[11px] font-medium mt-0.5 tabular-nums" style={{ color: 'var(--wp-muted)' }}>{log.time} · {log.service} · {log.ms}ms</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
