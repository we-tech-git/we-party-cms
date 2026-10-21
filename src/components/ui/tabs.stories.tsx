'use client'
import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { PillTabs, UnderlineTabs } from '@/components/ui/tabs'
import { figmaNode } from '@/lib/figma'

const meta = {
  title: 'UI/Tabs',
  parameters: { layout: 'padded', design: { type: 'figma', url: figmaNode('3022:79') } },
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Sublinhado: Story = {
  render: function Render() {
    const [v, setV] = useState('todos')
    return (
      <UnderlineTabs
        aria-label="Filtro"
        value={v}
        onValueChange={setV}
        items={[{ value: 'todos', label: 'Todos', count: 6 }, { value: 'ativo', label: 'Em alta', count: 0 }, { value: 'agendado', label: 'Agendados', count: 6 }]}
      />
    )
  },
}
export const Pilula: Story = {
  render: function Render() {
    const [v, setV] = useState('30D')
    return <PillTabs aria-label="Período" value={v} onValueChange={setV} items={['7D', '30D', '90D', '1A'].map((x) => ({ value: x, label: x }))} />
  },
}
