import { axiosInstance } from '@/lib/axios'
import type {
  AdminPlatformUpdate,
  CreatePlatformUpdatePayload,
  PlatformUpdateWorkflowStatus,
  PublishPlatformUpdatePayload,
  UpdatePlatformUpdatePayload,
} from '@/types/platform-updates.types'

/* Todas as rotas abaixo são admin-only (RoleGuard(['admin'])). */

export async function getAdminPlatformUpdates (
  status?: PlatformUpdateWorkflowStatus,
): Promise<AdminPlatformUpdate[]> {
  const { data } = await axiosInstance.get<AdminPlatformUpdate[]>('/admin/updates', {
    params: status ? { status } : undefined,
  })
  return data ?? []
}

export async function getAdminPlatformUpdate (id: string): Promise<AdminPlatformUpdate> {
  const { data } = await axiosInstance.get<AdminPlatformUpdate>(`/admin/updates/${id}`)
  return data
}

export async function createPlatformUpdate (
  payload: CreatePlatformUpdatePayload,
): Promise<AdminPlatformUpdate> {
  const { data } = await axiosInstance.post<AdminPlatformUpdate>('/admin/updates', payload)
  return data
}

export async function updatePlatformUpdate (
  id: string,
  payload: UpdatePlatformUpdatePayload,
): Promise<AdminPlatformUpdate> {
  const { data } = await axiosInstance.patch<AdminPlatformUpdate>(`/admin/updates/${id}`, payload)
  return data
}

export async function publishPlatformUpdate (
  id: string,
  payload: PublishPlatformUpdatePayload = {},
): Promise<AdminPlatformUpdate> {
  const { data } = await axiosInstance.post<AdminPlatformUpdate>(`/admin/updates/${id}/publish`, payload)
  return data
}

export async function deletePlatformUpdate (id: string): Promise<void> {
  await axiosInstance.delete(`/admin/updates/${id}`)
}

/** Reroda o gerador de copy (opencode) sob demanda — retry ou novidade manual. */
export async function generatePlatformUpdateCopy (id: string): Promise<AdminPlatformUpdate> {
  const { data } = await axiosInstance.post<AdminPlatformUpdate>(`/admin/updates/${id}/generate-copy`)
  return data
}
