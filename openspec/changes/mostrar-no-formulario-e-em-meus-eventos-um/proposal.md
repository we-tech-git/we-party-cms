## Why

O produtor publica eventos com página pobre (sem foto, descrição curta, sem FAQ, sem interesses) e não sabe o que falta para a página convencer o público. Hoje o formulário (`src/app/cms/producer/new-event/_schema.ts:7`) só valida o obrigatório (título e data de início) e não orienta a qualidade da página. Tarefa no Plane: WEPARTY-251.

Contexto lido no código:

- O formulário `EventForm` (`new-event/_components/event-form.tsx`) tem duas colunas. A coluna da direita (linha 113) guarda `LivePreview` e `VisibilitySettings`; é nela que o painel novo entra.
- `LivePreview` (`live-preview.tsx:23`) já lê os campos ao vivo com `useWatch` (`photos`, `existingPhotoUrls`, `faqs`, `interestIds`). O painel novo usa o mesmo padrão.
- Os campos usados pelo checklist existem: `description` (máx. 600, `_schema.ts:9`), `faqs`, `interestIds`, `endDate`, `photos` (máx. 5) e `existingPhotoUrls`.
- O card de Meus eventos (`src/components/cms/event-card.tsx`) recebe um `EventDto` (`src/types/events.types.ts:163`) com `photos`, `description`, `endDate` (`string | null`) e `eventInterests`.
- Evidência de mercado: guias do Eventbrite recomendam página com vídeo, agenda e FAQ, e dizem que FAQ aumenta visualizações vindas de busca (alegação do próprio Eventbrite, sem verificação independente). Fonte: https://www.eventbrite.com/blog/quick-start-guide/.

Lacunas e erros da proposta original encontrados ao ler o código:

- **O `EventDto` da lista não tem FAQ.** `faq` só existe em `EventDetailDto` (`events.types.ts:240`), usado por `GET /events/{id}`. Já `GET /events/my-events` (`events.service.ts:21`) devolve `EventDto`. Logo o selo de Meus eventos não consegue, hoje, saber se há FAQ. O backend não está neste workspace; a tarefa 1.1 confere a resposta real.
- **A proposta dizia que o CMS não tem mecanismo de flag.** Tem: `src/lib/feature-flags.ts` (ex.: `NEXT_PUBLIC_FF_EVENT_INSIGHTS`). Decisão: esta fatia não usa flag (ver design.md).
- **"Data de término informada" tem sentido diferente em cada tela.** No formulário, `endDate` pode ficar vazio (o envio cai para a data de início, `buildEndDateISO`, `_schema.ts:40`). Na lista, o evento criado pelo CMS sempre chega com `endDate` preenchido. Por isso o item só é um sinal útil no formulário.
- **O limite de descrição do formulário é 600**, então 200 caracteres é alcançável.
- **O CMS não tem runner de testes unitários nem Cypress** (`package.json` sem vitest, jest ou cypress; Storybook existe na porta 6007). O E2E mora no repositório `weparty-automation`.

## What Changes

- Nova função pura `computeCompleteness(input)` em `src/lib/event-completeness.ts`. Recebe os dados do evento e devolve 5 itens (`cover`, `description`, `faq`, `interests`, `endDate`), cada um `done`, `pending` ou `unknown`, mais `doneCount` e `total = 5`.
- Duas funções finas montam a entrada: `completenessFromForm(values)` (valores do formulário) e `completenessFromEvent(event)` (`EventDto` da lista).
- Novo componente `CompletenessChecklist` em `src/components/cms/completeness-checklist.tsx` (usa `Panel`), com story `completeness-checklist.stories.tsx`. Aparece em `EventForm`, na coluna da direita, logo abaixo de `LivePreview`, atualizado ao vivo.
- Novo selo `CompletenessBadge` no mesmo arquivo, mostrado em cada card de Meus eventos como "N/5" (ou "—" quando não há dado suficiente).
- `src/types/events.types.ts`: `EventDto` ganha `faq?: EventFaqDto[]` (opcional). Se o backend não enviar, o selo mostra "—" em vez de um número falso.
- i18n em `src/i18n/locales/pt-BR.ts` e `en-US.ts`: bloco novo `completeness`.
- Nada bloqueia salvar ou publicar.

## Fora de escopo

- Nota ou score de SEO, sugestões por IA, bloquear publicação, gamificação.
- Itens que dependem de backend novo (line-up, link de ingressos, lotes).
- Qualquer persistência no servidor e qualquer mudança no backend, inclusive incluir `faq` na resposta de `GET /events/my-events` (se faltar, vira achado para outra tarefa).
- Feature flag nova.
- Criar runner de testes unitários no CMS (decisão separada, já no backlog).

## Capabilities

### New Capabilities
- `event-completeness`: checklist de completude (5 itens) da página do evento, no formulário de evento e como selo "N/5" em Meus eventos.

## Impact

- **Arquivos (CMS):** `src/lib/event-completeness.ts` (novo), `src/components/cms/completeness-checklist.tsx` (novo), `src/components/cms/completeness-checklist.stories.tsx` (novo), `src/app/cms/producer/new-event/_components/event-form.tsx`, `src/components/cms/event-card.tsx`, `src/types/events.types.ts`, `src/i18n/locales/pt-BR.ts`, `src/i18n/locales/en-US.ts`.
- **Backend:** nenhuma mudança. Dependência opcional: `GET /events/my-events` devolver `faq` por evento; sem isso o selo mostra "—".
- **Testes:** sem runner unitário no CMS; a função pura é coberta por E2E Cypress em `weparty-automation` (PR separado) e pela story; no CMS rodar `yarn lint`, `yarn type-check`, `yarn build`.
- **Como reverter:** o CMS não usa flag para esta fatia. Reverter o PR remove o painel e o selo; nenhum dado nem API muda.
