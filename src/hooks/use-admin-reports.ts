import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getAdminReports, updateReportStatus } from '@/services/reports.service'

const KEY = ['admin', 'reports'] as const

export function useAdminReports(params: { status?: string; type?: string; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: [...KEY, params],
    queryFn: () => getAdminReports(params),
    staleTime: 30_000,
  })
}

export function useReportMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: KEY })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACCEPTED' | 'REJECTED' }) => updateReportStatus(id, status),
    onSuccess: invalidate,
  })

  return { updateStatus }
}