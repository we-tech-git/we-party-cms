import { axiosInstance } from '@/lib/axios'
import type { ReportDto, ReportsQuery, ReportsResponse, ReportStatus } from '@/types/reports.types'

/** GET /reports — lista paginada para moderação (admin only). */
export async function getReports(query: ReportsQuery = {}): Promise<ReportsResponse> {
  const { data } = await axiosInstance.get<ReportsResponse>('/reports', {
    params: {
      status: query.status,
      type: query.type,
      limit: query.limit,
      offset: query.offset,
    },
  })
  return data
}

/** PATCH /reports/{id} — aceita ou rejeita uma denúncia (admin only). */
export async function updateReportStatus(id: string, status: ReportStatus): Promise<ReportDto> {
  const { data } = await axiosInstance.patch<{ data: ReportDto }>(`/reports/${id}`, { status })
  return data.data
}
