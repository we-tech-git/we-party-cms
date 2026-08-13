import { axiosInstance } from '@/lib/axios'
import {
  PLATFORM_ACTIVITY_TYPES,
  type AdminStats,
  type PlatformActivitiesPage,
  type PlatformActivity,
} from '@/types/admin.types'

/* Both endpoints are admin-only (GET /admin/*, RoleGuard(['admin'])). */

/** GET /admin/stats — platform totals for the control panel. */
export async function getAdminStats(): Promise<AdminStats> {
  const { data } = await axiosInstance.get<AdminStats>('/admin/stats')
  return data
}

const KNOWN_TYPES = new Set<string>(PLATFORM_ACTIVITY_TYPES)

/** GET /admin/activities — platform-wide audit feed, newest first. */
export async function getPlatformActivities(
  limit = 20,
  offset = 0,
): Promise<PlatformActivitiesPage> {
  const { data } = await axiosInstance.get<PlatformActivitiesPage>('/admin/activities', {
    params: { limit, offset },
  })

  // Drop unknown types so a new backend activity kind can't break the render
  // before the frontend knows how to display it.
  const items = Array.isArray(data?.items)
    ? data.items.filter((a): a is PlatformActivity => !!a && KNOWN_TYPES.has(a.type))
    : []

  return { items, total: data?.total ?? items.length, offset: data?.offset ?? offset, limit: data?.limit ?? limit }
}
