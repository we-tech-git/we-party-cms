## MODIFIED Requirements

### Requirement: Criar evento a partir do dashboard

O sistema SHALL navegar para `/cms/producer/new-event` ao clicar em "Criar evento" no dashboard do produtor.

O sistema SHALL exibir badge dinâmica "Meus eventos" na sidebar com o total real de eventos do produtor (`total` retornado por `GET /events/my-events`), substituindo o valor hardcoded `'3'` atual.

#### Scenario: Botão Criar evento navega para nova tela

- **WHEN** o produtor clica no botão "Criar evento" no dashboard
- **THEN** o navegador redireciona para `/cms/producer/new-event`

#### Scenario: Botão no spotlight-card vazio também navega

- **WHEN** não há evento em destaque e o produtor clica em "Criar evento" no SpotlightCard
- **THEN** o navegador redireciona para `/cms/producer/new-event`

#### Scenario: Badge "Meus eventos" na sidebar exibe total real

- **WHEN** o usuário acessa qualquer página do CMS após dados de my-events serem carregados
- **THEN** o badge ao lado de "Meus eventos" na sidebar exibe o total real de eventos do produtor
