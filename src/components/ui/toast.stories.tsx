import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Toast } from '@/components/ui/toast'
import { figmaNode } from '@/lib/figma'

const meta = {
  title: 'UI/Toast',
  component: Toast,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', design: { type: 'figma', url: figmaNode('3024:178') } },
  decorators: [(Story) => <div className="h-40"><Story /></div>],
  args: { message: 'Login realizado com sucesso!', type: 'success' },
} satisfies Meta<typeof Toast>

export default meta
type Story = StoryObj<typeof meta>
export const Sucesso: Story = {}
export const Erro: Story = { args: { type: 'error', message: 'Credenciais inválidas. Tente novamente.' } }
export const Atencao: Story = { args: { type: 'warning', message: 'E-mail não verificado.' } }
