# Proposal: Producer Dashboard Integration

## Why

O dashboard do produtor (`/cms/home`) exibe atualmente dados mockados — métricas de alcance, visualizações, curtidas e compartilhamentos são valores fixos no código. O backend implementou `GET /events/my-dashboard` (Change `2026-06-11-producer-dashboard`) que agrega essas métricas reais. Esta integração conecta os dados reais ao dashboard existente.

## What Changes

- Novo tipo `ProducerDashboardResponse` em `src/types/events.types.ts`
- Nova função `getMyDashboard()` em `src/services/events.service.ts`
- Novo hook `useProducerDashboard()` em `src/hooks/use-producer-dashboard.ts` (TanStack Query)
- `ReachChart` passa a aceitar `growthChart` como prop e renderiza os 30 pontos reais
- `EngagementFunnel` passa a aceitar métricas reais (`totalViews`, `totalLikes`, `totalAttendances`, `totalShares`) como props
- `home/page.tsx` consome o hook e substitui todos os valores mockados por dados da API
- Saudação dinâmica com `peopleReached` real

## Capabilities

### New Capabilities

- `producer-dashboard-data`: Busca e exibe métricas reais do produtor autenticado via `GET /events/my-dashboard`, incluindo KPIs, gráfico de crescimento de alcance e funil de engajamento.

### Modified Capabilities

<!-- Nenhuma spec existente é afetada — é a primeira integração de dados reais no CMS. -->

## Impact

- `src/types/events.types.ts` — novo arquivo
- `src/services/events.service.ts` — novo arquivo
- `src/hooks/use-producer-dashboard.ts` — novo arquivo
- `src/components/dashboard/reach-chart.tsx` — alterado (aceita props)
- `src/components/dashboard/engagement-funnel.tsx` — alterado (aceita props)
- `src/app/cms/home/page.tsx` — alterado (substitui mocks por dados reais)
- Dependência de runtime: `@tanstack/react-query` (já instalado)
- Endpoint externo: `GET https://api.dev.wepartyapp.com/events/my-dashboard`
