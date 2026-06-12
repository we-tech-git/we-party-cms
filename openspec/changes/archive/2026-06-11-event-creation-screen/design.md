## Context

O CMS tem dashboard funcional mas sem criação de eventos. O sistema legado Vue (`we-party-web-OPS`) tem implementação completa com 5 sub-componentes, Pinia store, validação nativa e dois endpoints (com/sem foto). O novo CMS usa React Hook Form + Zod, TanStack Query, Zustand e axios com interceptors.

## Goals / Non-Goals

**Goals:**
- Formulário único controlado por `useForm` com Zod, dividido em subcomponentes por seção
- Upload de capa com drag-and-drop e preview
- CEP auto-fill via ViaCEP (API pública)
- Lógica de overnight: se `endTime < startTime` → `endDate` recebe `startDate + 1 dia`
- Interesses: busca + chips de sugestões + chips selecionados + sugerir novo
- FAQ inline: add/remove pares pergunta-resposta
- Live preview no feed (coluna direita, sticky)
- Toggles de visibilidade (público/privado) e comentários
- Action bar sticky: "Salvar rascunho" (desabilitado no MVP) + "Publicar" (ativo se título + data)
- Navegação pós-sucesso para `/cms/producer/my-events`

**Non-Goals:**
- Emoji picker na descrição (complexidade alta, baixo valor imediato)
- Modo de edição (`?editId=`) — escopo de tela separada
- Coordenadas geográficas — ViaCEP não retorna, backend aceita sem elas
- Upload de múltiplas fotos — legado aceita só uma, backend também
- Salvar rascunho funcional — botão existe mas apenas como placeholder no MVP

## Decisions

**D1 — Formulário único com `useFormContext`**
Um único `useForm` em `page.tsx` compartilhado via `FormProvider`. Subcomponentes usam `useFormContext()`. Alternativa descartada: cada seção com seu próprio `useForm` — tornaria a composição do payload final complexa e frágil.

**D2 — Subcomponentes na pasta `_components/` local**
Componentes co-locados com a página (`_components/`). Não expõem API pública pois são específicos dessa tela. Alternativa descartada: `src/components/new-event/` — cria acoplamento sem benefício real agora.

**D3 — Composição da string de location no submit**
`location = [street, number, district, city, state].filter(Boolean).join(', ').replace(/, ([^,]+)$/, ' - $1')` produz `"Rua X, 123, Centro, São Paulo - SP"`. Feito no `onSubmit` antes de montar o payload. Alternativa: campo location livre — perderia a integração com CEP.

**D4 — FormData vs JSON depende de `photo`**
Se `watch('photo')` retornar um `File`, usa `POST /events/with-images` com `FormData`. Caso contrário, `POST /events` com JSON. Arrays/booleans viram string no FormData (`JSON.stringify`). Mantém compatibilidade exata com backend legado.

**D5 — ViaCEP chamado fora do React Query**
CEP lookup não é um query que deva ficar em cache nem que precise de invalidação. Implementado como `async function lookupCep(cep)` dentro do componente de localização, chamada em `useEffect` ou `onChange` quando `rawCep.replace(/\D/g,'').length === 8`. Alternativa: `useQuery` com o CEP como chave — overkill e polui o cache.

**D6 — Lógica overnight no onSubmit**
Calcula `endDateISO` antes de montar o payload: se `toMinutes(endTime) < toMinutes(startTime)`, incrementa 1 dia ao `endDate`. Não é estado do formulário — é transformação de payload.

## Risks / Trade-offs

- [ViaCEP fora do ar] → Campos de endereço ficam editáveis manualmente; usuário não perde nada
- [FormData com arrays] → Cada `interestId` e cada campo de `faqs` serializado como JSON string; backend precisa fazer parse — igual ao legado, risco baixo
- [Foto grande] → Sem limite de tamanho no front (legado também não tinha); backend pode rejeitar com 413 — tratar como erro genérico na mutation
- [CEP brasileiro only] → Internacionalização fora de escopo; aceitável para o produto atual
