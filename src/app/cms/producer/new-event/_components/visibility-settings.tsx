'use client'

import { Eye, Lightbulb, MessageCircle, Camera, Tag, Zap } from 'lucide-react'
import { useController } from 'react-hook-form'
import { IconTile } from '@/components/cms/icon-tile'
import { Panel, PanelHeader } from '@/components/cms/panel'
import { Chip } from '@/components/ui/chip'
import { PillTabs } from '@/components/ui/tabs'
import { useI18n } from '@/i18n/context'
import type { CreateEventForm } from '../_schema'

/** Visibilidade, comentários e dicas (Figma: Novo evento › coluna lateral). */
export function VisibilitySettings() {
  const { t } = useI18n()
  const { field: { value: isPublic, onChange: setIsPublic } } = useController<CreateEventForm, 'isPublic'>({ name: 'isPublic' })
  const { field: { value: allowComments, onChange: setAllowComments } } = useController<CreateEventForm, 'allowComments'>({ name: 'allowComments' })

  const tips = [
    { icon: <Camera />, text: <>Capa nítida e vertical-friendly tem <b>+60% de cliques</b> no feed.</> },
    { icon: <Tag />, text: 'Marque de 3 a 5 interesses certos pra alcançar o público ideal.' },
    { icon: <Zap />, text: 'Eventos públicos com comentários ativos sobem mais rápido na descoberta.' },
  ]

  return (
    <>
      <Panel as="section" className="flex flex-col gap-3.5" data-testid="panel-visibility">
        <PanelHeader title={t('newEvent.visibilityTitle')} icon={<Eye />} />
        <PillTabs
          aria-label={t('newEvent.visibilityTitle')}
          items={[
            { value: 'public', label: t('newEvent.public'), testId: 'visibility-public' },
            { value: 'private', label: t('newEvent.private'), testId: 'visibility-private' },
          ]}
          value={isPublic ? 'public' : 'private'}
          onValueChange={(v) => setIsPublic(v === 'public')}
          className="self-start"
        />
        <div className="flex flex-col items-start gap-2 text-[13px] leading-relaxed text-wp-sub">
          <Chip tone={isPublic ? 'purple' : 'pink'} className="text-[10.5px] tracking-[.06em] uppercase">
            {isPublic ? t('newEvent.appearsInDiscovery') : t('newEvent.onlyInvited')}
          </Chip>
          {isPublic ? t('newEvent.publicDesc') : t('newEvent.privateDesc')}
        </div>
      </Panel>

      <Panel as="section" className="flex flex-col gap-3.5" data-testid="panel-comments">
        <PanelHeader title={t('newEvent.commentsTitle')} icon={<MessageCircle />} />
        <PillTabs
          aria-label={t('newEvent.commentsTitle')}
          items={[
            { value: 'on', label: t('newEvent.allowed'), testId: 'comments-on' },
            { value: 'off', label: t('newEvent.notAllowed'), testId: 'comments-off' },
          ]}
          value={allowComments ? 'on' : 'off'}
          onValueChange={(v) => setAllowComments(v === 'on')}
          className="self-start"
        />
        <p className="text-[13px] leading-relaxed text-wp-sub">{t('newEvent.commentsDesc')}</p>
      </Panel>

      <section className="flex flex-col gap-3 rounded-panel bg-(image:--wp-ink-card) p-5 text-white" data-testid="panel-tips">
        <div className="flex items-center gap-2.5">
          <IconTile tone="neutral" className="bg-white/15 text-white"><Lightbulb /></IconTile>
          <h2 className="text-base font-semibold">{t('newEvent.tipsTitle')}</h2>
        </div>
        {tips.map((tip, i) => (
          <div key={i} className="flex items-start gap-2.5 text-[13px] opacity-90">
            <span aria-hidden className="grid size-6 shrink-0 place-items-center rounded-lg bg-white/15 [&_svg]:size-3.5">{tip.icon}</span>
            <div>{tip.text}</div>
          </div>
        ))}
      </section>
    </>
  )
}
