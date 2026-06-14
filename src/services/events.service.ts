import { axiosInstance } from '@/lib/axios'
import type {
  CreateEventPayload,
  ProducerDashboardResponse,
  MyEventsResponse,
  EventDto,
  CommentsResponse,
} from '@/types/events.types'

export async function getMyDashboard(refresh?: boolean): Promise<ProducerDashboardResponse> {
  const params = refresh ? { refresh: true } : {}
  const { data } = await axiosInstance.get<ProducerDashboardResponse>('/events/my-dashboard', { params })
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

export async function getEventComments(eventId: string, page = 1, limit = 50): Promise<CommentsResponse> {
  const { data } = await axiosInstance.get<CommentsResponse>(`/events/${eventId}/comments`, { params: { page, limit } })
  return data
}

export async function deleteEventComment(eventId: string, commentId: string): Promise<void> {
  await axiosInstance.delete(`/events/${eventId}/comments/${commentId}`)
}

export async function createEvent(payload: CreateEventPayload): Promise<{ id: string }> {
  const { data } = await axiosInstance.post<{ id: string }>('/events', payload)
  return data
}

export async function createEventWithImages(payload: CreateEventPayload, photos: File[]): Promise<{ id: string }> {
  const form = new FormData()
  form.append('title', payload.title)
  form.append('description', payload.description)
  form.append('startDate', payload.startDate)
  form.append('endDate', payload.endDate)
  form.append('location', payload.location)
  form.append('isPublic', String(payload.isPublic))
  form.append('allowComments', String(payload.allowComments))
  form.append('showInMainFeed', 'true')
  form.append('interestIds', JSON.stringify(payload.interestIds))
  form.append('invitedUserIds', '[]')
  form.append('faqs', JSON.stringify(payload.faqs))
  for (const photo of photos) form.append('photos', photo)
  const { data } = await axiosInstance.post<{ id: string }>('/events/with-images', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}
