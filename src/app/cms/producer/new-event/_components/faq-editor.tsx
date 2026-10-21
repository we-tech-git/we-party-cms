'use client'

import { CircleHelp, Info, Plus, Trash2 } from 'lucide-react'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { EmptyState } from '@/components/cms/empty-state'
import { Panel, PanelHeader } from '@/components/cms/panel'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { Input } from '@/components/ui/input'
import type { CreateEventForm } from '../_schema'

/** Perguntas frequentes (Figma: Novo evento › painel "Perguntas frequentes"). */
export function FaqEditor() {
  const { register, control, formState: { errors } } = useFormContext<CreateEventForm>()
  const { fields, append, remove } = useFieldArray({ control, name: 'faqs' })

  return (
    <Panel as="section" className="flex flex-col gap-4" data-testid="panel-faq">
      <PanelHeader title="Perguntas frequentes" icon={<CircleHelp />} tone="green" action={<span className="font-medium text-wp-magenta">opcional</span>} />

      <p className="text-sm text-wp-sub">Antecipe dúvidas comuns (open bar? estacionamento? idade mínima?) e reduza mensagens repetidas.</p>

      {fields.length === 0 && <EmptyState icon={<Info />} title="Nenhuma pergunta adicionada ainda." />}

      <div className="flex flex-col gap-3">
        {fields.map((field, index) => {
          const qErr = errors.faqs?.[index]?.question
          const aErr = errors.faqs?.[index]?.answer
          return (
            <div key={field.id} className="flex items-start gap-2.5 rounded-2xl border border-wp-line bg-wp-bg p-3.5" data-testid="faq-item">
              <div className="flex flex-1 flex-col gap-2">
                <Input aria-label="Pergunta" aria-invalid={!!qErr} placeholder="Pergunta (ex: Tem estacionamento?)" {...register(`faqs.${index}.question`)} />
                {qErr && <span role="alert" className="text-xs font-medium text-wp-danger">{qErr.message}</span>}
                <Input aria-label="Resposta" aria-invalid={!!aErr} placeholder="Resposta" {...register(`faqs.${index}.answer`)} />
                {aErr && <span role="alert" className="text-xs font-medium text-wp-danger">{aErr.message}</span>}
              </div>
              <IconButton tone="danger" aria-label="Remover pergunta" onClick={() => remove(index)}>
                <Trash2 />
              </IconButton>
            </div>
          )
        })}
      </div>

      <Button type="button" variant="primary" size="compact" className="self-start" onClick={() => append({ question: '', answer: '' })} data-testid="faq-add">
        <Plus /> Nova pergunta
      </Button>
    </Panel>
  )
}
