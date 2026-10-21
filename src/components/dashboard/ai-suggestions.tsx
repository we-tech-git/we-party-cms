'use client'

import { Sparkles } from 'lucide-react'
import { EmptyState } from '@/components/cms/empty-state'
import { Panel, PanelHeader } from '@/components/cms/panel'
import { useI18n } from '@/i18n/context'

export function AiSuggestions() {
  const { t } = useI18n()
  return (
    <Panel as="section" className="flex flex-col gap-4">
      <PanelHeader title={t('home.aiSuggestionsTitle')} icon={<Sparkles />} tone="orange" />
      {/* Estado vazio — recurso ainda sem API */}
      <EmptyState icon={<Sparkles />} title="Sugestões de IA em breve" description="Esse recurso ainda não está disponível." />
    </Panel>
  )
}
