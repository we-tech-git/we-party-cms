import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createEventTrackingLink,
  deleteEventTrackingLink,
  getEventTrackingLinks,
} from '@/services/events.service'

const key = (eventId: string) => ['event-tracking-links', eventId] as const

export function useEventTrackingLinks(eventId: string, enabled = true) {
  return useQuery({
    queryKey: key(eventId),
    queryFn: () => getEventTrackingLinks(eventId),
    enabled: enabled && !!eventId,
    staleTime: 30_000,
  })
}

export function useEventTrackingLinkMutations(eventId: string) {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: key(eventId) })

  const create = useMutation({
    mutationFn: (label: string) => createEventTrackingLink(eventId, label),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (linkId: string) => deleteEventTrackingLink(eventId, linkId),
    onSuccess: invalidate,
  })

  return { create, remove }
}
