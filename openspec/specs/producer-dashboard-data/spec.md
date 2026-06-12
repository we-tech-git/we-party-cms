# Spec: producer-dashboard-data

## Purpose

Define os requisitos para integração do dashboard do produtor com dados reais da API (`GET /events/my-dashboard`), substituindo valores mockados por métricas e conteúdo dinâmico.

## Requirements

### Requirement: Dashboard exibe métricas reais do produtor

O sistema SHALL buscar métricas do produtor autenticado via `GET /events/my-dashboard` e exibir os valores reais nos KPI cards do dashboard (`/cms/home`).

Os campos exibidos SHALL mapear da seguinte forma:
- `peopleReached` → KPI "Pessoas alcançadas"
- `totalViews` → KPI "Visualizações"
- `totalLikes` → KPI "Curtidas"
- `totalShares` → KPI "Compartilhamentos"

#### Scenario: Dashboard carregado com sucesso

- **WHEN** usuário com role `promoter` ou `admin` acessa `/cms/home`
- **THEN** o sistema exibe os valores reais de `peopleReached`, `totalViews`, `totalLikes` e `totalShares` nos KPI cards correspondentes

#### Scenario: Loading state enquanto dados são buscados

- **WHEN** a requisição `GET /events/my-dashboard` está em andamento
- **THEN** os KPI cards exibem indicador de carregamento no lugar dos valores

#### Scenario: Erro na requisição

- **WHEN** `GET /events/my-dashboard` retorna erro (rede, 5xx, 401)
- **THEN** o dashboard exibe `—` nos campos numéricos sem travar a página

### Requirement: Gráfico de crescimento usa dados reais de 30 dias

O componente `ReachChart` SHALL aceitar o array `growthChart` (30 pontos `{ date, peopleReached }`) e renderizá-lo no período "30D".

O eixo do gráfico SHALL ser construído a partir dos valores `peopleReached` de cada ponto do array, ordenados cronologicamente.

#### Scenario: Período 30D com dados reais

- **WHEN** o hook `useProducerDashboard` retorna dados com sucesso
- **THEN** o `ReachChart` no período "30D" renderiza os 30 pontos de `growthChart` como linha do gráfico

#### Scenario: Período diferente de 30D

- **WHEN** o usuário seleciona "7D", "90D" ou "1A" no seletor de período
- **THEN** o gráfico exibe dados estáticos (comportamento atual mantido)

### Requirement: Funil de engajamento usa métricas reais

O componente `EngagementFunnel` SHALL aceitar `totalViews`, `totalLikes`, `totalAttendances` e `totalShares` como props e exibi-los nas barras do funil.

#### Scenario: Funil renderizado com dados da API

- **WHEN** o hook `useProducerDashboard` retorna dados com sucesso
- **THEN** o `EngagementFunnel` exibe os valores reais nos passos "Visualizações", "Curtidas", "Confirmados" e "Compartilhamentos"

### Requirement: Saudação com pessoas alcançadas real

A mensagem de boas-vindas no topo do dashboard SHALL exibir o valor real de `peopleReached` retornado pela API.

#### Scenario: Saudação com dado real

- **WHEN** a resposta da API inclui `peopleReached`
- **THEN** a saudação exibe o valor formatado (ex.: "38,2 mil") no lugar do valor mockado

#### Scenario: Saudação sem dado disponível

- **WHEN** a API ainda não retornou ou retornou erro
- **THEN** a saudação não exibe o trecho de métricas ou exibe "—"

### Requirement: Evento em destaque renderizado dinamicamente

O componente `SpotlightCard` SHALL aceitar `topEvent?: TopEventDto | null` e renderizar os dados reais do evento com maior score de engajamento do produtor.

Quando `topEvent` for fornecido, os campos SHALL mapear da seguinte forma:
- `topEvent.title` → nome do evento no hero
- `topEvent.location` → localização
- `topEvent.startDate` → data formatada (ex.: "25 Jan")
- `topEvent.totalPeopleReached` → alcance exibido como "XX,Xk pessoas"
- `topEvent.viewCount`, `totalLikes`, `totalConfirmed`, `shareCount` → linha de stats
- Score de popularidade SHALL ser derivado como taxa de engajamento: `MIN(100, ROUND((likes + comments + saves + confirmed) / MAX(viewCount, 1) * 100))`
- O campo `ageRange` SHALL ser omitido pois o backend sempre retorna `null`

Quando `topEvent` for `null`, o componente SHALL exibir um estado vazio convidando o produtor a criar seu primeiro evento.

#### Scenario: topEvent presente

- **WHEN** `GET /events/my-dashboard` retorna `topEvent` não-nulo
- **THEN** `SpotlightCard` exibe título, localização, data, alcance e stats do evento destaque com dados reais

#### Scenario: topEvent ausente

- **WHEN** `GET /events/my-dashboard` retorna `topEvent: null`
- **THEN** `SpotlightCard` exibe estado vazio com chamada para criar o primeiro evento

### Requirement: Lista de eventos recentes renderizada dinamicamente

O card "Seus eventos" SHALL exibir os itens de `recentEvents` (até 3) em vez dos dados mockados.

Cada `RecentEventDto` SHALL mapear para `EventRow` da seguinte forma:
- `startDate` → dia e mês no chip de data
- `title` → nome do evento
- `location` → localização
- `viewCount`, `totalLikes`, `totalConfirmed` → métricas inline
- Status SHALL ser derivado da `startDate`: data futura → "Agendado", data passada → "Em alta"
- A barra de popularidade SHALL ser omitida quando não houver dados de score disponíveis

Quando `recentEvents` estiver vazio, o card SHALL exibir estado vazio com link para criar evento.

#### Scenario: recentEvents com dados

- **WHEN** `GET /events/my-dashboard` retorna `recentEvents` com ao menos 1 item
- **THEN** a lista exibe os eventos reais com título, data, localização e métricas

#### Scenario: recentEvents vazio

- **WHEN** `GET /events/my-dashboard` retorna `recentEvents: []`
- **THEN** o card exibe mensagem "Nenhum evento ainda" com CTA para criar

### Requirement: Cache alinhado com TTL do backend

O hook `useProducerDashboard` SHALL configurar `staleTime: 300_000` (5 minutos) no TanStack Query, alinhado com o TTL de cache do endpoint.

#### Scenario: Requisição não repetida dentro do TTL

- **WHEN** o usuário navega para fora e volta para `/cms/home` dentro de 5 minutos
- **THEN** o hook não dispara nova requisição e usa dados em cache

### Requirement: Criar evento a partir do dashboard

O sistema SHALL navegar para `/cms/producer/new-event` ao clicar em "Criar evento" no dashboard do produtor.

#### Scenario: Botão Criar evento navega para nova tela

- **WHEN** o produtor clica no botão "Criar evento" no dashboard
- **THEN** o navegador redireciona para `/cms/producer/new-event`

#### Scenario: Botão no spotlight-card vazio também navega

- **WHEN** não há evento em destaque e o produtor clica em "Criar evento" no SpotlightCard
- **THEN** o navegador redireciona para `/cms/producer/new-event`
