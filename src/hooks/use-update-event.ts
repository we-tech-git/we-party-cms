import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  updateEvent,
  uploadEventImages,
  getEventFaqs,
  createEventFaq,
  deleteEventFaq,
} from '@/services/events.service'
import { buildUpdatePayload, type CreateEventForm } from '@/app/cms/producer/new-event/_schema'

type UpdateEventArgs = {
  eventId: string
  form: CreateEventForm
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ eventId, form }: UpdateEventArgs) => {
      const payload = buildUpdatePayload(form)

      // 1. Update the event fields. `photos` carries the kept URLs so removals stick.
      await updateEvent(eventId, { ...payload, photos: form.existingPhotoUrls })

      // 2. Attach any new photos.
      if (form.photos.length > 0) {
        await uploadEventImages(eventId, form.photos)
      }

      // 3. Sync FAQs via the dedicated endpoints: delete the existing ones, recreate from the form.
      const existing = await getEventFaqs(eventId)
      await Promise.all(existing.map((f) => deleteEventFaq(eventId, f.id)))
      for (const faq of payload.faq) {
        await createEventFaq(eventId, faq)
      }
    },
    onSuccess: (_data, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['my-events'] })
      queryClient.invalidateQueries({ queryKey: ['event', eventId] })
    },
  })
}
