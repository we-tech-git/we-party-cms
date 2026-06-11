'use client'

import { useAuthStore } from '@/stores/auth.store'

export default function HomePage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Olá, {user?.name ?? 'usuário'} 👋
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Bem-vindo ao WeParty CMS. Use o menu lateral para navegar.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Papel" value={user?.roles?.join(', ') ?? '—'} />
        <StatCard label="E-mail" value={user?.email ?? '—'} />
        <StatCard label="Username" value={user?.username ?? '—'} />
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
      <p className="mt-1 text-base font-medium text-gray-800 truncate">{value}</p>
    </div>
  )
}
