'use client'

import { useState, useEffect } from 'react'
import { Flame, Lightbulb, Plus, RefreshCw, Tag, X, Info } from 'lucide-react'
import { useFormContext, useWatch } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { Panel, PanelHeader } from '@/components/cms/panel'
import { Button } from '@/components/ui/button'
import { Chip } from '@/components/ui/chip'
import { Field } from '@/components/ui/field'
import { SearchField } from '@/components/ui/search-field'
import { Input } from '@/components/ui/input'
import { useInterests } from '@/hooks/use-interests'
import { suggestInterest } from '@/services/interests.service'
import type { CreateEventForm } from '../_schema'

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

const interestBtn = 'inline-flex items-center gap-1.5 rounded-full border border-wp-line bg-white px-3.5 py-2 text-[13px] font-semibold text-wp-magenta outline-none transition-colors hover:bg-tint-pink focus-visible:ring-3 focus-visible:ring-wp-primary/30'

/** Interesses do evento (Figma: Novo evento › painel "Interesses do evento"). */
export function InterestsSelector() {
  const { setValue, control } = useFormContext<CreateEventForm>()
  const interestIds = useWatch({ control, name: 'interestIds' }) ?? []
  const { data: allInterests = [] } = useInterests()

  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [suggestValue, setSuggestValue] = useState('')
  const [showSuggest, setShowSuggest] = useState(false)
  const [suggestMsg, setSuggestMsg] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    if (allInterests.length > 0 && suggestions.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggestions(shuffle(allInterests.map((i) => i.id)).slice(0, 5))
    }
  }, [allInterests, suggestions.length])

  const selectedItems = allInterests.filter((i) => interestIds.includes(i.id))
  const availableForSearch = allInterests.filter((i) => !interestIds.includes(i.id))
  const searchResults = search.trim().length > 0
    ? availableForSearch.filter((i) => i.name.toLowerCase().includes(search.toLowerCase())).slice(0, 6)
    : []
  const suggestionItems = allInterests.filter((i) => suggestions.includes(i.id) && !interestIds.includes(i.id))

  const add = (id: string) => setValue('interestIds', [...interestIds, id], { shouldDirty: true })
  const remove = (id: string) => setValue('interestIds', interestIds.filter((i) => i !== id), { shouldDirty: true })
  const reroll = () => setSuggestions(shuffle(allInterests.filter((i) => !interestIds.includes(i.id)).map((i) => i.id)).slice(0, 5))

  const suggestMutation = useMutation({
    mutationFn: (name: string) => suggestInterest(name),
    onSuccess: (interest) => {
      add(interest.id)
      setSuggestValue('')
      setShowSuggest(false)
      setSuggestMsg({ ok: true, text: `"${interest.name}" adicionado com sucesso!` })
      setTimeout(() => setSuggestMsg(null), 2400)
    },
    onError: () => {
      setSuggestMsg({ ok: false, text: 'Erro ao sugerir interesse. Tente novamente.' })
      setTimeout(() => setSuggestMsg(null), 2400)
    },
  })

  return (
    <Panel as="section" className="flex flex-col gap-4" data-testid="panel-interests">
      <PanelHeader title="Interesses do evento" icon={<Tag />} tone="orange" action={<span className="font-medium text-wp-magenta">ajuda o público certo a te encontrar</span>} />

      <Field label="Pesquisar interesses" htmlFor="interest-search">
        <SearchField id="interest-search" placeholder="Digite para buscar interesses..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </Field>

      {searchResults.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {searchResults.map((i) => (
            <button key={i.id} type="button" className={interestBtn} onClick={() => { add(i.id); setSearch('') }}>
              {i.name} <Plus className="size-3.5" />
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[.08em] text-wp-sub uppercase"><Flame className="size-3.5 text-wp-orange" /> Sugestões para você</p>
        <div className="flex flex-wrap items-center gap-2">
          {suggestionItems.map((i) => (
            <button key={i.id} type="button" className={interestBtn} onClick={() => add(i.id)}>
              {i.name} <Plus className="size-3.5" />
            </button>
          ))}
          <button type="button" aria-label="Novas sugestões" onClick={reroll} className="grid size-9 place-items-center rounded-full border border-wp-line text-wp-sub outline-none hover:bg-wp-bg focus-visible:ring-3 focus-visible:ring-wp-primary/30">
            <RefreshCw className="size-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <p className="text-[11px] font-semibold tracking-[.08em] text-wp-sub uppercase">Selecionados</p>
        {selectedItems.length === 0 ? (
          <p className="flex items-center gap-2 rounded-xl border border-wp-line bg-wp-bg px-3.5 py-3 text-[13px] text-wp-sub"><Info className="size-4 shrink-0" /> Nenhum interesse selecionado ainda. Use a busca ou as sugestões acima.</p>
        ) : (
          <div className="flex flex-wrap gap-2" data-testid="selected-interests">
            {selectedItems.map((i) => (
              <button key={i.id} type="button" onClick={() => remove(i.id)} aria-label={`Remover ${i.name}`}>
                <Chip tone="selected" className="gap-1.5 px-3.5 py-2 text-[13px]">{i.name} <X className="size-3.5" /></Chip>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-dashed border-wp-line pt-4">
        <button type="button" onClick={() => setShowSuggest(!showSuggest)} className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-wp-purple outline-none focus-visible:underline">
          <Lightbulb className="size-4" /> Não encontrou? Sugira um novo interesse
        </button>
        {showSuggest && (
          <div className="mt-3 flex gap-2">
            <Input
              value={suggestValue}
              onChange={(e) => setSuggestValue(e.target.value)}
              placeholder="Nome do interesse..."
              aria-label="Nome do interesse"
              maxLength={60}
              onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
            />
            <Button type="button" variant="primary" size="md" disabled={!suggestValue.trim() || suggestMutation.isPending} onClick={() => suggestMutation.mutate(suggestValue.trim())}>
              {suggestMutation.isPending ? '…' : 'Enviar'}
            </Button>
          </div>
        )}
        {suggestMsg && <p role="status" className={`mt-2 text-xs font-medium ${suggestMsg.ok ? 'text-wp-green' : 'text-wp-danger'}`}>{suggestMsg.text}</p>}
      </div>
    </Panel>
  )
}
