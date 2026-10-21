import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SocialButton } from '@/components/ui/social-button'
import { figmaNode } from '@/lib/figma'

const meta = {
  title: 'UI/SocialButton',
  component: SocialButton,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: figmaNode('3093:408') } },
  args: { children: 'Google', className: 'w-90' },
} satisfies Meta<typeof SocialButton>

export default meta
export const Google: StoryObj<typeof meta> = {}
export const Desabilitado: StoryObj<typeof meta> = { args: { disabled: true } }
