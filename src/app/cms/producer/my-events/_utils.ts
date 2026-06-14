import type { EventDto } from '@/types/events.types'

export type UiEventStatus = 'ativo' | 'rascunho' | 'agendado' | 'encerrado' | 'arquivado'

export function mapEventStatus(status: EventDto['status'], startDate: string): UiEventStatus {
  if (status === 'DRAFT') return 'rascunho'
  if (status === 'COMPLETED') return 'encerrado'
  if (status === 'CANCELLED') return 'arquivado'
  // PUBLISHED
  return new Date(startDate) > new Date() ? 'agendado' : 'ativo'
}

export function calcEventScore(event: EventDto): number {
  return event._count.likes * 3 + event._count.comments * 2 + event._count.attendances * 2.5
}

export function calcPopularity(event: EventDto, maxScore: number): number {
  if (maxScore === 0) return 0
  return Math.round((calcEventScore(event) / maxScore) * 100)
}

export const EVENT_COVER_GRADIENTS = [
  'linear-gradient(120deg,#ff7e3d,#ff4d8d 55%,#a23bd6)',
  'linear-gradient(120deg,#10A87D,#3E7BFB)',
  'linear-gradient(120deg,#00d4ff,#7C5CFF 55%,#F0309A)',
  'linear-gradient(120deg,#F0309A,#FF9D3D,#7C5CFF)',
  'linear-gradient(120deg,#6b5b73,#3a3142)',
  'linear-gradient(120deg,#FF9D3D,#FF5F8D 52%,#F0309A)',
]

export function getCoverStyle(event: EventDto): React.CSSProperties {
  if (event.photos && event.photos.length > 0) {
    return { backgroundImage: `url(${event.photos[0]})` }
  }
  const idx = event.id.charCodeAt(0) % EVENT_COVER_GRADIENTS.length
  return { backgroundImage: EVENT_COVER_GRADIENTS[idx] }
}

export function formatEventDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export const STATUS_LABELS: Record<UiEventStatus, string> = {
  ativo: 'Em alta',
  rascunho: 'Rascunho',
  agendado: 'Agendado',
  encerrado: 'Encerrado',
  arquivado: 'Arquivado',
}

export const STATUS_STYLES: Record<UiEventStatus, { bg: string; color: string; pulse?: boolean }> = {
  ativo:     { bg: '#fff', color: 'var(--green)', pulse: true },
  rascunho:  { bg: '#fff', color: 'var(--amber)' },
  agendado:  { bg: '#fff', color: 'var(--violet)' },
  encerrado: { bg: 'rgba(255,255,255,.85)', color: '#6b6478' },
  arquivado: { bg: 'rgba(255,255,255,.85)', color: '#6b6478' },
}
