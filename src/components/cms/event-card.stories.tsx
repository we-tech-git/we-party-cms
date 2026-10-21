import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { EventCard } from '@/components/cms/event-card'
import { figmaNode } from '@/lib/figma'
import type { EventDto } from '@/types/events.types'

const base = {
  id: 'evt-1',
  title: 'BNI Zona Oeste: Visibilidade, Indicação e Crescimento Empresarial',
  status: 'PUBLISHED',
  startDate: new Date(Date.now() + 5 * 86_400_000).toISOString(),
  location: 'R. Tito, 79',
  photos: [],
  viewCount: 1,
  shareCount: 0,
  eventInterests: [{ interestId: 'i1', interest: { id: 'i1', name: 'Empreendedorismo' } }],
  _count: { likes: 0, comments: 0, attendances: 0 },
} as unknown as EventDto

const meta = {
  title: 'CMS/EventCard',
  component: EventCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded', design: { type: 'figma', url: figmaNode('3100:598') } },
  decorators: [(Story) => <div className="w-88"><Story /></div>],
  args: {
    event: base, view: 'grid', popularityPct: 0, selected: false,
    onSelect: () => {}, onArchive: () => {}, onDelete: () => {}, onComments: () => {}, onActivities: () => {}, onEdit: () => {},
  },
} satisfies Meta<typeof EventCard>

export default meta
type Story = StoryObj<typeof meta>
export const Agendado: Story = {}
export const Selecionado: Story = { args: { selected: true } }
export const EmAlta: Story = {
  args: { event: { ...base, startDate: new Date(Date.now() - 86_400_000).toISOString(), viewCount: 1200 } as EventDto, popularityPct: 72 },
}
export const Rascunho: Story = { args: { event: { ...base, status: 'DRAFT' } as EventDto } }
