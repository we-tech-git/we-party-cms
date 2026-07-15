import { axiosInstance } from '@/lib/axios'
import type {
  CreateEventPayload,
  UpdateEventPayload,
  ProducerDashboardResponse,
  MyEventsResponse,
  EventDto,
  EventDetailDto,
  EventFaqDto,
  FaqItem,
  CommentsResponse,
} from '@/types/events.types'

export async function getMyDashboard(refresh?: boolean): Promise<ProducerDashboardResponse> {
  // `recent=true` asks the backend to include the consolidated `recentActivities`
  // feed alongside the usual metrics (ordered most-recent-first, capped at 20).
  const params: Record<string, boolean> = { recent: true }
  if (refresh) params.refresh = true
  const { data } = await axiosInstance.get<ProducerDashboardResponse>('/events/my-dashboard', { params })
  // TEMP DEBUG — remove once recentActivities shape is confirmed against the live API.
  console.warn('[my-dashboard] raw response', data)
  return data
}

export async function getMyEvents(page = 1, limit = 100): Promise<MyEventsResponse> {
  const { data } = await axiosInstance.get<MyEventsResponse>('/events/my-events', { params: { page, limit } })
  return data
}

export async function deleteEvent(id: string): Promise<void> {
  await axiosInstance.delete(`/events/${id}`)
}

export async function patchEvent(id: string, payload: Partial<Pick<EventDto, 'status'>>): Promise<EventDto> {
  const { data } = await axiosInstance.patch<EventDto>(`/events/${id}`, payload)
  return data
}

export async function getEvent(id: string): Promise<EventDetailDto> {
  const { data } = await axiosInstance.get<EventDetailDto>(`/events/${id}`)
  return data
}

/**
 * Full update via PUT /events/{id}. `photos` carries the kept URLs so removals
 * persist. FAQs are NOT sent here — UpdateEventDto has no faq field; they are
 * synced via the dedicated /events/{id}/faq endpoints.
 */
export async function updateEvent(id: string, payload: UpdateEventPayload): Promise<EventDto> {
  const { faq: _faq, ...body } = payload
  void _faq
  const { data } = await axiosInstance.put<EventDto>(`/events/${id}`, body)
  return data
}

/**
 * Uploads new photos to an existing event via PATCH /events/{id}/with-images
 * (multipart field name `photos`). Kept separate from the event payload
 * because the multipart create/update endpoints don't persist inline `faq` —
 * so the event (with its FAQs) is saved as JSON first and images are attached
 * here afterwards.
 */
export async function uploadEventImages(id: string, photos: File[]): Promise<EventDto> {
  const form = new FormData()
  for (const photo of photos) form.append('photos', photo)
  // Override the instance's default `application/json` so the browser can set
  // `multipart/form-data` with the correct boundary — otherwise the files never
  // reach the backend and the event is saved without images.
  const { data } = await axiosInstance.patch<EventDto>(`/events/${id}/with-images`, form, {
    headers: { 'Content-Type': undefined },
  })
  return data
}

export async function getEventComments(eventId: string, page = 1, limit = 50): Promise<CommentsResponse> {
  const { data } = await axiosInstance.get<CommentsResponse>(`/events/${eventId}/comments`, { params: { page, limit } })
  return data
}

export async function deleteEventComment(eventId: string, commentId: string): Promise<void> {
  await axiosInstance.delete(`/events/${eventId}/comments/${commentId}`)
}

export async function createEvent(payload: CreateEventPayload): Promise<{ id: string }> {
  // FAQs are created via the dedicated POST /events/{id}/faq endpoint, so keep
  // them out of the create body to avoid duplicates.
  const { faq: _faq, ...body } = payload
  void _faq
  const { data } = await axiosInstance.post<{ id: string }>('/events', body)
  return data
}

/** Lists an event's FAQs — GET /events/{eventId}/faq. */
export async function getEventFaqs(eventId: string): Promise<EventFaqDto[]> {
  const { data } = await axiosInstance.get<EventFaqDto[]>(`/events/${eventId}/faq`)
  return data
}

/** Creates a single FAQ — POST /events/{eventId}/faq. */
export async function createEventFaq(eventId: string, faq: FaqItem): Promise<EventFaqDto> {
  const { data } = await axiosInstance.post<EventFaqDto>(`/events/${eventId}/faq`, faq)
  return data
}

/** Deletes a single FAQ — DELETE /events/{eventId}/faq/{faqId}. */
export async function deleteEventFaq(eventId: string, faqId: string): Promise<void> {
  await axiosInstance.delete(`/events/${eventId}/faq/${faqId}`)
}
