import { useQuery } from '@tanstack/react-query'
import { getEvent } from '@/services/events.service'

export function useEvent(id: string | undefined) {
  return useQuery({
    queryKey: ['event', id],
    queryFn: () => getEvent(id as string),
    enabled: !!id,
    staleTime: 30_000,
  })
}
