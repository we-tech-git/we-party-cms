import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Textarea } from '@/components/ui/textarea'
import { figmaNode } from '@/lib/figma'

const meta = {
  title: 'UI/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: figmaNode('3100:582') } },
  args: { placeholder: 'Conte o que rola no evento…', maxLength: 600, showCount: true, value: '', className: 'w-90' },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const ComTexto: Story = { args: { value: 'Line-up, atrações e muito mais.' } }
