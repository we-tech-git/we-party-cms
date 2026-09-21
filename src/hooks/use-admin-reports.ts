import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getReports, updateReportStatus } from '@/services/reports.service'
import type { ReportStatus } from '@/types/reports.types'

const LIST_KEY = ['admin', 'reports', 'list'] as const

/** GET /reports — a página busca `limit: 100` (máximo aceito pela API) por
 * status; a UI mostra `total` vs. o que veio pra deixar claro quando há mais
 * do que cabe numa página, em vez de paginar de verdade. */
export function useAdminReports(status?: ReportStatus) {
  return useQuery({
    queryKey: [...LIST_KEY, status ?? 'ALL'],
    queryFn: () => getReports({ status, limit: 100, offset: 0 }),
    staleTime: 15_000,
  })
}

export function useReportMutations() {
  const qc = useQueryClient()
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin', 'reports'] })
    // `openReports` no painel de controle conta PENDING — muda junto.
    qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
  }

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ReportStatus }) => updateReportStatus(id, status),
    onSuccess: invalidate,
  })

  return { updateStatus }
}
