import { useCallback, useEffect, useState } from 'react'
import { getEventActivities } from '@/services/events.service'
import type { EventActivityDto } from '@/types/events.types'

const PAGE_SIZE = 20

/** Paginated feed for GET /events/{id}/activities — loads the first page on mount, appends on `loadMore`. */
export function useEventActivities(eventId: string | null) {
  const [items, setItems] = useState<EventActivityDto[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  useEffect(() => {
    // No reset on `eventId=null` (drawer closed) — the drawer doesn't render
    // items while closed, and re-opening the same event skips a refetch.
    if (!eventId) return
    // Kicks off the fetch below — the loading flag it flips is read by the
    // drawer to show a spinner while that request is in flight.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true)
    getEventActivities(eventId, 0, PAGE_SIZE)
      .then((res) => {
        setItems(res.items)
        setTotal(res.total)
      })
      .finally(() => setIsLoading(false))
  }, [eventId])

  const loadMore = useCallback(() => {
    if (!eventId || isLoadingMore) return
    setIsLoadingMore(true)
    getEventActivities(eventId, items.length, PAGE_SIZE)
      .then((res) => setItems((prev) => [...prev, ...res.items]))
      .finally(() => setIsLoadingMore(false))
  }, [eventId, items.length, isLoadingMore])

  return { items, isLoading, isLoadingMore, hasMore: items.length < total, loadMore }
}
