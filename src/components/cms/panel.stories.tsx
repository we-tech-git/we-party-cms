import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Clock } from 'lucide-react'
import { Panel, PanelHeader } from '@/components/cms/panel'
import { figmaNode } from '@/lib/figma'

const meta = {
  title: 'CMS/Panel',
  component: Panel,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: figmaNode('3098:577') } },
} satisfies Meta<typeof Panel>

export default meta
export const ComCabecalho: StoryObj<typeof meta> = {
  render: () => (
    <Panel className="w-90">
      <PanelHeader title="Ações pendentes" icon={<Clock />} action="Ver todos" />
      <p className="mt-4 text-sm text-wp-sub">Conteúdo do painel.</p>
    </Panel>
  ),
}
