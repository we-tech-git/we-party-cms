import { useQuery } from '@tanstack/react-query'
import { useRef } from 'react'
import { getMyDashboard } from '@/services/events.service'

export function useProducerDashboard() {
  // Set by `forceRefresh()` right before calling `refetch()` so the next
  // `queryFn` run asks the backend to recalculate instead of serving its
  // own cached aggregates — then cleared so normal refetches stay cheap.
  const forceRefreshRef = useRef(false)

  const query = useQuery({
    queryKey: ['producer-dashboard'],
    queryFn: () => {
      const refresh = forceRefreshRef.current
      forceRefreshRef.current = false
      return getMyDashboard(refresh)
    },
    staleTime: 60_000,
  })

  const forceRefresh = () => {
    forceRefreshRef.current = true
    return query.refetch()
  }

  return { ...query, forceRefresh }
}
