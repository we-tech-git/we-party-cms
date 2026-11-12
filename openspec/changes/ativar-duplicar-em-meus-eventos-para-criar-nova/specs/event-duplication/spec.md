## ADDED Requirements

### Requirement: Ação Duplicar no card de Meus eventos

O item "Duplicar" do menu do card de evento SHALL estar habilitado e SHALL levar o produtor a `/cms/producer/new-event?from=<id do evento>`. O rótulo SHALL vir da chave i18n `myEvents.card.duplicate` ("Duplicar" em pt-BR, "Duplicate" em en-US).

#### Scenario: Clicar em Duplicar

- **GIVEN** o produtor logado vê, em Meus eventos, o card do evento `evt-123` "Sunset Beach Party"
- **WHEN** abre o menu "⋮" e clica em "Duplicar"
- **THEN** o menu fecha e o navegador vai para `/cms/producer/new-event?from=evt-123`

#### Scenario: Item não está mais desabilitado

- **WHEN** o menu do card é aberto
- **THEN** o item "Duplicar" não tem o atributo `disabled`
- **AND** o item "Impulsionar alcance" continua desabilitado

### Requirement: Formulário pré-preenchido com os dados da origem

Ao abrir `/cms/producer/new-event?from=<id>` de um evento do próprio produtor, a tela SHALL carregar a origem por `GET /events/{id}` e preencher título com o sufixo i18n (`" (cópia)"` / `" (copy)"`), descrição, endereço, `isPublic`, `allowComments`, interesses e FAQ. O formulário SHALL aparecer só depois da carga.

#### Scenario: Campos de texto copiados

- **GIVEN** o evento `evt-123` do produtor com título "Sunset Beach Party", descrição de 120 caracteres, cidade "Florianópolis", estado "SC", 2 interesses e 3 perguntas no FAQ
- **WHEN** o produtor abre `/cms/producer/new-event?from=evt-123` com o idioma pt-BR
- **THEN** o campo "Nome do evento" contém "Sunset Beach Party (cópia)"
- **AND** a descrição tem os mesmos 120 caracteres, cidade e estado são "Florianópolis" e "SC", 2 interesses vêm selecionados e o FAQ tem 3 linhas

#### Scenario: Sufixo em inglês

- **GIVEN** o mesmo evento e o idioma en-US
- **WHEN** a tela abre
- **THEN** o título é "Sunset Beach Party (copy)"

#### Scenario: Sem parâmetro from

- **WHEN** o produtor abre `/cms/producer/new-event` sem `from`
- **THEN** o formulário vazio de hoje é exibido, com o botão "Publicar evento"

### Requirement: Datas e fotos não são herdados

A tela SHALL NOT preencher datas de início e fim, nem fotos (inclusive a capa existente). Os horários SHALL voltar aos padrões 22:00 (início) e 06:00 (término).

#### Scenario: Datas e fotos não são herdadas

- **GIVEN** o evento de origem com início em 2026-06-20 às 22:00, término em 2026-06-21 às 06:00 e 2 fotos
- **WHEN** a tela abre
- **THEN** os campos de data de início e de término estão vazios e os horários mostram 22:00 e 06:00
- **AND** a área de capa não mostra foto nenhuma

### Requirement: Nova data obrigatória antes de salvar

O sistema SHALL NOT permitir salvar a cópia sem data de início. A data de início SHALL continuar obrigatória pelo `createEventSchema` existente.

#### Scenario: Salvar sem informar data

- **GIVEN** o formulário de cópia recém-aberto, com título "Sunset Beach Party (cópia)" e data de início vazia
- **WHEN** o produtor tenta enviar o formulário
- **THEN** nenhuma requisição `POST /events` é feita
- **AND** aparece o erro "Data de início é obrigatória" e o toast "Preencha: Data de início"

### Requirement: A cópia é criada como rascunho

Ao salvar, o sistema SHALL criar um novo evento com `POST /events` enviando `status: 'DRAFT'`, SHALL criar as FAQs no novo evento pelos endpoints existentes e SHALL manter o evento de origem inalterado (nenhuma chamada `PUT`, `PATCH` ou `DELETE` nele). Ao concluir, SHALL invalidar `['my-events']` e navegar para `/cms/producer/my-events`. Em caso de erro, SHALL mostrar a mensagem na barra de ação e manter o formulário editável.

