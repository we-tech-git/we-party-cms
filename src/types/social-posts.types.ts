export type SocialPostFormat = 'FEED_CAROUSEL' | 'STORY'
export type SocialPostStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED'

/** Mirrors GET /admin/social-posts (and /:id) — SocialPostResponseDto do backend. */
export interface SocialPostDto {
  id: string
  format: SocialPostFormat
  status: SocialPostStatus
  caption: string
  hashtags: string[]
  /** URLs no R2, na ordem de exibição (slide 1, 2, 3... / imagem única do story). */
  mediaUrls: string[]
  eventTitle: string | null
  squadRunId: string | null
  rejectionReason: string | null
  reviewedById: string | null
  reviewedAt: string | null
  createdAt: string
  updatedAt: string
}
