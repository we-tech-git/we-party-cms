/** Espelha AdminPlatformUpdateResponseDto do we-party-social-backend. */

export type PlatformUpdateWorkflowStatus = 'DRAFT' | 'PUBLISHED'
export type PlatformUpdateCopyStatus = 'PENDING_AI' | 'READY'
export type PlatformUpdateLifecycle = 'RELEASED' | 'UPCOMING'
export type PlatformUpdateCategory = 'FEATURE' | 'IMPROVEMENT' | 'FIX'
export type PlatformUpdateOrigin = 'MANUAL' | 'GITHUB_PR'

export interface AdminPlatformUpdate {
  id: string
  status: PlatformUpdateWorkflowStatus
  copyStatus: PlatformUpdateCopyStatus
  lifecycle: PlatformUpdateLifecycle
  category: PlatformUpdateCategory
  title: string
  description: string
  tag: string | null
  badge: string | null
  version: string | null
  actionLabel: string | null
  actionPath: string | null
  highlights: string[]
  releasedAt: string | null
  expectedAt: string | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  origin: PlatformUpdateOrigin
  sourceRepo: string | null
  sourcePrNumber: number | null
  sourcePrUrl: string | null
  sourceCommitShas: string[]
  reviewedById: string | null
}

/** PATCH /admin/updates/:id — todos os campos opcionais. */
export interface UpdatePlatformUpdatePayload {
  category?: PlatformUpdateCategory
  lifecycle?: PlatformUpdateLifecycle
  title?: string
  description?: string
  tag?: string
  badge?: string
  version?: string
  actionLabel?: string
  actionPath?: string
  highlights?: string[]
  releasedAt?: string
  expectedAt?: string
}

/** POST /admin/updates — criação manual. */
export interface CreatePlatformUpdatePayload {
  category: PlatformUpdateCategory
  lifecycle?: PlatformUpdateLifecycle
  title: string
  description: string
  tag?: string
  badge?: string
  version?: string
  actionLabel?: string
  actionPath?: string
  highlights?: string[]
  releasedAt?: string
  expectedAt?: string
}

/** POST /admin/updates/:id/publish */
export interface PublishPlatformUpdatePayload {
  version?: string
}
