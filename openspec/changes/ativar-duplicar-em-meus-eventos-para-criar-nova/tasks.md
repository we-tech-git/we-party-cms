## 1. Pré-requisito

- [ ] 1.1 Em `we-party-social-backend` (somente leitura), conferir em `create-event.dto.ts` que `POST /events` aceita `status` com valor `DRAFT`, qual é o status padrão sem `status`, e se o limite de tamanho de `title` comporta o sufixo; se não aceitar, parar e registrar o achado
- [ ] 1.2 Ler `node_modules/next/dist/docs/` sobre `useSearchParams` e `Suspense` nesta versão do Next antes de mexer em `new-event/page.tsx`

## 2. Implementação

- [ ] 2.1 `src/types/events.types.ts`: adicionar `status?: 'DRAFT'` a `CreateEventPayload` (~linha 189)
- [ ] 2.2 `src/app/cms/producer/new-event/_schema.ts`: criar `mapEventToDuplicateForm(event: EventDetailDto, suffix: string): CreateEventForm` sobre `mapEventToForm` (título + sufixo; `startDate` e `endDate` vazios; `startTime` 22:00 e `endTime` 06:00; `photos` e `existingPhotoUrls` vazios); fazer `buildPayload(form, options?: { asDraft?: boolean })` incluir `status: 'DRAFT'` só quando `asDraft`
- [ ] 2.3 `src/i18n/locales/pt-BR.ts` e `en-US.ts`: em `newEvent`, adicionar `duplicateTitle`, `duplicateSubtitle`, `duplicateSuffix` (`' (cópia)'` / `' (copy)'`), `saveAsDraft` e `sourceNotFound`
- [ ] 2.4 `src/hooks/use-create-event.ts`: adicionar `onSuccess` ao `useMutation` que invalida `['my-events']` com `useQueryClient`
- [ ] 2.5 `src/app/cms/producer/new-event/_components/event-form.tsx`: nova prop opcional `asDraft` no modo `create`; chamar `buildPayload(form, { asDraft })`; trocar título e subtítulo do `PageHeader` para `duplicateTitle`/`duplicateSubtitle` quando `asDraft`; repassar `asDraft` ao `ActionBar`
- [ ] 2.6 `src/app/cms/producer/new-event/_components/action-bar.tsx`: com `asDraft`, rótulo `newEvent.saveAsDraft` (enviando: `newEvent.saving`) e ocultar o botão desabilitado "Salvar rascunho" (linha 40)
- [ ] 2.7 `src/app/cms/producer/new-event/page.tsx`: ler `from` com `useSearchParams` dentro de `<Suspense>`; sem `from`, manter `EventForm mode="create"` com `EMPTY_EVENT_FORM`; com `from`, usar `useEvent(from)`, mostrar carregamento e só então renderizar `EventForm` com `mapEventToDuplicateForm(event, t('newEvent.duplicateSuffix'))` e `asDraft`; se erro, evento ausente ou `event.creator.id !== useAuthStore().user?.id`, mostrar o painel de `edit-event/[id]/page.tsx` (texto `newEvent.sourceNotFound`, link para `/cms/producer/my-events`)
- [ ] 2.8 `src/components/cms/event-card.tsx`: adicionar `onDuplicate: (event: EventDto) => void` a `EventCardProps` e, no item "Duplicar" (linha 79), trocar `disabled: true` por `act: () => onDuplicate(event)`
- [ ] 2.9 `src/app/cms/producer/my-events/page.tsx`: passar `onDuplicate` ao `EventCard` (perto da linha 199), navegando com `router.push` para `/cms/producer/new-event?from=` seguido do id; ajustar `src/components/cms/event-card.stories.tsx` se exigir a nova prop

## 3. Testes

- [ ] 3.1 Registrar no PR que o CMS não tem runner de testes; o teste unitário de `mapEventToDuplicateForm` depende de decisão do Pedro (ver relatório) e, sem runner, a função é coberta pelo E2E
- [ ] 3.2 Repositório `weparty-automation` (PR separado, `cypress/e2e/cms/`): E2E de Duplicar com `cy.intercept`: logar como produtor, abrir Meus eventos, clicar Duplicar, conferir título "… (cópia)", descrição, cidade, interesses e FAQ preenchidos e datas vazias; informar data, salvar, verificar `POST /events` com `status: "DRAFT"` e nenhuma chamada em `/events/{origem}`
- [ ] 3.3 Mesmo repositório: E2E de `?from=` com evento inexistente (404) e de outro produtor (aparece "Evento não encontrado", sem campo "Nome do evento"), e E2E de envio sem data bloqueado

## 4. Verificação

- [ ] 4.1 `yarn lint`, `yarn type-check` e `yarn build` passam
- [ ] 4.2 No preview, com backend real: duplicar um evento com FAQ e interesses; conferir no card o selo "Rascunho", contadores 0 e original inalterado; repetir adicionando uma foto nova e conferir que o status segue "Rascunho" depois do upload
- [ ] 4.3 Conferir em pt-BR e en-US o título, o botão e o sufixo da cópia

## 5. Encerramento

- [ ] 5.1 Rodar `openspec archive ativar-duplicar-em-meus-eventos-para-criar-nova` como último commit
