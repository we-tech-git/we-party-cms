## 1. Pré-requisito

- [ ] 1.1 Conferir, com uma resposta real ou fixture de `GET /events/my-events` (`we-party-social-backend` não está no workspace; usar o ambiente de desenvolvimento ou o Swagger em `/api/docs`), se cada evento traz `faq`; registrar o resultado no PR (se não trouxer, o selo mostra "—" e abrir achado para o backend)

## 2. Implementação

- [ ] 2.1 `src/types/events.types.ts`: adicionar `faq?: EventFaqDto[]` a `EventDto` (linha ~163); em `EventDetailDto` (linha ~240) manter `faq: EventFaqDto[]` obrigatório
- [ ] 2.2 `src/lib/event-completeness.ts` (novo): exportar `MIN_DESCRIPTION_LENGTH = 200`, `computeCompleteness(input)`, `completenessFromForm(values: CreateEventForm)` e `completenessFromEvent(event: EventDto)`, com os tipos `CompletenessItemId`, `CompletenessState` e `CompletenessResult` (`items`, `doneCount`, `total`, `hasUnknown`)
- [ ] 2.3 `src/i18n/locales/pt-BR.ts` e `en-US.ts`: bloco `completeness` com `title`, `badgeLabel`, `items.cover|description|faq|interests|endDate`, `state.done|pending|unknown` e `progress` ("{done}/{total}")
- [ ] 2.4 `src/components/cms/completeness-checklist.tsx` (novo): `CompletenessChecklist({ result })` com `Panel`/`PanelHeader`, lista de itens com ícone de feito/pendente e texto de estado para leitor de tela, `data-testid="completeness-checklist"`, total em `data-testid="completeness-total"`; e `CompletenessBadge({ result })` com `Chip`, `data-testid="completeness-badge"`, mostrando "—" quando `hasUnknown`
- [ ] 2.5 `src/app/cms/producer/new-event/_components/event-form.tsx`: criar um pequeno componente (`_components/completeness-panel.tsx`) que lê os valores com `useWatch` (como `live-preview.tsx:23`) e renderiza `CompletenessChecklist`; colocá-lo entre `<LivePreview />` e `<VisibilitySettings />` (linha ~113); não tocar em `onSubmit` nem em `ActionBar`
- [ ] 2.6 `src/components/cms/event-card.tsx`: renderizar `CompletenessBadge` no corpo do card (perto dos chips de interesse, linha ~143) com `completenessFromEvent(event)`; não alterar menu, status nem props existentes

## 3. Testes

- [ ] 3.1 `src/components/cms/completeness-checklist.stories.tsx` (novo, padrão de `stat-card.stories.tsx`): stories `Vazio` (0/5), `Parcial` (3/5), `Completo` (5/5) e `SemDado` (selo "—")
- [ ] 3.2 Registrar no PR que o CMS não tem runner de testes unitários; a função pura é coberta pelo E2E e pelas stories (criar runner é decisão separada, já no backlog)
- [ ] 3.3 Repositório `weparty-automation` (PR separado, `cypress/e2e/cms/`): formulário vazio mostra `completeness-total` "0/5"; preencher descrição de 200 caracteres, 1 FAQ completo e 1 interesse mostra "3/5"; apagar a resposta do FAQ mostra "2/5"; com `cy.intercept` em `GET /events/my-events` com 1 evento completo e `faq` de 1 item, o card mostra `completeness-badge` "5/5"; sem `faq` na resposta, mostra "—"
- [ ] 3.4 Mesmo repositório: com o checklist em "0/5" (título e data de início preenchidos), "Publicar evento" ainda envia `POST /events`

## 4. Verificação

- [ ] 4.1 `yarn lint`, `yarn type-check` e `yarn build` passam
- [ ] 4.2 No navegador, em pt-BR e en-US: conferir painel no formulário (criar e editar) e selo em Meus eventos, no modo grade e no modo lista
- [ ] 4.3 Registrar no PR se o componente novo foi ou não espelhado no Figma (Venus Design), como exige o `AGENTS.md`

## 5. Encerramento

- [ ] 5.1 Rodar `openspec archive mostrar-no-formulario-e-em-meus-eventos-um` como último commit
