## Why

O CMS atual usa estilos genéricos do shadcn/ui sem identidade visual própria. O mockup HTML entregue pelo time de design define um sistema completo de cores, tipografia e componentes com a identidade WeParty — é hora de aplicá-lo ao sistema real para que o espaço do produtor seja elegante e consistente.

## What Changes

- Adicionar fontes `Bricolage Grotesque` e `Hanken Grotesk` como tipografia oficial do sistema
- Estender o tema Tailwind v4 com as CSS custom properties do design system WeParty (gradiente de marca, paleta de cores semânticas, sombras e radii padronizados)
- Substituir o `globals.css` atual pelo tema WeParty mantendo compatibilidade com shadcn/ui
- Redesenhar a sidebar do produtor com ícones SVG, seções "Crescimento" e "Público", e card promo de IA
- Criar a `TopBar` fixa com busca, notificações e avatar do usuário
- Construir a tela de dashboard do produtor (`/cms/home`) com:
  - Saudação com avatar e métricas de destaque da semana
  - Linha de KPIs (Pessoas alcançadas, Impressões, Visualizações, Curtidas)
  - Card "Spotlight" do evento em destaque com índice de popularidade
  - Gráfico de área "Crescimento de alcance" com segmentos 7D / 30D / 90D / 1A
  - Funil de jornada de engajamento
  - Lista "Seus eventos" com mini progresso de popularidade
  - Coluna direita: Sugestões da IA + Atividade recente
  - *(Seção "Alcance na descoberta" excluída desta entrega)*

## Capabilities

### New Capabilities

- `design-system-tokens`: Paleta de cores, tipografia, sombras e radii do design WeParty exportados como CSS variables e extensões de tema Tailwind
- `cms-topbar`: Barra de navegação superior fixa com busca, notificações e avatar
- `producer-sidebar`: Sidebar do espaço do produtor redesenhada com ícones e seções
- `producer-dashboard`: Tela inicial do produtor com KPIs, spotlight do evento, gráfico de alcance, funil de engajamento, lista de eventos, sugestões de IA e atividade recente

### Modified Capabilities

_(nenhuma especificação existente afetada)_

## Impact

- `src/app/globals.css` — substituído com o novo tema WeParty
- `src/app/layout.tsx` — carregamento das novas fontes via `next/font/google`
- `src/components/cms/sidebar.tsx` — redesenhado por completo
- `src/components/cms/topbar.tsx` — novo componente
- `src/app/cms/layout.tsx` — integrar topbar e ajustar shell grid
- `src/app/cms/home/page.tsx` — substituído pelo dashboard do produtor
- Novos componentes de UI em `src/components/dashboard/` para KpiCard, SpotlightCard, ReachChart, EngagementFunnel, EventRow, AiSuggestions, ActivityInbox
