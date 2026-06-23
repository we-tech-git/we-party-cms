import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getAdminInterests,
  createInterest,
  updateInterest,
  deleteInterest,
} from '@/services/interests.service'
import type { UpdateInterestPayload } from '@/types/events.types'

const KEY = ['admin', 'interests'] as const

export function useAdminInterests() {
  return useQuery({
    queryKey: KEY,
    queryFn: getAdminInterests,
    staleTime: 60_000,
  })
}

export function useInterestMutations() {
  const qc = useQueryClient()
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: KEY })
    qc.invalidateQueries({ queryKey: ['interests'] })
  }

  const create = useMutation({
    mutationFn: (payload: { name: string; description?: string }) => createInterest(payload),
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateInterestPayload }) => updateInterest(id, payload),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteInterest(id),
    onSuccess: invalidate,
  })

  return { create, update, remove }
}
