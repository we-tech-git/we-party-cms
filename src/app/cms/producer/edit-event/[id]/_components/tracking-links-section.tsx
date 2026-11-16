'use client'

import { useState } from 'react'
import { Copy, Link2, Trash2 } from 'lucide-react'
import { Panel, PanelHeader } from '@/components/cms/panel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { useEventTrackingLinkMutations, useEventTrackingLinks } from '@/hooks/use-event-tracking-links'
import { useI18n } from '@/i18n/context'
import {
  TRACKING_LINKS_MAX_PER_EVENT,
  TRACKING_LINK_LABEL_MAX,
  buildTrackingUrl,
} from '@/lib/tracking-links'
import type { EventTrackingLinkDto } from '@/types/events.types'
import { DeleteModal } from '../../../my-events/_components/delete-modal'

/**
 * Seção "Links de divulgação" da edição do evento (WEPARTY-239): o produtor
 * cria um link por canal, copia a URL e vê o total de visualizações de cada um.
 * Só é renderizada com a flag ligada (ver `isTrackingLinksEnabled`).
 */
export function TrackingLinksSection({ eventId }: { eventId: string }) {
  const { t } = useI18n()
  const { toastNode, showToast } = useToast()
  const { data: links, isLoading, isError, refetch } = useEventTrackingLinks(eventId)
  const { create, remove } = useEventTrackingLinkMutations(eventId)
  const [label, setLabel] = useState('')
  const [pendingRemove, setPendingRemove] = useState<EventTrackingLinkDto | null>(null)

  const trimmed = label.trim()
  const atLimit = (links?.length ?? 0) >= TRACKING_LINKS_MAX_PER_EVENT
  const canCreate = trimmed.length > 0 && trimmed.length <= TRACKING_LINK_LABEL_MAX && !atLimit && !create.isPending

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!canCreate) return
    create.mutate(trimmed, {
      onSuccess: () => {
        setLabel('')
        showToast(t('trackingLinks.toast.created'), 'success')
      },
      onError: (err: unknown) => {
        const status = (err as { response?: { status?: number } })?.response?.status
        showToast(
          status === 400
            ? t('trackingLinks.toast.limit', { max: TRACKING_LINKS_MAX_PER_EVENT })
            : t('trackingLinks.toast.error'),
          'error',
        )
      },
    })
  }

  async function handleCopy(url: string) {
    try {
      await navigator.clipboard.writeText(url)
      showToast(t('trackingLinks.toast.copied'), 'success')
    } catch {
      showToast(t('trackingLinks.toast.copyError'), 'error')
    }
  }

  function handleConfirmRemove() {
    if (!pendingRemove) return
    remove.mutate(pendingRemove.id, {
      onSuccess: () => {
        setPendingRemove(null)
        showToast(t('trackingLinks.toast.removed'), 'success')
      },
      onError: () => showToast(t('trackingLinks.toast.error'), 'error'),
    })
  }

  return (
    <Panel as="section" className="flex flex-col gap-4" data-testid="tracking-links-section">
      <PanelHeader title={t('trackingLinks.title')} icon={<Link2 />} />
      <p className="-mt-2 text-sm text-wp-sub">{t('trackingLinks.subtitle')}</p>

      <form onSubmit={handleCreate} noValidate className="flex flex-col gap-2.5 sm:flex-row">
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          maxLength={TRACKING_LINK_LABEL_MAX}
          placeholder={t('trackingLinks.labelPlaceholder')}
          aria-label={t('trackingLinks.labelAria')}
          disabled={atLimit}
          data-testid="tracking-links-label-input"
        />
        <Button
          type="submit"
          variant="primary"
          size="md"
          className="shrink-0"
          disabled={!canCreate}
          data-testid="tracking-links-create"
        >
          {create.isPending ? t('trackingLinks.creating') : t('trackingLinks.create')}
        </Button>
      </form>

      {atLimit && (
        <p className="text-sm font-semibold text-wp-orange" data-testid="tracking-links-limit">
          {t('trackingLinks.limitReached', { max: TRACKING_LINKS_MAX_PER_EVENT })}
        </p>
      )}

      {isLoading ? (
        <p className="text-sm font-semibold text-wp-muted" data-testid="tracking-links-loading">
          {t('trackingLinks.loading')}
        </p>
      ) : isError ? (
        <div className="flex items-center gap-3" role="alert" data-testid="tracking-links-error">
          <p className="text-sm font-semibold text-wp-danger">{t('trackingLinks.loadError')}</p>
          <Button type="button" variant="line" size="sm" onClick={() => refetch()}>
            {t('trackingLinks.retry')}
          </Button>
        </div>
      ) : !links || links.length === 0 ? (
        <p className="text-sm text-wp-sub" data-testid="tracking-links-empty">
          {t('trackingLinks.empty')}
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-wp-line" data-testid="tracking-links-list">
          {links.map((link) => {
            const url = buildTrackingUrl(eventId, link.code)
            return (
              <li
                key={link.id}
                className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                data-testid="tracking-links-item"
                data-code={link.code}
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink" data-testid="tracking-links-label">
                    {link.label}
                  </p>
                  <p className="truncate text-[13px] text-wp-sub" data-testid="tracking-links-url">
                    {url}
                  </p>
                  <p className="text-[13px] font-semibold text-wp-magenta" data-testid="tracking-links-views">
                    {t('trackingLinks.views', { count: link.totalViews })}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    type="button"
                    variant="line"
                    size="sm"
                    onClick={() => handleCopy(url)}
                    data-testid="tracking-links-copy"
                  >
                    <Copy aria-hidden /> {t('trackingLinks.copy')}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => setPendingRemove(link)}
                    data-testid="tracking-links-remove"
                  >
                    <Trash2 aria-hidden /> {t('trackingLinks.remove')}
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {pendingRemove && (
        <DeleteModal
          eventName={pendingRemove.label}
          title={t('trackingLinks.removeTitle')}
          description={t('trackingLinks.removeDesc', { label: pendingRemove.label })}
          isPending={remove.isPending}
          onConfirm={handleConfirmRemove}
          onCancel={() => setPendingRemove(null)}
        />
      )}

      {toastNode}
    </Panel>
  )
}
