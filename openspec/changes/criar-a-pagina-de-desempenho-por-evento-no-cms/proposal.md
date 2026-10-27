## Why

O produtor não consegue saber **qual evento converte mal nem em que etapa perde o público**. O único funil do CMS é o de `/cms/home` ("Jornada de engajamento", `src/components/dashboard/engagement-funnel.tsx`), que soma todos os eventos do produtor com dados de `GET /events/my-dashboard`. Em `/cms/producer` só existem `new-event`, `edit-event/[id]` e `my-events`; não há tela de desempenho de um evento. Tarefa no Plane: WEPARTY-238.

O que existe hoje, conferido no código:

- `EngagementFunnel` tem **4 barras fixas** (Visualizações, Curtidas, Confirmados, Compartilhamentos), recebe 4 props e calcula as barras e as taxas por dentro (`engagement-funnel.tsx:34-48`). A página nova precisa de **6 etapas**, então o componente precisa ser aberto para receber a lista de etapas; não dá para só reaproveitá-lo como está.
- `Panel`/`PanelHeader` (`src/components/cms/panel.tsx`) e `StatCard` (`src/components/cms/stat-card.tsx`) servem como estão. `StatCard` já mostra "—" para `null`/`undefined`.
- O cartão de evento (`src/components/cms/event-card.tsx`) tem um menu de ações (Editar, Gerenciar comentários, Ver atividades...) montado em `menuItems` (linhas 74-80). É onde o link para o desempenho entra.
- `my-events/page.tsx` já abre o drawer de atividades (`GET /events/{id}/activities`) e é a origem natural da navegação.
- **O repositório não tem mecanismo de feature flag.** Só há `NEXT_PUBLIC_API_BASE_URL` e `ORVAL_OPENAPI_URL` (`AGENTS.md`, seção de variáveis). A mudança anterior (WEPARTY-236) decidiu não criar flag por isso; esta tarefa pede `NEXT_PUBLIC_FF_EVENT_INSIGHTS` e precisa criar o primeiro uso.
- O client Orval não existe (`src/lib/api/` ausente): a integração é escrita à mão em `src/services/events.service.ts` com `axiosInstance`, e os tipos em `src/types/events.types.ts`.
- O CMS não tem suíte de testes própria (verificação = `yarn lint`, `yarn type-check`, `yarn build`). A cobertura de comportamento fica no repositório `weparty-automation` (Cypress, `cypress/e2e/cms/`).

## What Changes

- Rota nova `/cms/producer/events/[id]/insights` (`src/app/cms/producer/events/[id]/insights/page.tsx`): mostra as 6 etapas do funil do evento (visualizações, curtidas, favoritos, interessados, confirmados, compartilhamentos), cada uma com a contagem e a taxa de conversão devolvidas por `GET /events/{id}/funnel` (backend, mesma mudança).
- A página trata quatro estados: carregando, erro, vazio (evento sem interação) e dados.
- `EngagementFunnel` ganha uma parte reutilizável (`FunnelBars`) que desenha uma lista de etapas recebida por prop. `EngagementFunnel` continua com a mesma API e o mesmo visual em `/cms/home`.
- `EventCard` ganha o item de menu "Ver desempenho" (e a prop opcional `onInsights`), que só aparece quando a prop é passada. `my-events/page.tsx` só a passa com a flag ligada.
- Flag `NEXT_PUBLIC_FF_EVENT_INSIGHTS`, lida em um único módulo novo (`src/lib/feature-flags.ts`). Desligada (padrão): o item de menu não aparece e a rota redireciona para `/cms/producer/my-events`.
- Service `getEventFunnel`, tipos `EventFunnelDto` e hook `useEventFunnel`.
- Textos novos em `src/i18n/locales/pt-BR.ts` e `en-US.ts`.

## Fora de escopo

- Série temporal ou gráfico por dia, comparação entre eventos, origem do tráfego (links rastreáveis), ingressos e exportação CSV.
- Qualquer mudança no funil de `/cms/home` além de passar a usar o componente compartilhado sem mudar o resultado.
- Entrada de menu lateral ou atalho a partir do dashboard; o único ponto de entrada é `my-events`.
- Uso do client Orval (`yarn api:generate`).
- Suíte de testes do CMS; o Cypress vai em PR separado em `weparty-automation`.

## Capabilities

### New Capabilities
- `event-insights-page`: página de desempenho por evento, seus estados, o link de entrada e o controle por feature flag.

## Impact

- **Arquivos (CMS):** `src/app/cms/producer/events/[id]/insights/page.tsx` e `_components/insights-view.tsx` (novos), `src/lib/feature-flags.ts` (novo), `src/hooks/use-event-funnel.ts` (novo), `src/services/events.service.ts`, `src/types/events.types.ts`, `src/components/dashboard/engagement-funnel.tsx`, `src/components/cms/event-card.tsx` (+ story), `src/app/cms/producer/my-events/page.tsx`, `src/i18n/locales/pt-BR.ts`, `src/i18n/locales/en-US.ts`, `AGENTS.md` (lista de variáveis de ambiente).
- **Design System:** `EventCard` e o funil mudam; `AGENTS.md` exige atualizar Figma e story na mesma tarefa. Se o Figma não for atualizado, o PR declara o que ficou pendente.
- **Dependência do backend:** precisa de `GET /events/{id}/funnel` no ar. Sem ele (ou com 404 em ambiente antigo) a página mostra o estado de erro; nada mais quebra, pois a flag nasce desligada.
- **Variável de ambiente:** `NEXT_PUBLIC_FF_EVENT_INSIGHTS` (build-time). Ausente ou diferente de `true` = desligada.
- **Como reverter:** desligar a flag na Vercel e fazer novo build (variáveis `NEXT_PUBLIC_` são embutidas no build, então só redeploy muda o valor). Para remover o código, reverter o PR; não há dado nem migration.
