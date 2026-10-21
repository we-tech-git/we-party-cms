'use client'

import { CalendarDays } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { Panel, PanelHeader } from '@/components/cms/panel'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { CreateEventForm } from '../_schema'

/** Data e horário (Figma: Novo evento › painel "Data e horário"). */
export function DateTimeForm() {
  const { register, formState: { errors } } = useFormContext<CreateEventForm>()

  return (
    <Panel as="section" className="flex flex-col gap-4" data-testid="panel-datetime">
      <PanelHeader title="Data e horário" icon={<CalendarDays />} />

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <Field label="Início" htmlFor="input-startDate" required error={errors.startDate?.message}>
          <Input id="input-startDate" type="date" aria-invalid={!!errors.startDate} {...register('startDate')} />
        </Field>
        <Field label="Hora" htmlFor="input-startTime">
          <Input id="input-startTime" type="time" defaultValue="22:00" {...register('startTime')} />
        </Field>
        <Field label="Término" htmlFor="input-endDate">
          <Input id="input-endDate" type="date" {...register('endDate')} />
        </Field>
        <Field label="Hora" htmlFor="input-endTime">
          <Input id="input-endTime" type="time" defaultValue="06:00" {...register('endTime')} />
        </Field>
      </div>
    </Panel>
  )
}
