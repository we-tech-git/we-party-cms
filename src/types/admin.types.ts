/** Mirrors GET /admin/stats. */
export interface AdminStats {
  totalUsers: number
  blockedUsers: number
  totalEvents: number
  publishedEvents: number
  pendingActions: number
  /** null while there is no reports/moderation module — render "unavailable", not 0. */
  openReports: number | null
}

export const PLATFORM_ACTIVITY_TYPES = [
  'comment',
  'like',
  'attendance',
  'share',
  'event_created',
  'user_signup',
  'follow',
] as const

export type PlatformActivityType = (typeof PLATFORM_ACTIVITY_TYPES)[number]

/** Mirrors an item of GET /admin/activities. */
export interface PlatformActivity {
  type: PlatformActivityType
  id: string
  data: string | null
  createdAt: string
  actor: { id: string; name: string; profileImage: string | null }
  target: { id: string | null; label: string | null; kind: 'event' | 'user' | 'none' }
}

export interface PlatformActivitiesPage {
  items: PlatformActivity[]
  total: number
  offset: number
  limit: number
}
