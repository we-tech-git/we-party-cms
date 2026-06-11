import type { Metadata } from 'next'
import { Bricolage_Grotesque, Poppins } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/providers/query-provider'
import { AuthHydration } from '@/providers/auth-hydration'

// Poppins: fonte corpo do sistema WeParty
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

// Bricolage Grotesque: titulares e valores numéricos grandes
const bricolage = Bricolage_Grotesque({
  variable: '--font-bricolage',
  subsets: ['latin'],
  weight: ['500', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'WeParty CMS',
  description: 'Backoffice para produtores e administradores do WeParty',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // poppins.className aplica font-family diretamente (sem CSS variable chain)
    // bricolage.variable expõe --font-bricolage para uso em style={{}}
    <html lang="pt-BR" className={`${poppins.className} ${bricolage.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <AuthHydration />
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}
