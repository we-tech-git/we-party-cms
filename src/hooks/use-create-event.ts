import { useMutation } from '@tanstack/react-query'
import { createEvent, createEventWithImages } from '@/services/events.service'
import type { CreateEventPayload } from '@/types/events.types'

export function useCreateEvent() {
  return useMutation({
    mutationFn: ({ payload, photo }: { payload: CreateEventPayload; photo: File | null }) =>
      photo ? createEventWithImages(payload, photo) : createEvent(payload),
  })
}
