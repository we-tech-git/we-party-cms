import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { figmaNode } from '@/lib/figma'

const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: figmaNode('3021:129') } },
  args: { children: 'Criar evento', variant: 'primary', size: 'md' },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'dark', 'soft', 'line', 'outline', 'ghost', 'destructive'] },
    size: { control: 'select', options: ['md', 'compact', 'default', 'sm'] },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}
export const Dark: Story = { args: { variant: 'dark' } }
export const Soft: Story = { args: { variant: 'soft' } }
export const Line: Story = { args: { variant: 'line' } }
export const Compact: Story = { args: { size: 'compact' } }
export const ComIcone: Story = { args: { children: (<><Plus /> Criar evento</>) } }
export const Desabilitado: Story = { args: { disabled: true } }
export const Todos: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {(['primary', 'dark', 'soft', 'line'] as const).map((v) => (
        <div key={v} className="flex items-center gap-3">
          <Button variant={v} size="md">{v}</Button>
          <Button variant={v} size="compact">{v} compact</Button>
          <Button variant={v} size="md" disabled>{v} off</Button>
        </div>
      ))}
    </div>
  ),
}
