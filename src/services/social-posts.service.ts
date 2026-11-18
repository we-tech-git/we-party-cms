import { axiosInstance } from '@/lib/axios'
import type { PublishSocialPostResponse, SocialPostDto, SocialPostStatus } from '@/types/social-posts.types'

/* Todos os endpoints abaixo são admin-only (GET/POST /admin/social-posts*, RoleGuard(['admin'])). */

/** GET /admin/social-posts — fila de aprovação, mais recente primeiro. */
export async function getSocialPosts(status?: SocialPostStatus): Promise<SocialPostDto[]> {
  const { data } = await axiosInstance.get<SocialPostDto[]>('/admin/social-posts', {
    params: { status },
  })
  return data
}

/** GET /admin/social-posts/{id} — prévia completa de um post. */
export async function getSocialPostById(id: string): Promise<SocialPostDto> {
  const { data } = await axiosInstance.get<SocialPostDto>(`/admin/social-posts/${id}`)
  return data
}

/** POST /admin/social-posts/{id}/approve — aprova; o backend publica em seguida (Instagram, X e Facebook). */
export async function approveSocialPost(id: string): Promise<SocialPostDto> {
  const { data } = await axiosInstance.post<SocialPostDto>(`/admin/social-posts/${id}/approve`)
  return data
}

/** POST /admin/social-posts/{id}/reject — motivo obrigatório. */
export async function rejectSocialPost(id: string, reason: string): Promise<SocialPostDto> {
  const { data } = await axiosInstance.post<SocialPostDto>(`/admin/social-posts/${id}/reject`, { reason })
  return data
}

/**
 * POST /admin/social-posts/{id}/publish — nova tentativa de publicação de um post APPROVED.
 * O status só vira PUBLISHED quando saiu em todas as redes; senão segue APPROVED com o motivo em publishError.
 */
export async function publishSocialPost(id: string): Promise<PublishSocialPostResponse> {
  const { data } = await axiosInstance.post<PublishSocialPostResponse>(`/admin/social-posts/${id}/publish`)
  return data
}
