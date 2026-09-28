import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  approveSocialPost,
  getSocialPosts,
  rejectSocialPost,
} from '@/services/social-posts.service'
import type { SocialPostStatus } from '@/types/social-posts.types'

const LIST_KEY = ['admin', 'social-posts', 'list'] as const

/** GET /admin/social-posts — a fila de prévia gerada pelo squad weparty-mkt-content. */
export function useAdminSocialPosts(status?: SocialPostStatus) {
  return useQuery({
    queryKey: [...LIST_KEY, status ?? 'ALL'],
    queryFn: () => getSocialPosts(status),
    staleTime: 15_000,
  })
}

export function useSocialPostMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'social-posts'] })

  const approve = useMutation({
    mutationFn: (id: string) => approveSocialPost(id),
    onSuccess: invalidate,
  })

  const reject = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectSocialPost(id, reason),
    onSuccess: invalidate,
  })

  return { approve, reject }
}
