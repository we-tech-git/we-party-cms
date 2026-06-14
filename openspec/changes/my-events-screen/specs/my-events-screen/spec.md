## ADDED Requirements

### Requirement: Listagem de eventos do produtor

O sistema SHALL buscar todos os eventos do produtor autenticado via `GET /events/my-events?limit=100` e exibi-los na página `/cms/producer/my-events`.

O sistema SHALL exibir cada evento como um card contendo: imagem de capa (ou gradiente fallback), badge de status, título, data formatada, local, chips de interesses, estatísticas (views, likes, confirmações, compartilhamentos) e barra de popularidade calculada localmente.

O cálculo de popularidade SHALL usar a fórmula: `score = _count.likes * 3 + _count.comments * 2 + _count.attendances * 2.5`, normalizado pelo score máximo da lista (0–100).

Eventos sem `photos[]` SHALL exibir gradiente CSS de fallback determinístico baseado no `id` do evento.

#### Scenario: Produtor com eventos

- **WHEN** usuário com role `promoter` ou `admin` acessa `/cms/producer/my-events`
- **THEN** o sistema exibe todos os eventos do produtor em cards com dados reais da API

#### Scenario: Produtor sem eventos

- **WHEN** `GET /events/my-events` retorna `total: 0`
- **THEN** o sistema exibe o estado vazio com CTA para criar o primeiro evento

#### Scenario: Loading state

- **WHEN** a requisição está em andamento
- **THEN** o sistema exibe indicador de carregamento no lugar dos cards

### Requirement: Filtro por status (tabs)

O sistema SHALL exibir tabs de filtro que filtram os eventos client-side sem nova requisição.

As tabs SHALL ser: **Todos** (exclui arquivados), **Em alta** (PUBLISHED com startDate ≤ agora), **Rascunhos** (DRAFT), **Agendados** (PUBLISHED com startDate > agora), **Encerrados** (COMPLETED), **Arquivados** (CANCELLED).

Cada tab SHALL exibir a contagem de eventos correspondente.

#### Scenario: Filtro por tab

- **WHEN** o usuário clica em uma tab de status
- **THEN** a lista exibe apenas eventos cujo status mapeado corresponde ao filtro, sem novo fetch

#### Scenario: Tab "Todos" exclui arquivados

- **WHEN** o usuário está na tab "Todos"
- **THEN** eventos com status `CANCELLED` não aparecem na listagem

### Requirement: Busca por título

O sistema SHALL filtrar os eventos client-side com base no texto digitado no campo de busca, comparando com o título do evento (case-insensitive, busca parcial).

#### Scenario: Busca com resultado

- **WHEN** o usuário digita "beach" no campo de busca
- **THEN** apenas eventos cujo título contém "beach" (sem distinção de maiúsculas) são exibidos

#### Scenario: Busca sem resultado

- **WHEN** nenhum evento corresponde à busca
- **THEN** o estado vazio é exibido com mensagem "Nenhum evento encontrado"

### Requirement: Ordenação da lista

O sistema SHALL permitir alternar entre dois modos de ordenação via botão toggle:

- **Mais recentes**: ordenado por `createdAt` decrescente (padrão)
- **Mais populares**: ordenado pelo score de popularidade calculado, decrescente

A ordenação SHALL ser aplicada sobre a lista já filtrada por tab e busca.

#### Scenario: Alternância de ordenação

- **WHEN** o usuário clica no botão de ordenação
- **THEN** a lista reordena entre "Mais recentes" e "Mais populares" sem novo fetch

### Requirement: Alternância entre modo grid e lista

O sistema SHALL permitir exibir os cards em layout grid (múltiplas colunas) ou lista (coluna única, card horizontal).

#### Scenario: Toggle de view

- **WHEN** o usuário clica no botão de toggle de visualização
- **THEN** a grade alterna entre layout grid e lista sem novo fetch

### Requirement: Ações por evento — menu de contexto

