'use client'

import { EventForm } from './_components/event-form'
import { EMPTY_EVENT_FORM } from './_schema'

export default function NewEventPage() {
  return <EventForm mode="create" defaultValues={EMPTY_EVENT_FORM} />
}
