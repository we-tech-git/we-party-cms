import { axiosInstance } from '@/lib/axios'
import type { InterestDto } from '@/types/events.types'

export async function getInterests(): Promise<InterestDto[]> {
  const { data } = await axiosInstance.get<{ data: InterestDto[] }>('/interest')
  return data.data
}

export async function suggestInterest(name: string): Promise<InterestDto> {
  const { data } = await axiosInstance.post<{ data: InterestDto }>('/interest', { name })
  return data.data
}
