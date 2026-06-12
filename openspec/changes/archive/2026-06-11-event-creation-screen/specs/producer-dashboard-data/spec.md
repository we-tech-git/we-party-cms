## MODIFIED Requirements

### Requirement: Criar evento a partir do dashboard
O sistema SHALL navegar para `/cms/producer/new-event` ao clicar em "Criar evento" no dashboard do produtor.

#### Scenario: Botão Criar evento navega para nova tela
- **WHEN** o produtor clica no botão "Criar evento" no dashboard
- **THEN** o navegador redireciona para `/cms/producer/new-event`

#### Scenario: Botão no spotlight-card vazio também navega
- **WHEN** não há evento em destaque e o produtor clica em "Criar evento" no SpotlightCard
- **THEN** o navegador redireciona para `/cms/producer/new-event`
