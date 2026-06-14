'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteEventComment } from '@/services/events.service'
import { useEventComments } from '@/hooks/use-event-comments'
import type { CommentDto } from '@/types/events.types'

type CommentDrawerProps = {
  eventId: string | null
  eventTitle: string
  onClose: () => void
}

export function CommentDrawer({ eventId, eventTitle, onClose }: CommentDrawerProps) {
  const queryClient = useQueryClient()
  const { data, isLoading } = useEventComments(eventId)
  const open = !!eventId

  const deleteMutation = useMutation({
    mutationFn: ({ commentId }: { commentId: string }) =>
      deleteEventComment(eventId!, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-comments', eventId] })
      queryClient.invalidateQueries({ queryKey: ['my-events'] })
    },
  })

  const comments: CommentDto[] = data?.comments ?? []

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[80] transition-opacity duration-[250ms]"
        style={{
          background: 'rgba(34,26,61,.4)',
          backdropFilter: 'blur(2px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
        }}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className="fixed top-0 right-0 h-full z-[90] flex flex-col"
        style={{
          width: '440px',
          maxWidth: '92vw',
          background: '#FBF7FA',
          boxShadow: '-20px 0 60px -20px rgba(34,26,61,.4)',
          transform: open ? 'none' : 'translateX(100%)',
          transition: 'transform .28s cubic-bezier(.3,.7,.3,1)',
        }}
      >
        {/* Header */}
        <div className="relative px-[22px] py-5 bg-white" style={{ borderBottom: '1px solid var(--line-2)' }}>
          <p className="text-[11px] font-extrabold tracking-[.1em] uppercase" style={{ color: 'var(--pink)' }}>
            Gerenciar comentários
          </p>
          <h3 className="font-extrabold text-[20px] mt-0.5" style={{ fontFamily: 'var(--font-bricolage)' }}>
            {eventTitle}
          </h3>
          <button
            className="absolute top-[18px] right-[18px] w-[38px] h-[38px] rounded-[11px] flex items-center justify-center bg-white"
            style={{ border: '1px solid var(--line-2)' }}
            onClick={onClose}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M6 6l12 12M18 6L6 18"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto px-[22px] py-[14px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-32 text-[14px] font-semibold" style={{ color: 'var(--wp-muted)' }}>
              Carregando comentários…
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center gap-2">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--wp-muted)" strokeWidth="1.5">
                <path d="M21 15a4 4 0 01-4 4H8l-5 4V7a4 4 0 014-4h10a4 4 0 014 4z"/>
              </svg>
              <p className="font-bold text-[14px]" style={{ color: 'var(--wp-muted)' }}>Nenhum comentário ainda</p>
            </div>
          ) : (
            comments.map(comment => (
              <div
                key={comment.id}
                className="bg-white rounded-[16px] p-[14px] mb-3"
                style={{ border: '1px solid var(--line-2)' }}
              >
                <div className="flex items-center gap-[10px]">
                  <div
                    className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center text-white font-extrabold flex-none text-[15px]"
                    style={{ background: 'linear-gradient(135deg,#7b5cff,#c54bff)' }}
                  >
                    {comment.user.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <b className="text-[14px]">{comment.user.name}</b>
                    <div className="text-[12px] font-semibold" style={{ color: 'var(--wp-muted)' }}>
                      {new Date(comment.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                <p className="font-medium text-[14px] my-[9px]" style={{ color: 'var(--ink-soft)' }}>
                  {comment.content}
                </p>
                <div className="flex gap-2">
                  <button
                    className="flex items-center gap-[6px] font-extrabold text-[12.5px] px-[11px] py-[7px] rounded-[10px] transition-colors hover:bg-[#FFF0F3]"
                    style={{ border: '1.5px solid var(--line)', color: 'var(--red, #E0476B)' }}
                    disabled={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate({ commentId: comment.id })}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
                    </svg>
                    Excluir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  )
}
