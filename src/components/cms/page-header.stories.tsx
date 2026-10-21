import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CalendarDays, Plus } from 'lucide-react'
import { PageHeader } from '@/components/cms/page-header'
import { Button } from '@/components/ui/button'
import { figmaNode } from '@/lib/figma'

const meta = {
  title: 'CMS/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
  parameters: { layout: 'padded', design: { type: 'figma', url: figmaNode('3098:567') } },
  args: { title: 'Meus eventos', subtitle: 'Gerencie seus eventos aqui', icon: <CalendarDays /> },
} satisfies Meta<typeof PageHeader>

export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const ComAcao: Story = { args: { actions: <Button variant="primary" size="md"><Plus /> Criar evento</Button> } }
