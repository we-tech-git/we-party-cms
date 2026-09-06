import { axiosInstance } from '@/lib/axios'
import type { ReportsResponse, ReportDto } from '@/types/reports.types'

function unwrap<T>(payload: { data?: T } | T): T {
  return (payload as { data?: T })?.data ?? (payload as T)
}

export async function getAdminReports(params: {
  status?: string
  type?: string
  limit?: number
  offset?: number
}): Promise<ReportsResponse> {
  const { data } = await axiosInstance.get<{ success: boolean; data: ReportDto[]; total: number; limit: number; offset: number }>(
    '/reports',
    { params },
  )
  return { data: data.data ?? [], total: data.total, limit: data.limit, offset: data.offset }
}

export async function updateReportStatus(
  id: string,
  status: 'ACCEPTED' | 'REJECTED',
): Promise<ReportDto> {
  const { data } = await axiosInstance.patch<{ data: ReportDto } | ReportDto>(`/reports/${id}`, { status })
  return unwrap<ReportDto>(data)
}