'use client'

import { BrandPanel } from '@/components/cms/brand-panel'
import { Logo } from '@/components/cms/logo'
import { useI18n } from '@/i18n/context'

/**
 * Casca das telas de acesso (Figma: CMS › Login). Desktop: painel da marca à esquerda (50%) e formulário à direita.
 * Mobile: faixa escura no topo (logo + título) e formulário abaixo.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  const { t } = useI18n()
  const bullets: [string, string, string] = [
    t('login.brand.bullet1'),
    t('login.brand.bullet2'),
    t('login.brand.bullet3'),
  ]

  return (
    <div className="flex min-h-screen flex-col bg-wp-bg font-sans md:flex-row">
      {/* Mobile: faixa da marca */}
      <div className="flex flex-col gap-3 rounded-b-[28px] bg-ink px-6 pt-7 pb-6 md:hidden">
        <Logo className="text-[32px] leading-none" />
        <p className="text-xl leading-snug font-bold text-white">
          {t('login.brand.title')}{' '}
          <span className="bg-(image:--wp-gradient) bg-clip-text text-transparent">{t('login.brand.highlight')}</span>
        </p>
      </div>

      {/* Desktop: painel da marca */}
      <BrandPanel
        className="hidden md:flex md:w-1/2"
        title={t('login.brand.title')}
        highlight={t('login.brand.highlight')}
        bullets={bullets}
      />

      {/* Formulário */}
      <main className="flex flex-1 items-center justify-center px-6 py-8 md:w-1/2 md:px-8">
        <div className="w-full max-w-[400px]">{children}</div>
      </main>
    </div>
  )
}
