import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SearchField } from '@/components/ui/search-field'
import { figmaNode } from '@/lib/figma'

const meta = {
  title: 'UI/SearchField',
  component: SearchField,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: figmaNode('3024:225') } },
  args: { placeholder: 'Buscar evento…', className: 'w-90' },
} satisfies Meta<typeof SearchField>

export default meta
export const Default: StoryObj<typeof meta> = {}
