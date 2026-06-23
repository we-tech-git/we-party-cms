import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getAdminUsers,
  getAdminUserDetails,
  blockUser,
  unblockUser,
  deleteUser,
} from '@/services/users.service'

const KEY = ['admin', 'users'] as const

export function useAdminUsers() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => getAdminUsers(),
    staleTime: 30_000,
  })
}

export function useUserDetails(id: string | null) {
  return useQuery({
    queryKey: ['admin', 'user-details', id],
    queryFn: () => getAdminUserDetails(id as string),
    enabled: !!id,
    staleTime: 30_000,
  })
}

export function useUserBlockMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: KEY })

  const block = useMutation({
    mutationFn: (id: string) => blockUser(id),
    onSuccess: invalidate,
  })
  const unblock = useMutation({
    mutationFn: (id: string) => unblockUser(id),
    onSuccess: invalidate,
  })
  const remove = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: invalidate,
  })

  return { block, unblock, remove }
}
