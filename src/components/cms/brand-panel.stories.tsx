import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { BrandPanel } from '@/components/cms/brand-panel'
import { figmaNode } from '@/lib/figma'

const meta = {
  title: 'CMS/BrandPanel',
  component: BrandPanel,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', design: { type: 'figma', url: figmaNode('3094:533') } },
  args: {
    title: 'Todos os seus eventos,',
    highlight: 'sob seu controle.',
    bullets: ['Publique e edite eventos em minutos', 'Acompanhe alcance, curtidas e confirmações', 'Agende, arquive e organize tudo em um só lugar'],
    className: 'min-h-screen w-[720px]',
  },
} satisfies Meta<typeof BrandPanel>

export default meta
export const Login: StoryObj<typeof meta> = {}