Cada card SHALL ter um menu de contexto (3 pontos) com as seguintes ações:

- **Ver página pública**: navegação externa para a página pública do evento (URL: `/events/:id` — sem implementação de URL real nesta versão, ação placeholder)
- **Editar evento**: navega para `/cms/producer/new-event` (rota de edição futura; nesta versão navega para a mesma rota de criação)
- **Impulsionar alcance**: desabilitado (sem endpoint disponível)
- **Gerenciar comentários**: abre o drawer de comentários do evento
- **Duplicar**: desabilitado (sem endpoint disponível)
- **Arquivar**: chama `PATCH /events/:id { status: "CANCELLED" }` após confirmação inline
- **Excluir**: abre modal de confirmação, então chama `DELETE /events/:id`

#### Scenario: Arquivar evento via menu

- **WHEN** o usuário clica em "Arquivar" no menu de um evento
- **THEN** o sistema chama `PATCH /events/:id { status: "CANCELLED" }` e invalida o cache `['my-events']`, movendo o evento para a tab "Arquivados"

#### Scenario: Excluir evento via menu

- **WHEN** o usuário clica em "Excluir" no menu e confirma no modal
- **THEN** o sistema chama `DELETE /events/:id` e invalida o cache `['my-events']`, removendo o evento da lista

### Requirement: Seleção múltipla e ações em massa

O sistema SHALL permitir selecionar múltiplos eventos via checkbox em cada card.

Quando ao menos 1 evento estiver selecionado, a bulk bar SHALL aparecer fixada na parte inferior da tela com as ações: **Arquivar** (todos selecionados) e **Excluir** (todos selecionados).

#### Scenario: Seleção e bulk archive

- **WHEN** o usuário seleciona 3 eventos e clica em "Arquivar" na bulk bar
- **THEN** o sistema chama `PATCH /events/:id { status: "CANCELLED" }` para cada evento selecionado em paralelo, invalida o cache e limpa a seleção

#### Scenario: Seleção e bulk delete

- **WHEN** o usuário seleciona eventos e clica em "Excluir" na bulk bar
- **THEN** o sistema chama `DELETE /events/:id` para cada evento selecionado em paralelo, invalida o cache e limpa a seleção

#### Scenario: Cancelar seleção

- **WHEN** o usuário clica em "Cancelar" na bulk bar
- **THEN** todos os checkboxes são desmarcados e a bulk bar desaparece

### Requirement: Drawer de gerenciamento de comentários

O sistema SHALL exibir um drawer lateral com os comentários de um evento específico ao acionar "Gerenciar comentários".

Os comentários SHALL ser carregados via `GET /events/:eventId/comments` apenas quando o drawer for aberto (lazy loading).

O drawer SHALL permitir **excluir** comentários via `DELETE /events/:eventId/comments/:commentId`.

O drawer SHALL fechar ao clicar no overlay ou no botão X.

#### Scenario: Abrir drawer com comentários

- **WHEN** o usuário clica em "Gerenciar comentários" em um evento
- **THEN** o drawer abre e carrega os comentários do evento via API

#### Scenario: Excluir comentário

- **WHEN** o usuário clica em "Excluir" em um comentário
- **THEN** o sistema chama `DELETE /events/:eventId/comments/:commentId` e remove o comentário da lista

#### Scenario: Drawer sem comentários

- **WHEN** o evento não tem comentários
- **THEN** o drawer exibe estado vazio

### Requirement: Modal de confirmação de exclusão

O sistema SHALL exibir um modal de confirmação antes de excluir um evento individualmente, mostrando o nome do evento.

#### Scenario: Confirmação de exclusão

- **WHEN** o usuário clica em "Excluir" no menu e confirma no modal
- **THEN** o sistema executa `DELETE /events/:id`

#### Scenario: Cancelamento de exclusão

- **WHEN** o usuário clica em "Cancelar" ou no overlay do modal
- **THEN** o evento não é excluído e o modal fecha
