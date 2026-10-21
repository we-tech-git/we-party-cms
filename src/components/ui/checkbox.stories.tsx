import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Checkbox } from '@/components/ui/checkbox'
import { figmaNode } from '@/lib/figma'

const meta = {
  title: 'UI/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: figmaNode('3093:404') } },
  args: { label: 'Lembrar-me' },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Desmarcado: Story = {}
export const Marcado: Story = { args: { defaultChecked: true } }
export const Desabilitado: Story = { args: { disabled: true } }
