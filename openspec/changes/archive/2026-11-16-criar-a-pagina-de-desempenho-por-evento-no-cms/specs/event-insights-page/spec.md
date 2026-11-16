## ADDED Requirements

### Requirement: Página de desempenho mostra as seis etapas com taxas

A rota `/cms/producer/events/[id]/insights` SHALL buscar `GET /events/{id}/funnel` e exibir, em ordem, Visualizações, Curtidas, Favoritos, Interessados, Confirmados (`going`) e Compartilhamentos. Cada etapa, exceto Visualizações, SHALL exibir sua taxa de `conversions` em porcentagem pt-BR com uma casa decimal. Taxa `null` SHALL aparecer como "—", nunca "0,0%". O CMS SHALL NOT recalcular as taxas.

#### Scenario: Evento com dados em todas as etapas

- **GIVEN** a resposta `views = 200`, `likes = 40`, `favorites = 10`, `interested = 15`, `going = 5`, `shares = 8` e `conversions = { likesPerView: 0.2, favoritesPerView: 0.05, interestedPerView: 0.075, confirmationRate: 0.25, sharesPerView: 0.04 }`
- **WHEN** o produtor abre `/cms/producer/events/evt-1/insights`
- **THEN** as seis etapas aparecem na ordem acima com os valores 200, 40, 10, 15, 5 e 8
- **AND** as taxas exibidas são "20,0%", "5,0%", "7,5%", "25,0%" e "4,0%"

#### Scenario: Taxa sem base de cálculo

- **GIVEN** a resposta com `views = 0`, `likes = 3`, `going = 2` e `conversions.likesPerView = null`
- **WHEN** a página é renderizada
- **THEN** a taxa de Curtidas mostra "—"

#### Scenario: Taxa acima de 100%

- **GIVEN** a resposta com `views = 4`, `likes = 10` e `conversions.likesPerView = 2.5`
- **WHEN** a página é renderizada
- **THEN** a taxa de Curtidas mostra "250,0%"

### Requirement: Estados de carregamento, vazio e erro

A página SHALL exibir um estado de carregamento enquanto a consulta está em andamento, um estado vazio quando as seis contagens são 0 e um estado de erro quando a consulta falha. O estado vazio SHALL NOT exibir as seis barras. O estado de erro por 403 ou 404 SHALL oferecer voltar para `/cms/producer/my-events`; qualquer outro erro SHALL oferecer "Tentar novamente", que repete a consulta.

#### Scenario: Carregando

- **WHEN** a requisição `GET /events/evt-1/funnel` ainda não respondeu
- **THEN** a página mostra "Carregando desempenho…"
- **AND** nenhuma barra é exibida

#### Scenario: Evento sem interação

- **GIVEN** a resposta com as seis contagens iguais a 0 e as cinco taxas `null`
- **WHEN** a página é renderizada
- **THEN** a página mostra "Este evento ainda não teve interação"
- **AND** as barras do funil não aparecem

#### Scenario: Evento de outro produtor

- **GIVEN** a resposta 403 para `GET /events/evt-9/funnel`
- **WHEN** o produtor abre `/cms/producer/events/evt-9/insights`
- **THEN** a página mostra "Evento não encontrado ou sem acesso" e um botão que leva a `/cms/producer/my-events`
- **AND** a consulta não é repetida automaticamente

#### Scenario: Falha do servidor

- **GIVEN** a resposta 500 para `GET /events/evt-1/funnel`
- **WHEN** a página é renderizada
- **THEN** a página mostra "Não foi possível carregar o desempenho" e o botão "Tentar novamente"
- **AND** ao clicar no botão a requisição é feita de novo

### Requirement: Entrada pela lista Meus eventos

O cartão de evento SHALL exibir o item de menu "Ver desempenho" somente quando recebe a prop `onInsights`, e `my-events/page.tsx` SHALL passar `onInsights` somente quando a flag `NEXT_PUBLIC_FF_EVENT_INSIGHTS` está ligada. Ao ativar o item, o CMS SHALL navegar para `/cms/producer/events/{id}/insights` do evento do cartão.

#### Scenario: Flag ligada

- **GIVEN** `NEXT_PUBLIC_FF_EVENT_INSIGHTS=true` e um cartão do evento `evt-1`
- **WHEN** o produtor abre o menu do cartão e escolhe "Ver desempenho"
- **THEN** o navegador vai para `/cms/producer/events/evt-1/insights`

#### Scenario: Flag desligada

- **GIVEN** `NEXT_PUBLIC_FF_EVENT_INSIGHTS` ausente ou diferente de `true`
- **WHEN** o produtor abre o menu de qualquer cartão em `/cms/producer/my-events`
- **THEN** o item "Ver desempenho" não aparece
- **AND** os demais itens do menu continuam iguais

### Requirement: Feature flag NEXT_PUBLIC_FF_EVENT_INSIGHTS

O sistema SHALL tratar a flag como ligada somente quando `process.env.NEXT_PUBLIC_FF_EVENT_INSIGHTS` for exatamente `"true"`, lida em um único módulo (`src/lib/feature-flags.ts`). Com a flag desligada, a rota `/cms/producer/events/[id]/insights` SHALL redirecionar para `/cms/producer/my-events` antes de renderizar a tela e SHALL NOT chamar `GET /events/{id}/funnel`.

#### Scenario: Acesso direto com a flag desligada

- **GIVEN** a flag desligada
- **WHEN** o produtor abre a URL `/cms/producer/events/evt-1/insights`
- **THEN** é redirecionado para `/cms/producer/my-events`
- **AND** nenhuma requisição a `/events/evt-1/funnel` é feita

#### Scenario: Valor diferente de "true"

- **GIVEN** `NEXT_PUBLIC_FF_EVENT_INSIGHTS=1`
- **WHEN** o produtor abre `/cms/producer/events/evt-1/insights`
- **THEN** a flag é considerada desligada e ele é redirecionado para `/cms/producer/my-events`

#### Scenario: Acesso sem login

- **GIVEN** a flag ligada e nenhum cookie `access_token`
- **WHEN** alguém abre `/cms/producer/events/evt-1/insights`
- **THEN** `src/proxy.ts` redireciona para `/login`

### Requirement: Funil da home não muda

O componente `EngagementFunnel` SHALL manter as props `totalViews`, `totalLikes`, `totalConfirmed` e `totalShares`, as quatro barras, os rótulos e as taxas atuais depois de passar a usar o componente compartilhado `FunnelBars`.

#### Scenario: Home com os mesmos dados de antes

- **GIVEN** uma resposta do dashboard com `totalViews = 1000`, `totalLikes = 200`, `totalConfirmed = 50` e `totalShares = 10`
- **WHEN** `/cms/home` é renderizada
- **THEN** o funil mostra as barras Visualizações, Curtidas, Confirmados e Compartilhamentos com as taxas "20,0%", "25,0%" e "20,0%", iguais às de antes da mudança

#### Scenario: Confirmados ausente continua "—"

- **GIVEN** uma resposta do dashboard sem `totalConfirmed`
- **WHEN** `/cms/home` é renderizada
- **THEN** a barra Confirmados mostra "—"
