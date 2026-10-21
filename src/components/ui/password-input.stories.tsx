import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'
import { PasswordInput } from '@/components/ui/password-input'
import { figmaNode } from '@/lib/figma'

const meta = {
  title: 'UI/PasswordInput',
  component: PasswordInput,
  tags: ['autodocs'],
  parameters: { design: { type: 'figma', url: figmaNode('3093:367') } },
  args: { placeholder: 'Senha', defaultValue: 'segredo123', className: 'w-90' },
} satisfies Meta<typeof PasswordInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Clica no olho: o campo vira texto e o botão informa `aria-pressed`. */
export const AlternaVisibilidade: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement)
    const input = c.getByPlaceholderText('Senha')
    await expect(input).toHaveAttribute('type', 'password')
    await userEvent.click(c.getByTestId('toggle-password'))
    await expect(input).toHaveAttribute('type', 'text')
    await expect(c.getByTestId('toggle-password')).toHaveAttribute('aria-pressed', 'true')
  },
}
