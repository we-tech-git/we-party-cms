import { useQuery } from '@tanstack/react-query'
import { getInterests } from '@/services/interests.service'

export function useInterests() {
  return useQuery({
    queryKey: ['interests'],
    queryFn: getInterests,
    staleTime: 600_000,
  })
}
