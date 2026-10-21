import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { figmaNode } from '@/lib/figma'

const meta = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: figmaNode('3022:184') } },
  args: { placeholder: 'E-mail', className: 'w-90' },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Preenchido: Story = { args: { defaultValue: 'pedro@weparty.app' } }
export const Erro: Story = { args: { defaultValue: 'pedro@', 'aria-invalid': true } }
export const Desabilitado: Story = { args: { disabled: true } }
export const ComRotuloEErro: Story = {
  render: () => (
    <Field label="E-mail" htmlFor="e" required error="E-mail inválido" className="w-90">
      <Input id="e" defaultValue="pedro@" aria-invalid />
    </Field>
  ),
}
