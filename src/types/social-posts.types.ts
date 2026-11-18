export type SocialPostFormat = 'FEED_CAROUSEL' | 'STORY'
export type SocialPostStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'PUBLISHED'

export interface SocialPostPublication {
  externalId: string
  url: string | null
  publishedAt: string
}

/** Mirrors GET /admin/social-posts (and /:id) — SocialPostResponseDto do backend. */
export interface SocialPostDto {
  id: string
  format: SocialPostFormat
  status: SocialPostStatus
  caption: string
  /** Texto próprio para o X (até 280 caracteres). Sem ele o post não vai pro X. */
  xText: string | null
  hashtags: string[]
  /** URLs no R2, na ordem de exibição (slide 1, 2, 3... / imagem única do story). */
  mediaUrls: string[]
  eventTitle: string | null
  squadRunId: string | null
  rejectionReason: string | null
  reviewedById: string | null
  reviewedAt: string | null
  publishedAt: string | null
  /** Resultado por plataforma, ex.: { INSTAGRAM: { externalId, url, publishedAt } }. */
  publications: Record<string, SocialPostPublication> | null
  /** Quantas vezes o backend tentou publicar este post. */
  publishAttempts: number
  /** Motivo da última tentativa que falhou (post segue APPROVED). `REGISTRO PENDENTE:` = saiu numa rede mas não foi registrado. */
  publishError: string | null
  createdAt: string
  updatedAt: string
}

export type PublishOutcome = 'PUBLISHED' | 'PARTIAL' | 'FAILED' | 'DISABLED' | 'SKIPPED'

/** Mirrors POST /admin/social-posts/{id}/publish — PublishSocialPostResponseDto do backend. */
export interface PublishSocialPostResponse {
  outcome: PublishOutcome
  message: string | null
  post: SocialPostDto
}
