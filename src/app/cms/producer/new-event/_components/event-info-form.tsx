'use client'

import { AlignLeft } from 'lucide-react'
import { useController, useFormContext } from 'react-hook-form'
import { Panel, PanelHeader } from '@/components/cms/panel'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { CreateEventForm } from '../_schema'

/** Detalhes do evento (Figma: Novo evento › painel "Detalhes do evento"). */
export function EventInfoForm() {
  const { register, control, formState: { errors } } = useFormContext<CreateEventForm>()
  // Campo controlado (useController) em vez de register + watch: com o React Compiler ligado, o
  // textarea não controlado perdia o que era digitado e o contador não saía de 0.
  const { field: descField } = useController({ control, name: 'description' })

  return (
    <Panel as="section" className="flex flex-col gap-4" data-testid="panel-details">
      <PanelHeader title="Detalhes do evento" icon={<AlignLeft />} tone="pink" />

      <Field label="Nome do evento" htmlFor="input-title" required error={errors.title?.message}>
        <Input
          id="input-title"
          placeholder="Ex: Sunset Beach Party"
          aria-invalid={!!errors.title}
          data-testid="event-title-input"
          {...register('title')}
        />
      </Field>

      <Field label="Descrição" htmlFor="input-description">
        <Textarea
          id="input-description"
          rows={4}
          maxLength={600}
          showCount
          placeholder="Conte o que rola no evento: line-up, atrações, clima, o que torna ele especial..."
          data-testid="event-description-input"
          {...descField}
          value={descField.value ?? ''}
        />
      </Field>
    </Panel>
  )
}
