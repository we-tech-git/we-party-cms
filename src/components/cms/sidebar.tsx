'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'
import { cn } from '@/lib/utils'

const adminLinks = [
  { href: '/cms/home', label: 'Dashboard' },
  { href: '/cms/admin/users', label: 'Usuários' },
  { href: '/cms/admin/interests', label: 'Interesses' },
  { href: '/cms/admin/feedbacks', label: 'Feedbacks' },
  { href: '/cms/admin/control-panel', label: 'Painel de controle' },
]

const producerLinks = [
  { href: '/cms/producer/my-events', label: 'Meus eventos' },
  { href: '/cms/producer/new-event', label: 'Criar evento' },
]

export function CmsSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, hasAnyRole } = useAuthStore()

  function handleLogout() {
    logout()
    router.push('/login')
  }

  const isAdmin = hasAnyRole(['ADMIN', 'admin'])

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-gray-100 px-5">
        <span
          className="text-2xl font-extrabold uppercase"
          style={{
            fontFamily: "'Baloo Thambi 2', cursive",
            background: 'linear-gradient(to right, #FFC947, #F978A3)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          WE PARTY
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {/* Links do produtor — sempre visíveis */}
        <SectionLabel label="Produtor" />
        {producerLinks.map((link) => (
          <NavLink key={link.href} href={link.href} label={link.label} active={pathname === link.href} />
        ))}

        {/* Links de admin — só para ADMIN */}
        {isAdmin && (
          <>
            <SectionLabel label="Administração" className="mt-4" />
            {adminLinks.map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} active={pathname === link.href} />
            ))}
          </>
        )}
      </nav>

      {/* Footer com dados do usuário */}
      <div className="border-t border-gray-100 p-4">
        {user && (
          <div className="mb-3 text-sm">
            <p className="font-medium text-gray-800 truncate">{user.name}</p>
            <p className="text-gray-500 truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          Sair
        </button>
      </div>
    </aside>
  )
}

function SectionLabel({ label, className }: { label: string; className?: string }) {
  return (
    <p className={cn('px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-gray-400', className)}>
      {label}
    </p>
  )
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-gradient-to-r from-[#FFC947]/20 to-[#F978A3]/20 text-[#F978A3]'
          : 'text-gray-600 hover:bg-gray-100',
      )}
    >
      {label}
    </Link>
  )
}
