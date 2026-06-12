# Tasks: Producer Dashboard Integration

## 1. Camada de dados

- [x] 1.1 Criar `src/types/events.types.ts` com `ProducerDashboardGrowthPoint` e `ProducerDashboardResponse`
- [x] 1.2 Criar `src/services/events.service.ts` com `getMyDashboard(refresh?: boolean)` usando `axiosInstance`
- [x] 1.3 Criar `src/hooks/use-producer-dashboard.ts` com `useProducerDashboard(refresh?)` — TanStack Query, `staleTime: 300_000`, queryKey `['producer-dashboard']`

## 2. Componentes — aceitar props reais

- [x] 2.1 Atualizar `ReachChart` para aceitar prop `growthChart?: ProducerDashboardGrowthPoint[]` e usá-la como dados do período "30D"
- [x] 2.2 Atualizar `EngagementFunnel` para aceitar props `totalViews?`, `totalLikes?`, `totalAttendances?`, `totalShares?` e substituir os valores mockados internos

## 3. Dashboard — substituir mocks por dados reais

- [x] 3.1 Em `home/page.tsx`, consumir `useProducerDashboard()` e mapear `peopleReached`, `totalViews`, `totalLikes`, `totalShares` para os KPI cards
- [x] 3.2 Atualizar saudação para exibir `peopleReached` real formatado
- [x] 3.3 Passar `growthChart` para `ReachChart`
- [x] 3.4 Passar `totalViews`, `totalLikes`, `totalAttendances`, `totalShares` para `EngagementFunnel`
- [x] 3.5 Adicionar loading state nos KPI cards (exibir `—` ou skeleton enquanto `isLoading`)

## 5. topEvent — SpotlightCard dinâmico

- [x] 5.1 Atualizar `src/types/events.types.ts` com `TopEventDto`, `RecentEventDto` e campos correspondentes em `ProducerDashboardResponse`
- [x] 5.2 Atualizar `SpotlightCard` para aceitar `topEvent?: TopEventDto | null` e renderizar com dados reais quando presente
- [x] 5.3 Adicionar estado vazio ao `SpotlightCard` quando `topEvent === null`
- [x] 5.4 Tornar a seção de progressão do `EventRow` opcional para suportar linhas sem score de popularidade
- [x] 5.5 Adicionar helper `mapRecentEvent(ev: RecentEventDto)` em `home/page.tsx` para converter DTO em props do `EventRow`
- [x] 5.6 Em `home/page.tsx`, passar `topEvent={data?.topEvent}` para `SpotlightCard` e substituir `events` mock por `data?.recentEvents` mapeados

## 6. Validação — spotlight e eventos recentes

- [ ] 6.1 Verificar que `SpotlightCard` exibe dados reais do `topEvent` (título, localização, data, alcance, stats)
- [ ] 6.2 Verificar que a lista "Seus eventos" exibe `recentEvents` reais
- [ ] 6.3 Verificar estado vazio quando `topEvent === null` e `recentEvents === []`

## 4. Validação

- [x] 4.1 Verificar que o dashboard exibe dados reais ao acessar `/cms/home` autenticado como produtor
- [x] 4.2 Verificar que `ReachChart` no período "30D" renderiza os pontos do `growthChart` da API
- [x] 4.3 Verificar que `EngagementFunnel` exibe métricas reais
- [x] 4.4 Verificar loading state enquanto requisição está em andamento
- [x] 4.5 Verificar que o hook não refaz requisição ao navegar dentro de 5 minutos (cache)
