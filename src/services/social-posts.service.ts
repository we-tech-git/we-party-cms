import { axiosInstance } from '@/lib/axios'
import type { SocialPostDto, SocialPostStatus } from '@/types/social-posts.types'

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

/** POST /admin/social-posts/{id}/approve — só muda o status; não publica no Instagram. */
export async function approveSocialPost(id: string): Promise<SocialPostDto> {
  const { data } = await axiosInstance.post<SocialPostDto>(`/admin/social-posts/${id}/approve`)
  return data
}

/** POST /admin/social-posts/{id}/reject — motivo obrigatório. */
export async function rejectSocialPost(id: string, reason: string): Promise<SocialPostDto> {
  const { data } = await axiosInstance.post<SocialPostDto>(`/admin/social-posts/${id}/reject`, { reason })
  return data
}
