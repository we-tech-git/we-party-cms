import { useQuery } from '@tanstack/react-query'
import { getMyEvents } from '@/services/events.service'

export function useMyEvents(limit = 100) {
  return useQuery({
    queryKey: ['my-events', limit],
    queryFn: () => getMyEvents(1, limit),
    staleTime: 60_000,
  })
}
