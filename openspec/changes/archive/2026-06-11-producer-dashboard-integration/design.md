# Design: Producer Dashboard Integration

## Context

O dashboard em `src/app/cms/home/page.tsx` foi construído com dados completamente mockados (constantes no topo do arquivo). O backend já implementou `GET /events/my-dashboard` que retorna métricas reais agregadas do produtor autenticado. A integração é direta: criar a camada de dados (types → service → hook) e atualizar os componentes para aceitar props em vez de ler constantes internas.

Padrão estabelecido no projeto: `auth.types.ts` → `auth.service.ts` (axiosInstance) → componente com TanStack Query. Este change segue exatamente o mesmo padrão.

## Goals / Non-Goals

**Goals:**
- Substituir todos os valores mockados do dashboard por dados reais do endpoint
- Manter os componentes `ReachChart` e `EngagementFunnel` reutilizáveis via props (não acoplados ao hook)
- Adicionar estados de loading (skeleton) e erro visíveis ao usuário
- Não alterar o visual existente — apenas trocar os dados

**Non-Goals:**
- Gráfico multi-período com dados reais (o endpoint só retorna 30 dias; os outros períodos da UI — 7D, 90D, 1A — continuarão mockados por ora)
- Lista de eventos reais no card "Seus eventos" (endpoint diferente, escopo futuro)
- SpotlightCard com evento destaque real (idem)

## Decisions

### Componentes recebem props em vez de ler hook internamente

`ReachChart` e `EngagementFunnel` passam a aceitar métricas como props opcionais com fallback para os valores mockados atuais.

**Por quê:** Desacopla visualização de data-fetching. Componentes ficam testáveis isoladamente e reutilizáveis em outros contextos (ex.: admin visualizando dashboard de outro produtor).

### Hook em `src/hooks/use-producer-dashboard.ts`

TanStack Query com `staleTime: 5 * 60 * 1000` (5 minutos) — alinhado com o TTL do cache do backend.

**Por quê:** Evita requisições desnecessárias. O backend já armazena em cache por 5 minutos; o frontend igualar o `staleTime` garante que ambos se renovem juntos.

### `growthChart` alimenta apenas o período "30D" do `ReachChart`

Os outros períodos (7D, 90D, 1A) mantêm dados mockados.

**Por quê:** O endpoint retorna apenas 30 dias. Expandir para outros períodos requer mudanças no backend (fora do escopo).

### Loading state com skeleton inline, sem componente separado

Texto "Carregando..." nos KPI cards e valores `—` no lugar dos números enquanto `isLoading`.

**Por quê:** O dashboard já tem estrutura visual bem definida; um skeleton simples é suficiente para a fase atual sem adicionar dependências.

## Risks / Trade-offs

- **Fallback para mocks em erro de rede:** Se a API retornar erro, o dashboard exibirá `—` nos valores em vez dos dados antigos. Aceitável para dashboard analítico — evita exibir números desatualizados como se fossem corretos.
- **`growthChart` como proxy de alcance:** Conforme documentado no backend, o gráfico usa `EventAttendance.createdAt`, não views reais. Usuários que viram mas não confirmaram presença não aparecem. Aceitável até existir rastreamento de views por usuário.
- **Período "30D" sem agregação própria:** O `ReachChart` na aba 30D passa a mostrar novos `peopleReached` por dia (de `growthChart`), não o total acumulado. A semântica muda levemente mas é mais precisa.

## Open Questions

- Os KPI de "Impressões na descoberta" (128k) não tem campo no endpoint (foi declarado Non-Goal no backend). Manter como mock ou remover o card?
  - **Decisão provisória:** Manter o card mas marcar visualmente como "em breve" ou omitir o valor de trend. Não bloqueia esta entrega.
