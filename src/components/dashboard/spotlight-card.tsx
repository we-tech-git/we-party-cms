import Link from 'next/link'
import { CalendarDays, Check, Eye, Flame, Heart, MapPin, Pencil, Share2, TrendingUp, Plus } from 'lucide-react'
import { EmptyState } from '@/components/cms/empty-state'
import { IconTile } from '@/components/cms/icon-tile'
import { Panel } from '@/components/cms/panel'
import { Chip } from '@/components/ui/chip'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { TopEventDto } from '@/types/events.types'

type SpotlightCardProps = {
  topEvent?: TopEventDto | null
}

function fmtReach(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace('.', ',')}k`
  return String(n)
}

function fmtNum(n: number): string {
  if (n >= 1_000) return n.toLocaleString('pt-BR')
  return String(n)
}

function formatEventDate(iso: string): string {
  const d = new Date(iso)
  const day = d.getDate()
  const month = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
  return `${day} ${month.charAt(0).toUpperCase() + month.slice(1)}`
}

function engagementScore(ev: TopEventDto): number {
  const engagement = ev.totalLikes + ev.totalComments + ev.totalSaves + ev.totalConfirmed
  return Math.min(100, Math.round((engagement / Math.max(ev.viewCount, 1)) * 100))
}

/** Evento em destaque (Figma: Início › Evento em destaque). Banner no degradê da tinta; sem preto puro nem sombra rosa. */
export function SpotlightCard({ topEvent }: SpotlightCardProps) {
  if (!topEvent) {
    return (
      <Panel as="section" className="flex flex-col items-center gap-4 px-6 py-12 text-center" data-testid="spotlight-empty">
        <EmptyState
          icon={<Flame />}
          title="Nenhum evento em destaque ainda"
          description="Crie seu primeiro evento e comece a acumular alcance"
          className="w-full"
        />
        <Link href="/cms/producer/new-event" className={cn(buttonVariants({ variant: 'primary', size: 'md' }))}>
          <Plus /> Criar evento
        </Link>
      </Panel>
    )
  }

  const score = engagementScore(topEvent)
  const stats = [
    { icon: <Eye />, tone: 'purple' as const, value: fmtNum(topEvent.viewCount), label: 'views' },
    { icon: <Heart />, tone: 'pink' as const, value: fmtNum(topEvent.totalLikes), label: 'curtidas' },
    { icon: <Check />, tone: 'green' as const, value: fmtNum(topEvent.totalConfirmed), label: 'confirmados' },
    { icon: <Share2 />, tone: 'orange' as const, value: fmtNum(topEvent.shareCount), label: 'compart.' },
  ]

  return (
    <Panel as="section" className="overflow-hidden p-0" data-testid="spotlight-card">
      {/* Banner */}
      <div className="flex min-h-37 flex-col justify-end gap-1.5 bg-(image:--wp-ink-card) px-6 py-5 text-white">
        <Chip tone="glass" className="mb-1">
          <Flame /> Em alta agora
        </Chip>
        <p className="text-[11px] font-semibold tracking-[.08em] uppercase opacity-75">Seu evento em destaque</p>
        <h2 className="text-2xl leading-tight font-bold">{topEvent.title}</h2>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium opacity-90">
          <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5" /> {topEvent.location}</span>
          <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5" /> {formatEventDate(topEvent.startDate)}</span>
        </div>
      </div>

      {/* Corpo */}
      <div className="flex flex-col gap-5 px-6 py-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-56 flex-1">
            <div className="mb-2 flex justify-between text-[13px] font-semibold text-ink">
              <span>Índice de popularidade</span>
              <span className="text-wp-magenta">{score}/100</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-tint-pink" role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full bg-(image:--wp-gradient)" style={{ width: `${score}%` }} />
            </div>
            <p className="mt-1.5 text-xs text-wp-sub">Taxa de engajamento sobre visualizações</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold tracking-[.08em] text-wp-sub uppercase">Alcance</p>
            <p className="font-heading text-[26px] leading-none font-bold text-wp-purple">{fmtReach(topEvent.totalPeopleReached)}</p>
            <p className="text-xs text-wp-sub">pessoas</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-wp-line pt-4 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-2.5">
              <IconTile tone={s.tone}>{s.icon}</IconTile>
              <div>
                <p className="font-heading text-[17px] leading-none font-bold text-ink">{s.value}</p>
                <p className="text-xs text-wp-sub">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button type="button" className={cn(buttonVariants({ variant: 'primary', size: 'compact' }))}>
            <TrendingUp /> Impulsionar alcance
          </button>
          <Link href={`/cms/producer/edit-event/${topEvent.id}`} className={cn(buttonVariants({ variant: 'line', size: 'compact' }))}>
            <Pencil /> Editar
          </Link>
        </div>
      </div>
    </Panel>
  )
}
