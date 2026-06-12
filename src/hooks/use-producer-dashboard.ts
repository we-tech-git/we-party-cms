import { useQuery } from '@tanstack/react-query'
import { getMyDashboard } from '@/services/events.service'

export function useProducerDashboard(refresh?: boolean) {
  return useQuery({
    queryKey: ['producer-dashboard'],
    queryFn: () => getMyDashboard(refresh),
    staleTime: 300_000,
  })
}
