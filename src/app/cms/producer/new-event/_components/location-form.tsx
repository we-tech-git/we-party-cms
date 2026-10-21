'use client'

import { useState } from 'react'
import { MapPin } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { Panel, PanelHeader } from '@/components/cms/panel'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { CreateEventForm } from '../_schema'

type CepStatus = 'idle' | 'loading' | 'ok' | 'error'

/** Local (Figma: Novo evento › painel "Local"). O CEP preenche o endereço via ViaCEP. */
export function LocationForm() {
  const { register, setValue } = useFormContext<CreateEventForm>()
  const [cepStatus, setCepStatus] = useState<CepStatus>('idle')
  const [rawCep, setRawCep] = useState('')

  async function handleCepChange(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 8)
    const formatted = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits
    setRawCep(formatted)
    setValue('zip', formatted)
    if (digits.length !== 8) { setCepStatus('idle'); return }
    setCepStatus('loading')
    try {
      // `digits` já é numérico (8 dígitos) — nada do usuário chega à URL além disso.
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const json = await res.json()
      if (json.erro) { setCepStatus('error'); return }
      setValue('street', json.logradouro ?? '', { shouldDirty: true })
      setValue('district', json.bairro ?? '', { shouldDirty: true })
      setValue('city', json.localidade ?? '', { shouldDirty: true })
      setValue('state', json.uf ?? '', { shouldDirty: true })
      setCepStatus('ok')
    } catch {
      setCepStatus('error')
    }
  }

  const cepHint = cepStatus === 'loading' ? 'Buscando…' : undefined

  return (
    <Panel as="section" className="flex flex-col gap-4" data-testid="panel-location">
      <PanelHeader title="Local" icon={<MapPin />} />

      <Field label="CEP" htmlFor="input-zip" hint={cepHint} error={cepStatus === 'error' ? 'CEP não encontrado' : undefined}>
        <Input
          id="input-zip"
          inputMode="numeric"
          autoComplete="postal-code"
          value={rawCep}
          onChange={(e) => handleCepChange(e.target.value)}
          placeholder="00000-000"
          aria-invalid={cepStatus === 'error'}
          data-testid="event-zip-input"
        />
      </Field>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <Field label="Cidade" htmlFor="input-city"><Input id="input-city" placeholder="Cidade" {...register('city')} /></Field>
        <Field label="Estado" htmlFor="input-state"><Input id="input-state" placeholder="UF" {...register('state')} /></Field>
        <Field label="Bairro" htmlFor="input-district"><Input id="input-district" placeholder="Bairro" {...register('district')} /></Field>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-[2fr_1fr]">
        <Field label="Rua" htmlFor="input-street"><Input id="input-street" placeholder="Rua / avenida" {...register('street')} /></Field>
        <Field label="Número" htmlFor="input-number"><Input id="input-number" placeholder="Nº" {...register('number')} /></Field>
      </div>
    </Panel>
  )
}
