import { useMutation } from '@tanstack/react-query'
import { createEvent, uploadEventImages, createEventFaq } from '@/services/events.service'
import type { CreateEventPayload } from '@/types/events.types'

export function useCreateEvent() {
  return useMutation({
    mutationFn: async ({ payload, photos }: { payload: CreateEventPayload; photos: File[] }) => {
      // 1. Create the event (faq is NOT part of the create DTO).
      const created = await createEvent(payload)
      // 2. Attach photos via the dedicated image endpoint.
      if (photos.length > 0) {
        await uploadEventImages(created.id, photos)
      }
      // 3. Create each FAQ via the dedicated endpoint.
      for (const faq of payload.faq) {
        await createEventFaq(created.id, faq)
      }
      return created
    },
  })
}
