import { axiosInstance } from '@/lib/axios'
import type { CreateEventPayload, ProducerDashboardResponse } from '@/types/events.types'

export async function getMyDashboard(refresh?: boolean): Promise<ProducerDashboardResponse> {
  const params = refresh ? { refresh: true } : {}
  const { data } = await axiosInstance.get<ProducerDashboardResponse>('/events/my-dashboard', { params })
  return data
}

export async function createEvent(payload: CreateEventPayload): Promise<{ id: string }> {
  const { data } = await axiosInstance.post<{ id: string }>('/events', payload)
  return data
}

export async function createEventWithImages(payload: CreateEventPayload, photo: File): Promise<{ id: string }> {
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
  form.append('photos', photo)
  const { data } = await axiosInstance.post<{ id: string }>('/events/with-images', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}
