'use client'

import { useState, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { GRAD } from '@/lib/brand'
import { useInterests } from '@/hooks/use-interests'
import { suggestInterest } from '@/services/interests.service'
import type { CreateEventForm } from '../_schema'

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export function InterestsSelector() {
  const { setValue, watch } = useFormContext<CreateEventForm>()
  const interestIds = watch('interestIds') ?? []
  const { data: allInterests = [] } = useInterests()

  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [suggestValue, setSuggestValue] = useState('')
  const [showSuggest, setShowSuggest] = useState(false)
  const [suggestMsg, setSuggestMsg] = useState<{ ok: boolean; text: string } | null>(null)

  useMemo(() => {
    if (allInterests.length > 0 && suggestions.length === 0) {
      setSuggestions(shuffle(allInterests.map(i => i.id)).slice(0, 5))
    }
  }, [allInterests, suggestions.length])

  const selectedItems = allInterests.filter(i => interestIds.includes(i.id))
  const availableForSearch = allInterests.filter(i => !interestIds.includes(i.id))
  const searchResults = search.trim().length > 0
    ? availableForSearch.filter(i => i.name.toLowerCase().includes(search.toLowerCase())).slice(0, 6)
    : []
  const suggestionItems = allInterests.filter(i => suggestions.includes(i.id) && !interestIds.includes(i.id))

  function add(id: string) {
    setValue('interestIds', [...interestIds, id], { shouldDirty: true })
  }

  function remove(id: string) {
    setValue('interestIds', interestIds.filter(i => i !== id), { shouldDirty: true })
  }

  function reroll() {
    const unselected = allInterests.filter(i => !interestIds.includes(i.id)).map(i => i.id)
    setSuggestions(shuffle(unselected).slice(0, 5))
  }

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
    <div
      className="rounded-[var(--r)] p-6"
      style={{ background: '#fff', border: '1px solid var(--line-2)', boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="flex items-center gap-[11px] mb-[18px]">
        <span
          className="w-[38px] h-[38px] rounded-[12px] grid place-items-center flex-none"
          style={{ background: '#FFEDD9', color: 'var(--amber)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M20.6 13.4l-7.2 7.2a2 2 0 01-2.8 0l-7.2-7.2a2 2 0 01-.6-1.4V5a2 2 0 012-2h7a2 2 0 011.4.6l7.2 7.2a2 2 0 010 2.6z" />
            <circle cx="8" cy="8" r="1.4" />
          </svg>
        </span>
        <h3 className="font-bold text-[18px]" style={{ fontFamily: 'var(--font-bricolage)' }}>
          Interesses do evento
        </h3>
        <span className="ml-auto text-[12.5px] font-semibold" style={{ color: 'var(--wp-muted)' }}>
          ajuda o público certo a te encontrar
        </span>
      </div>

      {/* Search */}
      <div className="flex flex-col gap-1.5 mb-4">
        <label className="font-extrabold text-[13px]" style={{ color: 'var(--ink-soft)' }}>Pesquisar interesses</label>
        <div className="relative">
          <span className="absolute left-[14px] top-1/2 -translate-y-1/2" style={{ color: 'var(--wp-muted)' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
            </svg>
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Digite para buscar interesses..."
            className="w-full rounded-[14px] border-[1.5px] pl-[42px] pr-[15px] py-[13px] text-[15px] font-medium outline-none transition-all"
            style={{ background: '#FCFAFD', borderColor: 'var(--line)', color: 'var(--ink)' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--pink)'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(240,48,154,.1)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.background = '#FCFAFD'; e.currentTarget.style.boxShadow = 'none' }}
          />
        </div>
      </div>

      {/* Search results */}
      {searchResults.length > 0 && (
        <div className="flex flex-wrap gap-[9px] mb-4">
          {searchResults.map(i => (
            <button
              key={i.id}
              type="button"
              onClick={() => { add(i.id); setSearch('') }}
              className="inline-flex items-center gap-[7px] rounded-full px-[14px] py-[9px] font-extrabold text-[13px] border-[1.5px] transition-all hover:-translate-y-0.5"
              style={{ borderColor: '#ffd0e3', color: 'var(--pink)', background: '#fff' }}
            >
              {i.name} <b>+</b>
            </button>
          ))}
        </div>
      )}

      {/* Suggestions */}
      <div className="text-[11px] font-extrabold tracking-[.08em] uppercase flex items-center gap-[6px] my-4" style={{ color: 'var(--wp-muted)' }}>
        🔥 Sugestões para você
      </div>
      <div className="flex flex-wrap gap-[9px]">
        {suggestionItems.map(i => (
          <button
            key={i.id}
            type="button"
            onClick={() => add(i.id)}
            className="inline-flex items-center gap-[7px] rounded-full px-[14px] py-[9px] font-extrabold text-[13px] border-[1.5px] transition-all hover:-translate-y-0.5"
            style={{ borderColor: '#ffd0e3', color: 'var(--pink)', background: '#fff' }}
          >
            {i.name} <b>+</b>
          </button>
        ))}
        <button
          type="button"
          onClick={reroll}
          className="w-[36px] h-[36px] rounded-full grid place-items-center border-[1.5px] transition-all hover:rotate-90"
          style={{ borderColor: 'var(--line)', color: 'var(--wp-muted)' }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M3 12a9 9 0 0115-6.7L21 8M21 3v5h-5" />
          </svg>
        </button>
      </div>

      {/* Selected */}
      <div className="text-[11px] font-extrabold tracking-[.08em] uppercase my-4" style={{ color: 'var(--wp-muted)' }}>
        Selecionados
      </div>
      {selectedItems.length === 0 ? (
        <div className="flex items-center gap-2 rounded-[12px] px-[14px] py-3 font-semibold text-[13px]" style={{ color: 'var(--wp-muted)', background: '#FCFAFD', border: '1px solid var(--line-2)' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" />
          </svg>
          Nenhum interesse selecionado ainda. Use a busca ou as sugestões acima.
        </div>
      ) : (
        <div className="flex flex-wrap gap-[9px]">
          {selectedItems.map(i => (
            <button
              key={i.id}
              type="button"
              onClick={() => remove(i.id)}
              className="inline-flex items-center gap-[7px] rounded-full px-[14px] py-[9px] font-extrabold text-[13px] text-white border-0 transition-all"
              style={{ background: GRAD }}
            >
              {i.name} <span className="opacity-85">×</span>
            </button>
          ))}
        </div>
      )}

      {/* Suggest new */}
      <div className="mt-4 pt-4" style={{ borderTop: '1px dashed var(--line)' }}>
        <button
          type="button"
          onClick={() => setShowSuggest(!showSuggest)}
          className="flex items-center gap-2 font-extrabold text-[13.5px]"
          style={{ color: 'var(--violet)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7c.6.5 1 1.2 1 2h6c0-.8.4-1.5 1-2A7 7 0 0012 2z" />
          </svg>
          Não encontrou? Sugira um novo interesse
        </button>
        {showSuggest && (
          <div className="flex gap-2 mt-3">
            <input
              value={suggestValue}
              onChange={(e) => setSuggestValue(e.target.value)}
              placeholder="Nome do interesse..."
              className="flex-1 rounded-[12px] border-[1.5px] px-[14px] py-[11px] text-[14px] font-medium outline-none"
              style={{ background: '#FCFAFD', borderColor: 'var(--line)', color: 'var(--ink)' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--violet)'; e.currentTarget.style.background = '#fff' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.background = '#FCFAFD' }}
              onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
            />
            <button
              type="button"
              disabled={!suggestValue.trim() || suggestMutation.isPending}
              onClick={() => suggestMutation.mutate(suggestValue.trim())}
              className="rounded-[12px] px-4 font-extrabold text-[13px] text-white transition disabled:opacity-50"
              style={{ background: GRAD }}
            >
              {suggestMutation.isPending ? '…' : 'Enviar'}
            </button>
          </div>
        )}
        {suggestMsg && (
          <p className="mt-2 text-[12px] font-semibold" style={{ color: suggestMsg.ok ? 'var(--green)' : 'var(--pink)' }}>
            {suggestMsg.text}
          </p>
        )}
      </div>
    </div>
  )
}
