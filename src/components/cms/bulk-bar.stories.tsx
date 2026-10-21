import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { BulkBar } from '@/components/cms/bulk-bar'
import { figmaNode } from '@/lib/figma'

const meta = {
  title: 'CMS/BulkBar',
  component: BulkBar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', design: { type: 'figma', url: figmaNode('3100:568') } },
  decorators: [(Story) => <div className="h-60"><Story /></div>],
  args: { count: 3, isPending: false, onArchive: () => {}, onDelete: () => {}, onClear: () => {} },
} satisfies Meta<typeof BulkBar>

export default meta
type Story = StoryObj<typeof meta>
export const Selecionados: Story = {}
export const Processando: Story = { args: { isPending: true } }
