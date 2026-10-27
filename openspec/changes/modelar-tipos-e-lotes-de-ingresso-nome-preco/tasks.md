## 1. Base (tipos, serviço, flag, helpers)

- [ ] 1.1 `src/types/events.types.ts`: acrescentar `EventTicketTypeDto` (`id`, `eventId`, `name`, `priceCents: number`, `quantity: number`, `salesStartAt: string | null`, `salesEndAt: string | null`, `sortOrder`, `isVisible`, `createdAt`, `updatedAt`) e `EventTicketTypePayload` (campos de criação; no PATCH, parciais), espelhando os DTOs do backend
- [ ] 1.2 `src/services/events.service.ts`: acrescentar `getEventTicketTypes`, `createEventTicketType`, `updateEventTicketType`, `deleteEventTicketType` e `reorderEventTicketTypes` (`PUT .../order` com `{ ids }`), todos via `axiosInstance`, no estilo das funções de FAQ
- [ ] 1.3 Criar `src/lib/feature-flags.ts` com `isTicketTypesEnabled()` lendo a expressão literal `process.env.NEXT_PUBLIC_FF_TICKET_TYPES === 'true'`
- [ ] 1.4 Criar `src/lib/currency.ts` com `parseReaisToCents(text)` (inteiros e vírgula, sem `parseFloat`, até 2 casas, aceita ponto de milhar, recusa vazio/negativo/letras) e `formatCentsToReais(cents)` via `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`
- [ ] 1.5 Criar `src/lib/ticket-types.ts` com a validação pura do formulário de tipo (nome, preço, quantidade, par de datas) devolvendo mensagens de erro por campo, e as conversões `datetime-local` ↔ ISO (mesma conversão de `buildDateISO` em `_schema.ts`)
- [ ] 1.6 Criar `src/hooks/use-event-ticket-types.ts`: `useEventTicketTypes(eventId, enabled)` com `useQuery` (chave `['event-ticket-types', eventId]`) e mutations de criar, editar, remover e reordenar (reordenar com atualização otimista e rollback), que invalidam a chave

## 2. Interface

- [ ] 2.1 `src/i18n/locales/pt-BR.ts` e `en-US.ts`: grupo `ticketTypes` com título, aviso de venda indisponível, aviso de gravação imediata, `saveEventFirst`, estados vazio/erro/carregando, rótulos dos campos e mensagens de validação (os textos exatos da spec)
- [ ] 2.2 Criar `src/components/cms/ticket-types-list.tsx` (apresentação): recebe `items`, `status` (`loading | error | ready`), `errorMessage` e callbacks; usa `Panel`/`PanelHeader`, `EmptyState`, `Button`, `IconButton`, `Input`, `Switch`; `data-testid`: `panel-ticket-types`, `ticket-types-notice`, `ticket-types-error`, `ticket-type-item`, `ticket-type-add`, `ticket-type-name`, `ticket-type-price`, `ticket-type-quantity`, `ticket-type-sales-start`, `ticket-type-sales-end`, `ticket-type-visible`, `ticket-type-save`, `ticket-type-cancel`, `ticket-type-move-up`, `ticket-type-move-down`, `ticket-type-remove`, `ticket-type-remove-confirm`
- [ ] 2.3 Mesmo arquivo: botões todos `type="button"`; editor de tipo em `<div>` (nunca `<form>`); `onKeyDown` com Enter confirmando e `preventDefault`
- [ ] 2.4 Criar `src/components/cms/ticket-types-list.stories.tsx` com os estados Vazio, Preenchido (3 tipos, um oculto, um gratuito), Carregando e Erro, no padrão de `empty-state.stories.tsx`; sem inventar `figmaNode` (ver 4.5)
- [ ] 2.5 Criar `src/app/cms/producer/new-event/_components/ticket-types-editor.tsx` (container): retorna `null` se `!isTicketTypesEnabled()`; sem `eventId` (modo criação) mostra só `saveEventFirst`; com `eventId` liga os hooks à lista, mostra toast de sucesso/erro por ação (`Toast` de `components/ui/toast`), mapeia 404/403 para os textos da spec
- [ ] 2.6 `src/app/cms/producer/new-event/_components/event-form.tsx`: renderizar `<TicketTypesEditor eventId={isEdit ? props.eventId : undefined} />` logo depois de `<FaqEditor />` (linha 121); nenhuma outra alteração; não tocar em `_schema.ts`

## 3. Testes

- [ ] 3.1 O CMS não tem suíte de testes unitários (config.yaml): cobrir `currency.ts` e `ticket-types.ts` pelos cenários do Cypress (grupo 5) e conferir à mão no Storybook; se o time adotar Vitest depois, os cenários "Conversões" da spec são os casos
- [ ] 3.2 Conferir manualmente, com backend local e as duas flags ligadas, cada cenário da spec (adicionar, editar, remover, reordenar, validações, Enter, 404, 403)

## 4. Verificação

- [ ] 4.1 `yarn lint`, `yarn type-check` e `yarn build` passam
- [ ] 4.2 `yarn storybook` abre sem erro e `yarn build-storybook` passa, com as 4 stories visíveis
- [ ] 4.3 Com `NEXT_PUBLIC_FF_TICKET_TYPES` ausente: o editor de evento e `Network` idênticos ao anterior (nenhuma chamada `ticket-types`)
- [ ] 4.4 `AGENTS.md`: acrescentar `NEXT_PUBLIC_FF_TICKET_TYPES` em "Variáveis de ambiente", com a nota de que é fixada no build; `docs/DESIGN_SYSTEM.md`: linha de `TicketTypesList`
- [ ] 4.5 No PR: declarar a pendência do Figma (componente e ficha em *Componentes* ainda não existem) e abrir tarefa; descrever a ordem de implantação (backend antes, flags desligadas), a lista do checklist de segurança que se aplica (exposição de dados, validação só de UX, sem `dangerouslySetInnerHTML`) e que Salvar evento não salva lotes
- [ ] 4.6 Rodar a skill `security-review` antes de abrir o PR e atualizar `docs/SECURITY.md` se algo novo surgir

## 5. Automação (repositório `weparty-automation`, fora deste repo)

- [ ] 5.1 Abrir tarefa/PR em `weparty-automation`, `cypress/e2e/cms/`, com `cy.intercept` para `/events/*/ticket-types`: flag desligada (seção ausente), lista vazia, preenchida, adicionar, editar só preço, remover com confirmação e cancelar, reordenar com sucesso e com falha, validações (quantidade 0, preço negativo, fim antes do início), Enter não salva o evento, 404 e 403; viewports desktop e mobile
- [ ] 5.2 Rodar `cms-smoke` e os specs do módulo de evento para provar que o editor existente segue coberto

## 6. Encerramento

- [ ] 6.1 Rodar `openspec archive modelar-tipos-e-lotes-de-ingresso-nome-preco` como último commit, para a capability entrar em `openspec/specs/`
