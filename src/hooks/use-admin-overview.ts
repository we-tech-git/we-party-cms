import { useQuery } from '@tanstack/react-query'
import { getAdminStats, getPlatformActivities } from '@/services/admin.service'

/** Platform totals shown on the control panel stat cards. */
export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: getAdminStats,
    staleTime: 60_000,
  })
}

/** Platform-wide audit feed (all users' actions). */
export function usePlatformActivities(limit = 20) {
  return useQuery({
    queryKey: ['admin', 'activities', limit],
    queryFn: () => getPlatformActivities(limit),
    staleTime: 30_000,
  })
}
