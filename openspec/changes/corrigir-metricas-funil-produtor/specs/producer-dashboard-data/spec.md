## MODIFIED Requirements

### Requirement: Funil de engajamento usa métricas reais

O componente `EngagementFunnel` SHALL aceitar `totalViews`, `totalLikes`, `totalConfirmed` e `totalShares` como props e exibi-los nas barras do funil. A barra "Confirmados" SHALL exibir `totalConfirmed` (participações com status `GOING`) e SHALL NOT usar `totalAttendances`.

#### Scenario: Funil renderizado com dados da API

- **WHEN** o hook `useProducerDashboard` retorna dados com sucesso, incluindo `totalConfirmed`
- **THEN** o `EngagementFunnel` exibe os valores reais nos passos "Visualizações", "Curtidas", "Confirmados" e "Compartilhamentos"
- **AND** o passo "Confirmados" mostra o valor de `totalConfirmed`

#### Scenario: Confirmados difere do total de participações

- **GIVEN** uma resposta com `totalAttendances = 7` e `totalConfirmed = 3`
- **WHEN** o funil é renderizado
- **THEN** a barra "Confirmados" mostra 3

#### Scenario: Resposta sem totalConfirmed

- **GIVEN** uma resposta do dashboard (por exemplo, guardada em cache antes do deploy do backend) sem o campo `totalConfirmed`
- **WHEN** o funil é renderizado
- **THEN** a barra "Confirmados" mostra "—"
- **AND** o valor de `totalAttendances` não é usado no lugar
