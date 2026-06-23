'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth.store'
import { getAdminUserDetails } from '@/services/users.service'
import { collectRoleStrings, rolesIncludeAdmin } from '@/lib/roles'

/**
 * Determina se o usuário logado é admin. Primeiro tenta o usuário persistido
 * (login); se ele não trouxer nenhuma informação de papel, busca o próprio
 * registro via GET /users/{id} como rede de segurança.
 *
 * `isLoading` indica que ainda estamos resolvendo via fetch — quem usa isso
 * (ex.: o guard) deve aguardar antes de decidir bloquear o acesso.
 */
export function useIsAdmin(): { isAdmin: boolean; isLoading: boolean } {
  const user = useAuthStore((s) => s.user)
  const localRoles = collectRoleStrings(user)
  const localAdmin = rolesIncludeAdmin(localRoles)

  // Só busca quando há um usuário logado e o login não trouxe papel algum.
  const needFetch = !!user?.id && localRoles.length === 0

  const { data, isLoading } = useQuery({
    queryKey: ['self-user', user?.id],
    queryFn: () => getAdminUserDetails(user!.id),
    enabled: needFetch,
    staleTime: 300_000,
  })

  const fetchedAdmin = rolesIncludeAdmin(collectRoleStrings(data))

  return { isAdmin: localAdmin || fetchedAdmin, isLoading: needFetch && isLoading }
}
