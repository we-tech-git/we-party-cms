import { useQuery } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { getEventFunnel } from '@/services/events.service'

/** Funil de desempenho de um evento. Sem retry em 403/404 (sem acesso / inexistente). */
export function useEventFunnel(id: string | undefined) {
  return useQuery({
    queryKey: ['event-funnel', id],
    queryFn: () => getEventFunnel(id as string),
    enabled: !!id,
    staleTime: 30_000,
    retry: (failureCount, error) => {
      const status = isAxiosError(error) ? error.response?.status : undefined
      if (status === 403 || status === 404) return false
      return failureCount < 3
    },
  })
}
