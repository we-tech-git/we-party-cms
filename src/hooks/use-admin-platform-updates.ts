import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createPlatformUpdate,
  deletePlatformUpdate,
  generatePlatformUpdateCopy,
  getAdminPlatformUpdates,
  publishPlatformUpdate,
  updatePlatformUpdate,
} from '@/services/platform-updates.service'
import type {
  CreatePlatformUpdatePayload,
  PlatformUpdateWorkflowStatus,
  PublishPlatformUpdatePayload,
  UpdatePlatformUpdatePayload,
} from '@/types/platform-updates.types'

const KEY = ['admin', 'platform-updates'] as const

export function useAdminPlatformUpdates (status?: PlatformUpdateWorkflowStatus) {
  return useQuery({
    queryKey: [...KEY, status ?? 'all'],
    queryFn: () => getAdminPlatformUpdates(status),
    staleTime: 30_000,
  })
}

export function usePlatformUpdateMutations () {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: KEY })

  const create = useMutation({
    mutationFn: (payload: CreatePlatformUpdatePayload) => createPlatformUpdate(payload),
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string, payload: UpdatePlatformUpdatePayload }) =>
      updatePlatformUpdate(id, payload),
    onSuccess: invalidate,
  })

  const publish = useMutation({
    mutationFn: ({ id, payload }: { id: string, payload?: PublishPlatformUpdatePayload }) =>
      publishPlatformUpdate(id, payload),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id: string) => deletePlatformUpdate(id),
    onSuccess: invalidate,
  })

  const generateCopy = useMutation({
    mutationFn: (id: string) => generatePlatformUpdateCopy(id),
    onSuccess: invalidate,
  })

  return { create, update, publish, remove, generateCopy }
}
