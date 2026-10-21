'use client'

import { useEffect, useRef } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { IconTile } from '@/components/cms/icon-tile'
import { useI18n } from '@/i18n/context'

type DeleteModalProps = {
  eventName: string
  isPending: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** Diálogo de exclusão (Figma: Dialog › Tom=Perigo). Esc fecha; o foco inicia em "Cancelar". */
export function DeleteModal({ eventName, isPending, onConfirm, onCancel }: DeleteModalProps) {
  const { t } = useI18n()
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    cancelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !isPending && onCancel()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel, isPending])

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-5">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-[3px]" onClick={isPending ? undefined : onCancel} aria-hidden />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-title"
        aria-describedby="delete-desc"
        data-testid="delete-modal"
        className="relative w-full max-w-100 rounded-3xl border border-wp-line bg-white p-7 text-center shadow-dark"
      >
        <IconTile tone="pink" size="lg" className="mx-auto mb-3.5 text-wp-danger">
          <Trash2 />
        </IconTile>
        <h3 id="delete-title" className="text-xl font-bold text-ink">{t('myEvents.deleteModal.title')}</h3>
        <p id="delete-desc" className="mt-2 mb-6 text-sm text-wp-sub">{t('myEvents.deleteModal.desc', { name: eventName })}</p>
        <div className="flex gap-2.5">
          <Button ref={cancelRef} type="button" variant="line" size="md" className="flex-1" onClick={onCancel} disabled={isPending} data-testid="delete-cancel">
            {t('myEvents.deleteModal.cancel')}
          </Button>
          <Button type="button" size="md" className="flex-1 bg-wp-danger font-bold text-white hover:bg-wp-danger/90" disabled={isPending} onClick={onConfirm} data-testid="delete-confirm">
            {isPending ? t('myEvents.deleteModal.deleting') : t('myEvents.deleteModal.confirm')}
          </Button>
        </div>
      </div>
    </div>
  )
}
