'use client'
import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Switch } from '@/components/ui/switch'
import { figmaNode } from '@/lib/figma'

const meta = {
  title: 'UI/Switch',
  component: Switch,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: figmaNode('3098:527') } },
  args: { checked: false, 'aria-label': 'Permitir cadastros' },
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Desligado: Story = {}
export const Ligado: Story = { args: { checked: true } }
export const Interativo: Story = {
  render: function Render(args) {
    const [on, setOn] = useState(false)
    return <Switch {...args} checked={on} onCheckedChange={setOn} />
  },
}
