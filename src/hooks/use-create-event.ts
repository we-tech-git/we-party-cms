import { useMutation } from '@tanstack/react-query'
import { createEvent, createEventWithImages } from '@/services/events.service'
import type { CreateEventPayload } from '@/types/events.types'

export function useCreateEvent() {
  return useMutation({
    mutationFn: ({ payload, photos }: { payload: CreateEventPayload; photos: File[] }) =>
      photos.length > 0 ? createEventWithImages(payload, photos) : createEvent(payload),
  })
}
