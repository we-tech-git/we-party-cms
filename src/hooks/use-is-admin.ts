'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth.store'
import { getAdminUserDetails } from '@/services/users.service'
import { collectRoleStrings, rolesIncludeAdmin } from '@/lib/roles'

/**
 * Determina se o usuário logado é admin. Confia direto no usuário persistido
 * (login) apenas quando ele já indica admin; caso contrário, confirma no
 * servidor via GET /users/{id} — o objeto local sempre carrega algum campo
 * genérico (ex.: `type: "user"`), então "não achei papel nenhum" nunca seria
 * um sinal confiável de que o snapshot está completo/atualizado. Isso evita
 * que uma promoção a admin (via assign-role) só apareça depois de um novo login.
 *
 * `isLoading` indica que ainda estamos resolvendo via fetch — quem usa isso
 * (ex.: o guard) deve aguardar antes de decidir bloquear o acesso.
 */
export function useIsAdmin(): { isAdmin: boolean; isLoading: boolean } {
  const user = useAuthStore((s) => s.user)
  const localAdmin = rolesIncludeAdmin(collectRoleStrings(user))

  // Só pula a confirmação no servidor quando o local já diz que é admin.
  const needFetch = !!user?.id && !localAdmin

  const { data, isLoading } = useQuery({
    queryKey: ['self-user', user?.id],
    queryFn: () => getAdminUserDetails(user!.id),
    enabled: needFetch,
    staleTime: 300_000,
  })

  const fetchedAdmin = rolesIncludeAdmin(collectRoleStrings(data))

  return { isAdmin: localAdmin || fetchedAdmin, isLoading: needFetch && isLoading }
}
