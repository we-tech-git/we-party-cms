import { z } from 'zod'
import type { CreateEventPayload } from '@/types/events.types'

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
    invitedUserIds: [],
    faqs: form.faqs,
  }
}

export const MAX_PHOTOS = 5
