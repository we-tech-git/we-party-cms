import type { Preview } from '@storybook/nextjs-vite'
import { I18nProvider } from '../src/i18n/context'
import '../src/app/globals.css'

/**
 * Preview do Storybook do CMS.
 * - Importa o mesmo globals.css do app (tokens do visual B + Tailwind 4).
 * - Envolve cada story no I18nProvider (os componentes usam `useI18n`).
 * - Fundo #FFF6F8 = `--background` do app, para o contraste bater com o Figma.
 */
const preview: Preview = {
  decorators: [
    (Story) => (
      <I18nProvider>
        <div className="font-sans text-ink">
          <Story />
        </div>
      </I18nProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
    backgrounds: {
      options: {
        app: { name: 'App (#FFF6F8)', value: '#FFF6F8' },
        white: { name: 'Branco', value: '#FFFFFF' },
        ink: { name: 'Tinta (#221A3D)', value: '#221A3D' },
      },
    },
    a11y: { test: 'todo' },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
  initialGlobals: { backgrounds: { value: 'app' } },
}

export default preview
