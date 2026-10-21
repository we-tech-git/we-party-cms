'use client'

import { useRouter } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import { ActivityListItem, ACTIVITY_TYPE_STYLE } from '@/components/dashboard/activity-item'
import { EmptyState } from '@/components/cms/empty-state'
import { Panel, PanelHeader } from '@/components/cms/panel'
import { useI18n } from '@/i18n/context'
import type { EventActivityDto } from '@/types/events.types'

interface ActivityInboxProps {
  activities?: EventActivityDto[]
  isLoading?: boolean
}

/** Atividade recente (Figma: Início › painel lateral). Reusa ActivityListItem (mesmo item do drawer de atividades). */
export function ActivityInbox({ activities, isLoading }: ActivityInboxProps) {
  const router = useRouter()
  const { t } = useI18n()

  // Protege contra payload inesperado e mantém só tipos conhecidos (o backend já ordena do mais recente).
  const items = Array.isArray(activities)
    ? activities.filter((a) => a && a.type in ACTIVITY_TYPE_STYLE).slice(0, 20)
    : []

  return (
    <Panel as="section" className="flex flex-col gap-3" data-testid="activity-inbox">
      <PanelHeader
        title={t('home.recentActivityTitle')}
        icon={<MessageCircle />}
        action={
          <button type="button" onClick={() => router.push('/cms/producer/my-events')} className="font-semibold">
            {t('common.all')}
          </button>
        }
      />

      {isLoading && <p className="py-6 text-center text-[13.5px] text-wp-sub">{t('home.activityLoading')}</p>}

      {!isLoading && items.length === 0 && (
        <EmptyState icon={<MessageCircle />} title={t('home.activityEmpty')} description={t('home.activityEmptySub')} />
      )}

      {!isLoading && (
        <div>
          {items.map((item, i) => (
            <ActivityListItem key={item.id ?? i} item={item} isLast={i === items.length - 1} />
          ))}
        </div>
      )}
    </Panel>
  )
}
