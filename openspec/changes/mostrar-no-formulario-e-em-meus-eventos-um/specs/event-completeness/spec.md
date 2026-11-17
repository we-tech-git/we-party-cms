## ADDED Requirements

### Requirement: Cálculo de completude da página do evento

O sistema SHALL calcular a completude da página do evento com 5 itens: capa (1 foto ou mais), descrição (200 caracteres ou mais após `trim`), FAQ (1 par completo ou mais), interesses (1 ou mais) e data de término informada. O cálculo SHALL ser uma função pura, sem rede, com `doneCount` de 0 a 5 e `total` 5. Item sem dado SHALL ficar `unknown` e SHALL NOT contar como feito.

#### Scenario: Evento vazio

- **WHEN** a função recebe 0 fotos, descrição de 0 caracteres, 0 FAQ, 0 interesses e término não informado
- **THEN** os 5 itens ficam `pending` e `doneCount` é 0 de 5

#### Scenario: Descrição no limite

- **WHEN** a descrição tem 199 caracteres
- **THEN** o item descrição fica `pending`
- **AND** com 200 caracteres o item fica `done`

#### Scenario: Descrição só com espaços

- **WHEN** a descrição tem 250 espaços
- **THEN** o item descrição fica `pending`

#### Scenario: Evento completo

- **WHEN** a função recebe 1 foto, descrição de 320 caracteres, 2 FAQ, 3 interesses e término informado
- **THEN** os 5 itens ficam `done` e `doneCount` é 5

#### Scenario: Dado ausente

- **WHEN** a contagem de FAQ chega `null`
- **THEN** o item FAQ fica `unknown`
- **AND** `doneCount` conta só os itens `done`

### Requirement: Painel de checklist no formulário de evento

O formulário de criação e de edição de evento SHALL mostrar, na coluna da direita abaixo da pré-visualização, um painel com os 5 itens e o total "N/5". O painel SHALL atualizar enquanto o produtor preenche, sem recarregar a página, e SHALL ser apenas informativo: SHALL NOT desabilitar, bloquear nem alterar o envio de salvar ou publicar. Para FAQ, o formulário SHALL contar só pares com pergunta e resposta preenchidas, como o envio faz.

#### Scenario: Formulário vazio

- **GIVEN** o produtor abre `/cms/producer/new-event` sem `from`
- **WHEN** a tela carrega
- **THEN** o painel mostra "0/5" e os 5 itens como pendentes

#### Scenario: Preencher campos sobe o total

- **GIVEN** o formulário vazio
- **WHEN** o produtor digita uma descrição de 200 caracteres, adiciona 1 FAQ com pergunta e resposta e seleciona 1 interesse
- **THEN** o painel mostra "3/5"
- **AND** os itens descrição, FAQ e interesses aparecem como feitos, e capa e término como pendentes

#### Scenario: Apagar volta a pendente

- **GIVEN** o painel mostra "3/5" como no cenário anterior
- **WHEN** o produtor apaga a resposta do FAQ
- **THEN** o item FAQ volta a pendente e o painel mostra "2/5"

#### Scenario: Salvar com checklist incompleto

- **GIVEN** o painel mostra "1/5" e título e data de início estão preenchidos
- **WHEN** o produtor clica em "Publicar evento"
- **THEN** a criação do evento é enviada normalmente

#### Scenario: Edição de evento existente

- **GIVEN** um evento com 1 foto, descrição de 250 caracteres, 0 FAQ, 2 interesses e término preenchido
- **WHEN** o produtor abre `/cms/producer/edit-event/{id}`
- **THEN** o painel mostra "4/5" e só o item FAQ pendente

### Requirement: Selo de completude em Meus eventos

Cada card de `/cms/producer/my-events` SHALL mostrar um selo "N/5" calculado a partir do evento. Se algum dos 5 itens for `unknown` (por exemplo `faq` ausente na resposta da lista), o selo SHALL mostrar "—" e SHALL NOT mostrar um número. O selo SHALL NOT mudar o status, a ordenação nem os filtros da lista.

#### Scenario: Card com dados completos

- **GIVEN** a lista devolve um evento com 1 foto, descrição de 210 caracteres, `faq` com 1 item, 1 interesse e `endDate` preenchido
- **WHEN** a tela carrega
- **THEN** o card mostra "5/5"

#### Scenario: Card parcial

- **GIVEN** a lista devolve um evento com 0 fotos, descrição de 50 caracteres, `faq` vazio, 2 interesses e `endDate` preenchido
- **WHEN** a tela carrega
- **THEN** o card mostra "2/5"

#### Scenario: Lista sem faq

- **GIVEN** a resposta de `GET /events/my-events` não traz o campo `faq` no evento
- **WHEN** a tela carrega
- **THEN** o card mostra "—" no selo, e não "0/5"

### Requirement: Textos do checklist em pt-BR e en-US

Todo texto novo (título do painel, nome dos 5 itens, estados, selo e rótulo acessível) SHALL vir de chaves i18n em `src/i18n/locales/pt-BR.ts` e `en-US.ts`, sem texto fixo no componente.

#### Scenario: Idioma inglês

- **GIVEN** o idioma en-US
- **WHEN** o formulário abre
- **THEN** o título do painel e os 5 itens aparecem em inglês, com "0/5"

#### Scenario: Idioma português

- **GIVEN** o idioma pt-BR
- **WHEN** o formulário abre
- **THEN** o título do painel e os 5 itens aparecem em português
