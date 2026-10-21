import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CalendarDays } from 'lucide-react'
import { EmptyState } from '@/components/cms/empty-state'
import { figmaNode } from '@/lib/figma'

const meta = {
  title: 'CMS/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: figmaNode('3103:958') } },
  args: { icon: <CalendarDays />, title: 'Nenhum evento por aqui', description: 'Tente outro filtro ou crie um novo evento.' },
  decorators: [(Story) => <div className="w-90"><Story /></div>],
} satisfies Meta<typeof EmptyState>

export default meta
export const Default: StoryObj<typeof meta> = {}
