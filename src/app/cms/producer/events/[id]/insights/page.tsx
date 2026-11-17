import { redirect } from 'next/navigation'
import { EVENT_INSIGHTS_ENABLED } from '@/lib/feature-flags'
import { InsightsView } from './_components/insights-view'

export default async function EventInsightsPage({ params }: { params: Promise<{ id: string }> }) {
  if (!EVENT_INSIGHTS_ENABLED) redirect('/cms/producer/my-events')
  const { id } = await params
  return <InsightsView eventId={id} />
}
