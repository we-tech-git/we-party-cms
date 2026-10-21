import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Users } from 'lucide-react'
import { StatCard } from '@/components/cms/stat-card'
import { figmaNode } from '@/lib/figma'

const meta = {
  title: 'CMS/StatCard',
  component: StatCard,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: figmaNode('3098:563') } },
  args: { icon: <Users />, tone: 'purple', value: 29, label: 'Usuários cadastrados', detail: '1 bloqueado(s)' },
  argTypes: { tone: { control: 'select', options: ['purple', 'green', 'orange', 'pink'] } },
  decorators: [(Story) => <div className="w-75"><Story /></div>],
} satisfies Meta<typeof StatCard>

export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
/** Regra AGENTS.md #3: métrica indisponível mostra "—", nunca 0. */
export const SemDado: Story = { args: { value: null } }
