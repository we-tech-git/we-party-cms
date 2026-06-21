import { z } from 'zod'
import type {
  CreateEventPayload,
  UpdateEventPayload,
  EventDetailDto,
} from '@/types/events.types'

export const createEventSchema = z.object({
  title: z.string().min(1, 'Nome do evento é obrigatório'),
  description: z.string().max(600),
  startDate: z.string().min(1, 'Data de início é obrigatória'),
  startTime: z.string(),
  endDate: z.string(),
  endTime: z.string(),
  zip: z.string(),
  street: z.string(),
  number: z.string(),
  district: z.string(),
  city: z.string(),
  state: z.string(),
  isPublic: z.boolean(),
  allowComments: z.boolean(),
  interestIds: z.array(z.string()),
  faqs: z.array(
    z.object({
      question: z.string().min(1, 'Pergunta é obrigatória'),
      answer: z.string().min(1, 'Resposta é obrigatória'),
    })
  ),
  photos: z.array(z.custom<File>((v) => v instanceof File)).max(5),
  // Already-stored photo URLs the user has chosen to keep (edit mode only).
  existingPhotoUrls: z.array(z.string()),
})

export type CreateEventForm = z.infer<typeof createEventSchema>

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function buildDateISO(date: string, time: string): string {
  return new Date(`${date}T${time}:00`).toISOString()
}

export function buildEndDateISO(
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string
): string {
  const resolvedEndDate = endDate || startDate
  const endMins = toMinutes(endTime)
  const startMins = toMinutes(startTime)
  if (resolvedEndDate === startDate && endMins < startMins) {
    const d = new Date(`${resolvedEndDate}T${endTime}:00`)
    d.setDate(d.getDate() + 1)
    return d.toISOString()
  }
  return new Date(`${resolvedEndDate}T${endTime}:00`).toISOString()
}

export function buildLocationString(fields: {
  street: string
  number: string
  district: string
  city: string
  state: string
}): string {
  const { street, number, district, city, state } = fields
  const parts = [street, number, district].filter(Boolean)
  const cityState = [city, state].filter(Boolean).join(' - ')
  return [...parts, cityState].filter(Boolean).join(', ')
}

export function buildPayload(form: CreateEventForm): CreateEventPayload {
  return {
    title: form.title,
    description: form.description,
    startDate: buildDateISO(form.startDate, form.startTime),
    endDate: buildEndDateISO(form.startDate, form.startTime, form.endDate, form.endTime),
    location: buildLocationString({
      street: form.street,
      number: form.number,
      district: form.district,
      city: form.city,
      state: form.state,
    }),
    isPublic: form.isPublic,
    allowComments: form.allowComments,
    showInMainFeed: true,
    interestIds: form.interestIds,
    // Backend expects the singular field name `faq`. Drop blank pairs so an empty
    // trailing row never reaches the API ("FAQ vazio não é enviado").
    faq: form.faqs
      .map((f) => ({ question: f.question.trim(), answer: f.answer.trim() }))
      .filter((f) => f.question && f.answer),
  }
}

export const MAX_PHOTOS = 5

/** Blank form values shared by create mode and as the base for edit prefill. */
export const EMPTY_EVENT_FORM: CreateEventForm = {
  title: '',
  description: '',
  startDate: '',
  startTime: '22:00',
  endDate: '',
  endTime: '06:00',
  zip: '',
  street: '',
  number: '',
  district: '',
  city: '',
  state: '',
  isPublic: true,
  allowComments: true,
  interestIds: [],
  faqs: [],
  photos: [],
  existingPhotoUrls: [],
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

/** Splits an ISO datetime back into the local `date` (YYYY-MM-DD) and `time` (HH:mm) the inputs expect. */
export function isoToDateTime(iso: string | null | undefined): { date: string; time: string } {
  if (!iso) return { date: '', time: '' }
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return { date: '', time: '' }
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  }
}

/**
 * Best-effort inverse of buildLocationString: "street, number, district, city - state".
 * Used to prefill the separate address inputs in edit mode. Imperfect for
 * externally-sourced events, but round-trips events created by this form.
 */
export function parseLocation(location: string | null | undefined): {
  street: string
  number: string
  district: string
  city: string
  state: string
} {
  const empty = { street: '', number: '', district: '', city: '', state: '' }
  if (!location) return empty
  const parts = location.split(',').map((s) => s.trim()).filter(Boolean)
  if (parts.length === 0) return empty
  const last = parts.pop() as string
  const [city = '', state = ''] = last.split(' - ').map((s) => s.trim())
  return {
    street: parts[0] ?? '',
    number: parts[1] ?? '',
    district: parts[2] ?? '',
    city,
    state,
  }
}

/** Maps the detail DTO from GET /events/{id} into form values for edit mode. */
export function mapEventToForm(event: EventDetailDto): CreateEventForm {
  const start = isoToDateTime(event.startDate)
  const end = isoToDateTime(event.endDate)
  // Prefer the broken-down address fields when present, else parse the location string.
  const parsed = parseLocation(event.location)
  return {
    ...EMPTY_EVENT_FORM,
    title: event.title ?? '',
    description: event.description ?? '',
    startDate: start.date,
    startTime: start.time || '22:00',
    endDate: end.date,
    endTime: end.time || '06:00',
    zip: event.zipCode ?? '',
    street: event.street ?? parsed.street,
    number: event.number ?? parsed.number,
    district: event.neighborhood ?? parsed.district,
    city: event.city ?? parsed.city,
    state: event.state ?? parsed.state,
    isPublic: event.isPublic,
    allowComments: event.allowComments,
    interestIds: (event.eventInterests ?? []).map((ei) => ei.interestId),
    faqs: (event.faq ?? []).map((f) => ({ question: f.question, answer: f.answer })),
    photos: [],
    existingPhotoUrls: event.photos ?? [],
  }
}

/**
 * Builds the PUT /events/{id} body (mirrors the web-OPS flow: faqs inline).
 * `photos` (kept URLs) is appended by the caller for the no-upload case.
 */
export function buildUpdatePayload(form: CreateEventForm): UpdateEventPayload {
  return {
    title: form.title,
    description: form.description,
    startDate: buildDateISO(form.startDate, form.startTime),
    endDate: buildEndDateISO(form.startDate, form.startTime, form.endDate, form.endTime),
    location: buildLocationString({
      street: form.street,
      number: form.number,
      district: form.district,
      city: form.city,
      state: form.state,
    }),
    isPublic: form.isPublic,
    allowComments: form.allowComments,
    interestIds: form.interestIds,
    faq: form.faqs
      .map((f) => ({ question: f.question.trim(), answer: f.answer.trim() }))
      .filter((f) => f.question && f.answer),
  }
}