#### Scenario: Salvar a cópia

- **GIVEN** o formulário de cópia de `evt-123` com data de início 2026-07-04 e 3 perguntas no FAQ
- **WHEN** o produtor clica em "Salvar como rascunho"
- **THEN** `POST /events` é chamado uma vez com `status: "DRAFT"`, `title: "Sunset Beach Party (cópia)"` e `startDate` em 2026-07-04
- **AND** 3 chamadas `POST /events/{novoId}/faq` são feitas
- **AND** o navegador vai para `/cms/producer/my-events`, onde o novo evento aparece com o selo "Rascunho" e um id diferente de `evt-123`

#### Scenario: Evento original intacto

- **WHEN** a cópia é salva
- **THEN** nenhuma requisição `PUT`, `PATCH` ou `DELETE` é enviada para `/events/evt-123`
- **AND** o card de `evt-123` em Meus eventos mantém título, status e contadores de antes

#### Scenario: Contadores zerados

- **WHEN** a lista de eventos é recarregada após salvar
- **THEN** o card da cópia mostra 0 views, 0 curtidas, 0 confirmados e 0 compartilhamentos

#### Scenario: Erro ao salvar

- **GIVEN** o backend responde 400 com a mensagem "status inválido"
- **WHEN** o produtor clica em "Salvar como rascunho"
- **THEN** a barra de ação mostra "status inválido"
- **AND** o botão volta a ficar habilitado e os campos preenchidos continuam na tela

### Requirement: Botão de envio indica rascunho

No modo de cópia, o botão de envio SHALL dizer "Salvar como rascunho" (pt-BR) ou "Save as draft" (en-US) e, enquanto envia, SHALL ficar desabilitado e mostrar "Salvando…". O botão desabilitado "Salvar rascunho" SHALL NOT aparecer nesse modo.

#### Scenario: Rótulo e bloqueio de duplo envio

- **GIVEN** o formulário de cópia com data de início 2026-07-04
- **WHEN** o produtor clica em "Salvar como rascunho"
- **THEN** o botão fica desabilitado com o texto "Salvando…" até a resposta
- **AND** não existe botão "Salvar rascunho" na barra de ação

### Requirement: Origem inexistente ou de outro produtor

Se o evento de `from` não existir, não puder ser carregado, ou tiver `creator.id` diferente do id do usuário logado, a tela SHALL mostrar o painel "Evento não encontrado" com o link "← Voltar para Meus eventos" e SHALL NOT renderizar o formulário nem preencher nenhum dado do evento.

#### Scenario: Id inexistente

- **WHEN** o produtor abre `/cms/producer/new-event?from=nao-existe` e `GET /events/nao-existe` responde 404
- **THEN** aparece "Evento não encontrado" e o link de volta para `/cms/producer/my-events`
- **AND** não há campo "Nome do evento" na tela

#### Scenario: Evento de outro produtor

- **GIVEN** o usuário logado tem id `user-1` e o evento `evt-999` tem `creator.id = "user-2"`
- **WHEN** abre `/cms/producer/new-event?from=evt-999`
- **THEN** aparece "Evento não encontrado" e nenhum dado de `evt-999` é exibido

### Requirement: Textos em pt-BR e en-US

Todo texto novo desta funcionalidade (sufixo da cópia, título e subtítulo da tela, rótulo do botão, mensagem de evento não encontrado) SHALL existir nos dois arquivos `src/i18n/locales/pt-BR.ts` e `en-US.ts`.

#### Scenario: Chaves presentes nos dois idiomas

- **WHEN** `yarn type-check` é executado
- **THEN** passa sem erro
- **AND** as chaves `newEvent.duplicateTitle`, `newEvent.duplicateSubtitle`, `newEvent.duplicateSuffix`, `newEvent.saveAsDraft` e `newEvent.sourceNotFound` existem em pt-BR e en-US
