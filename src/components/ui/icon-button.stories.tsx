import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Eye, Star, Ban, Trash2, Check } from 'lucide-react'
import { IconButton } from '@/components/ui/icon-button'
import { figmaNode } from '@/lib/figma'

const meta = {
  title: 'UI/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: figmaNode('3098:519') } },
  args: { 'aria-label': 'Ver', tone: 'view', children: <Eye /> },
  argTypes: { tone: { control: 'select', options: ['neutral', 'view', 'danger', 'success'] } },
} satisfies Meta<typeof IconButton>

export default meta
type Story = StoryObj<typeof meta>

export const Ver: Story = {}
export const AcoesDeLinha: Story = {
  render: () => (
    <div className="flex gap-1.5">
      <IconButton tone="view" aria-label="Ver"><Eye /></IconButton>
      <IconButton tone="view" aria-label="Tornar produtor"><Star /></IconButton>
      <IconButton tone="danger" aria-label="Bloquear"><Ban /></IconButton>
      <IconButton tone="success" aria-label="Restaurar"><Check /></IconButton>
      <IconButton tone="neutral" aria-label="Excluir"><Trash2 /></IconButton>
    </div>
  ),
}
