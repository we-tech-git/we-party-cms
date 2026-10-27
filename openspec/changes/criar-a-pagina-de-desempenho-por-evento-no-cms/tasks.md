## 1. Flag, tipos, service e hook

- [ ] 1.1 Criar `src/lib/feature-flags.ts` exportando `EVENT_INSIGHTS_ENABLED = process.env.NEXT_PUBLIC_FF_EVENT_INSIGHTS === 'true'` (referência literal, para o Next embutir no bundle)
- [ ] 1.2 Em `src/types/events.types.ts`, adicionar `EventFunnelConversionsDto` (`likesPerView`, `favoritesPerView`, `interestedPerView`, `confirmationRate`, `sharesPerView`: `number | null`) e `EventFunnelDto` (`eventId: string`, `views`, `likes`, `favorites`, `interested`, `going`, `shares`: `number`, `conversions`)
- [ ] 1.3 Em `src/services/events.service.ts`, adicionar `getEventFunnel(eventId: string): Promise<EventFunnelDto>` com `axiosInstance.get` em `/events/${eventId}/funnel`
- [ ] 1.4 Criar `src/hooks/use-event-funnel.ts` com `useEventFunnel(id)`: `useQuery` com chave `['event-funnel', id]`, `enabled: !!id`, `staleTime: 30_000` e `retry` falso quando o erro é axios com status 403 ou 404

## 2. Componente do funil

- [ ] 2.1 Em `src/components/dashboard/engagement-funnel.tsx`, extrair e exportar `FunnelBars({ steps })` (tipo `FunnelStep` já existe no arquivo) com o JSX das barras (linhas 57-74); `EngagementFunnel` passa a montar as 4 etapas e chamar `FunnelBars`, sem mudar props, rótulos, cores nem `data-testid="engagement-funnel"`
- [ ] 2.2 Conferir que `src/app/cms/home/page.tsx` não precisa de alteração e que o resultado de `/cms/home` é o mesmo (mesmos textos e taxas)

## 3. Página de desempenho

- [ ] 3.1 Ler `node_modules/next/dist/docs/` sobre `params` assíncrono e `redirect` antes de escrever a página
- [ ] 3.2 Criar `src/app/cms/producer/events/[id]/insights/page.tsx` (Server Component): se `!EVENT_INSIGHTS_ENABLED`, `redirect('/cms/producer/my-events')`; senão renderiza `<InsightsView eventId={id} />`
- [ ] 3.3 Criar `src/app/cms/producer/events/[id]/insights/_components/insights-view.tsx` (`'use client'`): usa `useEventFunnel`; `PageHeader` com `BackButton fallback="/cms/producer/my-events"`; estados carregando, erro (403/404 com voltar; outros com "Tentar novamente" via `refetch`), vazio (`EmptyState` quando as seis contagens são 0) e dados
- [ ] 3.4 No estado de dados, `Panel` + `PanelHeader` + `FunnelBars` com 6 etapas na ordem da spec; taxa formatada com helper local `fmtRate(r: number | null)` (`null` → "—"; senão `(r * 100).toFixed(1).replace('.', ',') + '%'`); larguras relativas ao maior valor entre as seis contagens
- [ ] 3.5 `data-testid` estáveis: `insights-page`, `insights-loading`, `insights-empty`, `insights-error`, `insights-retry`, `insights-back`, `insights-step-views|likes|favorites|interested|going|shares` e `insights-rate-<etapa>`

## 4. Entrada em Meus eventos

- [ ] 4.1 Em `src/components/cms/event-card.tsx`, adicionar a prop opcional `onInsights?: (event: EventDto) => void` e, só quando definida, o item `{ label: t("myEvents.card.viewInsights"), icon: <ChartNoAxesColumn />, act: () => onInsights(event), testid }` em `menuItems`, com `data-testid="event-insights"`
- [ ] 4.2 Em `src/app/cms/producer/my-events/page.tsx`, passar `onInsights={EVENT_INSIGHTS_ENABLED ? e => router.push(\`/cms/producer/events/${e.id}/insights\`) : undefined}` ao `EventCard`
- [ ] 4.3 Atualizar `src/components/cms/event-card.stories.tsx` com a variante com `onInsights`

## 5. Textos (i18n)

- [ ] 5.1 Em `src/i18n/locales/pt-BR.ts`: `myEvents.card.viewInsights: 'Ver desempenho'` e um bloco `insights` com título, rótulos das seis etapas, rótulos das taxas ("das visualizações", "de quem se interessou ou confirmou"), "Carregando desempenho…", "Este evento ainda não teve interação", "Evento não encontrado ou sem acesso", "Não foi possível carregar o desempenho", "Tentar novamente" e "Voltar para Meus eventos"
- [ ] 5.2 Em `src/i18n/locales/en-US.ts`: as mesmas chaves em inglês (o tipo `Dictionary` reprova chave faltando)

## 6. Documentação

- [ ] 6.1 Em `AGENTS.md`, seção de variáveis de ambiente: adicionar `NEXT_PUBLIC_FF_EVENT_INSIGHTS` (ligada só com `true`; build-time; padrão desligada)

## 7. Verificação

- [ ] 7.1 `yarn lint`, `yarn type-check` e `yarn build` passam; `yarn build-storybook` passa
- [ ] 7.2 Com a flag desligada: item "Ver desempenho" ausente e `/cms/producer/events/<id>/insights` redireciona para `my-events`
- [ ] 7.3 Com a flag ligada e o backend com `GET /events/{id}/funnel`: conferir com um produtor de teste que as seis contagens e taxas batem com o banco, e que o estado de erro aparece para um evento de outro produtor
- [ ] 7.4 Conferir `/cms/home`: funil idêntico ao de antes
- [ ] 7.5 Conferir layout em desktop e em mobile (barra inferior, sem rolagem horizontal)
- [ ] 7.6 Atualizar o Figma (Venus Design) para o item de menu e a lista de etapas do funil, ou declarar a pendência no PR e abrir a tarefa

## 8. Teste automatizado (repositório `weparty-automation`, PR separado)

- [ ] 8.1 Fixture `cypress/fixtures/cms/event-funnel.json` (dados com 200/40/10/15/5/8) e variantes vazia e de erro
- [ ] 8.2 Page object e spec em `cypress/e2e/cms/` com `cy.intercept`: layout desktop e mobile, estados carregando/vazio/erro (403 e 500 com retry), navegação a partir do menu de `my-events`, e flag desligada (item ausente e redirecionamento)
- [ ] 8.3 Rodar `cms-smoke` e os specs de `my-events` e do dashboard, que tocam os componentes alterados

## 9. Encerramento

- [ ] 9.1 Rodar `openspec archive criar-a-pagina-de-desempenho-por-evento-no-cms` como último commit, para a capability entrar em `openspec/specs/event-insights-page/`
