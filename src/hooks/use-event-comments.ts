import { useQuery } from '@tanstack/react-query'
import { getEventComments } from '@/services/events.service'

export function useEventComments(eventId: string | null) {
  return useQuery({
    queryKey: ['event-comments', eventId],
    queryFn: () => getEventComments(eventId!),
    enabled: !!eventId,
  })
}
