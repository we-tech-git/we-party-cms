import { axiosInstance } from '@/lib/axios'
import type { ProducerDashboardResponse } from '@/types/events.types'

export async function getMyDashboard(refresh?: boolean): Promise<ProducerDashboardResponse> {
  const params = refresh ? { refresh: true } : {}
  const { data } = await axiosInstance.get<ProducerDashboardResponse>('/events/my-dashboard', { params })
  return data
}
