import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Chip } from '@/components/ui/chip'
import { figmaNode } from '@/lib/figma'

const meta = {
  title: 'UI/Chip',
  component: Chip,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: figmaNode('3022:119') } },
  args: { children: 'Música', tone: 'neutral' },
  argTypes: { tone: { control: 'select', options: ['neutral', 'pink', 'orange', 'purple', 'green', 'selected', 'glass'] } },
} satisfies Meta<typeof Chip>

export default meta
type Story = StoryObj<typeof meta>

export const Neutro: Story = {}
export const Todos: Story = {
  parameters: { backgrounds: { value: 'ink' } },
  render: () => (
    <div className="flex flex-wrap gap-2">
      {(['neutral', 'pink', 'orange', 'purple', 'green', 'selected', 'glass'] as const).map((t) => (
        <Chip key={t} tone={t}>{t}</Chip>
      ))}
    </div>
  ),
}
