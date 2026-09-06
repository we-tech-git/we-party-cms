import { axiosInstance } from '@/lib/axios'
import type { InterestDto, AdminInterestDto, UpdateInterestPayload, InterestDetailsResponse } from '@/types/events.types'

/** Unwrap the `{ data }` envelope the API uses, tolerating a bare array too. */
function unwrap<T>(payload: { data?: T } | T): T {
  return (payload as { data?: T })?.data ?? (payload as T)
}

export async function getInterests(): Promise<InterestDto[]> {
  const { data } = await axiosInstance.get<{ data: InterestDto[] }>('/interest')
  return data.data
}

export async function suggestInterest(name: string): Promise<InterestDto> {
  const { data } = await axiosInstance.post<{ data: InterestDto }>('/interest', { name })
  return data.data
}

/* ----------------------------------------------------------------- admin --- */

/** GET /interest — full list for moderation (id, name, description, status…). */
export async function getAdminInterests(): Promise<AdminInterestDto[]> {
  const { data } = await axiosInstance.get<{ data: AdminInterestDto[] } | AdminInterestDto[]>('/interest')
  return unwrap<AdminInterestDto[]>(data) ?? []
}

/** POST /interest — create a new interest. */
export async function createInterest(payload: { name: string; description?: string }): Promise<AdminInterestDto> {
  const { data } = await axiosInstance.post<{ data: AdminInterestDto } | AdminInterestDto>('/interest', payload)
  return unwrap<AdminInterestDto>(data)
}

/** PATCH /interest/{id} — update name/description and/or moderation status. */
export async function updateInterest(id: string, payload: UpdateInterestPayload): Promise<AdminInterestDto> {
  const { data } = await axiosInstance.patch<{ data: AdminInterestDto } | AdminInterestDto>(`/interest/${id}`, payload)
  return unwrap<AdminInterestDto>(data)
}

/** DELETE /interest/{id}. */
export async function deleteInterest(id: string): Promise<void> {
  await axiosInstance.delete(`/interest/${id}`)
}

/** GET /interest/{id} — full details with users and events. */
export async function getInterestDetail(id: string): Promise<InterestDetailsResponse> {
  const { data } = await axiosInstance.get<{ data: InterestDetailsResponse } | InterestDetailsResponse>(`/interest/${id}`)
  return unwrap<InterestDetailsResponse>(data)
}
