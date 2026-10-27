## ADDED Requirements

### Requirement: Seção atrás da flag NEXT_PUBLIC_FF_TICKET_TYPES

O CMS SHALL renderizar a seção "Ingressos e lotes" no editor de evento somente quando `process.env.NEXT_PUBLIC_FF_TICKET_TYPES` for `true`. Com a flag ausente ou com qualquer outro valor, o CMS SHALL NOT renderizar a seção e SHALL NOT chamar nenhuma rota `ticket-types`.

#### Scenario: Flag desligada

- **GIVEN** `NEXT_PUBLIC_FF_TICKET_TYPES` ausente
- **WHEN** o produtor abre `/cms/producer/edit-event/<id>`
- **THEN** o painel `panel-ticket-types` não existe na página
- **AND** nenhuma requisição para `/events/<id>/ticket-types` é feita

#### Scenario: Flag ligada na edição

- **GIVEN** `NEXT_PUBLIC_FF_TICKET_TYPES=true`
- **WHEN** o produtor abre a edição de um evento
- **THEN** o painel "Ingressos e lotes" aparece depois do painel de perguntas frequentes
- **AND** o CMS chama `GET /events/<id>/ticket-types` uma vez

#### Scenario: Flag ligada na criação

- **GIVEN** `NEXT_PUBLIC_FF_TICKET_TYPES=true`
- **WHEN** o produtor abre `/cms/producer/new-event`
- **THEN** o painel mostra `Salve o evento para cadastrar ingressos`
- **AND** não há botão de adicionar e nenhuma requisição `ticket-types` é feita

### Requirement: Aviso de que a venda não está disponível

A seção SHALL exibir, sempre que estiver visível e em qualquer estado, o aviso `Venda ainda não disponível. Aqui você só planeja os lotes; nenhum ingresso é vendido.` com `data-testid="ticket-types-notice"`. A seção SHALL também informar que os lotes são salvos na hora, sem depender do botão Salvar evento.

#### Scenario: Aviso presente com lista vazia e com lista cheia

- **WHEN** a seção é exibida com 0 tipos e depois com 3 tipos
- **THEN** o aviso `ticket-types-notice` está visível nas duas situações

### Requirement: Listar tipos de ingresso

A seção SHALL listar os tipos devolvidos por `GET /events/{eventId}/ticket-types` na ordem recebida, mostrando para cada um o nome, o preço formatado em reais (`priceCents = 5000` aparece como `R$ 50,00`; `0` aparece como `Gratuito`), a quantidade, o período de venda e a indicação de oculto quando `isVisible = false`. Sem tipos, a seção SHALL mostrar o estado vazio `Nenhum ingresso cadastrado ainda.`. Durante o carregamento SHALL mostrar o estado de carregando.

#### Scenario: Três tipos

- **GIVEN** a API devolve "Pista" (`priceCents = 8000`, `quantity = 300`), "Camarote" (`priceCents = 15000`, `quantity = 40`, `isVisible = false`) e "Cortesia" (`priceCents = 0`, `quantity = 10`)
- **WHEN** a seção carrega
- **THEN** há 3 itens `ticket-type-item`, nessa ordem
- **AND** aparecem `R$ 80,00`, `R$ 150,00` e `Gratuito`
- **AND** "Camarote" mostra a marca de oculto

#### Scenario: Lista vazia

- **GIVEN** a API devolve `[]`
- **WHEN** a seção carrega
- **THEN** aparece `Nenhum ingresso cadastrado ainda.` e o botão `ticket-type-add`

### Requirement: Adicionar tipo de ingresso

A seção SHALL permitir adicionar um tipo com nome, preço em reais, quantidade, início e fim da venda (opcionais) e visibilidade (padrão visível), enviando `POST /events/{eventId}/ticket-types` com `priceCents` em centavos e datas ISO 8601 UTC ou `null`. O botão de salvar SHALL ficar em carregando e impedir duplo envio enquanto pendente. Com sucesso, SHALL fechar o editor, atualizar a lista e mostrar toast; em erro, manter o editor aberto e mostrar a mensagem da API.

#### Scenario: Adicionar o 1º lote

- **GIVEN** a lista está vazia
- **WHEN** o produtor preenche nome `1º lote`, preço `50,00`, quantidade `200` e confirma
- **THEN** o CMS envia `POST` com `{ "name": "1º lote", "priceCents": 5000, "quantity": 200, "salesStartAt": null, "salesEndAt": null, "isVisible": true }`
- **AND** a lista passa a ter 1 item e aparece o toast de sucesso

#### Scenario: Preço com vírgula e meio real

- **WHEN** o produtor digita preço `50,5`
- **THEN** o payload enviado tem `priceCents = 5050`

#### Scenario: Duplo clique

- **WHEN** o produtor clica duas vezes seguidas em confirmar com a requisição pendente
- **THEN** só uma requisição `POST` é enviada

#### Scenario: Erro da API

- **GIVEN** a API responde 400 com a mensagem `O preço não pode ser negativo`
- **WHEN** o produtor confirma
- **THEN** o editor continua aberto e a mensagem é exibida
- **AND** a lista não muda

### Requirement: Validação local do formulário de tipo

O editor SHALL impedir o envio e mostrar mensagem junto ao campo quando: o nome estiver vazio ou só com espaços; o preço estiver vazio, não for número em reais com até 2 casas decimais ou for negativo; a quantidade não for inteiro maior que zero; ou o fim da venda não for depois do início quando os dois forem informados. Essa validação é só de interface; a API continua sendo a fonte da verdade.

#### Scenario: Quantidade zero

- **WHEN** o produtor informa quantidade `0` e confirma
- **THEN** nenhuma requisição é enviada
- **AND** aparece `A quantidade deve ser maior que zero` junto ao campo `ticket-type-quantity`

#### Scenario: Preço negativo

- **WHEN** o produtor informa preço `-10`
- **THEN** aparece `O preço não pode ser negativo` e nada é enviado

#### Scenario: Fim antes do início

- **WHEN** o início é `2026-12-10 12:00` e o fim é `2026-12-01 12:00`
- **THEN** aparece `O fim das vendas deve ser depois do início` e nada é enviado

#### Scenario: Preço com 3 casas

- **WHEN** o produtor informa preço `10,999`
- **THEN** aparece uma mensagem de preço inválido e nada é enviado

### Requirement: Editar tipo de ingresso

A seção SHALL permitir editar um tipo existente com o mesmo formulário preenchido com os valores atuais, enviando `PATCH /events/{eventId}/ticket-types/{ticketTypeId}` somente com os campos alterados. Sem alteração, SHALL NOT enviar requisição.

#### Scenario: Mudar só o preço

- **GIVEN** o tipo "1º lote" com `priceCents = 5000`
- **WHEN** o produtor troca o preço para `65,00` e confirma
- **THEN** o CMS envia `PATCH` com `{ "priceCents": 6500 }`
- **AND** a lista mostra `R$ 65,00`

#### Scenario: Confirmar sem mudar nada

- **WHEN** o produtor abre a edição e confirma sem alterar campo
- **THEN** nenhuma requisição é enviada e o editor fecha

### Requirement: Remover tipo de ingresso com confirmação

A seção SHALL pedir confirmação inline antes de remover (`Remover este ingresso?`, com `Confirmar` e `Cancelar`) e só então enviar `DELETE /events/{eventId}/ticket-types/{ticketTypeId}`. O botão de confirmar SHALL ficar em carregando e impedir duplo disparo. Ao terminar, SHALL atualizar a lista e mostrar toast.

#### Scenario: Confirmar remoção

- **GIVEN** uma lista com 2 tipos
- **WHEN** o produtor clica em remover no 1º e em Confirmar
- **THEN** o CMS envia `DELETE` desse tipo
- **AND** a lista passa a ter 1 item

#### Scenario: Cancelar remoção

- **WHEN** o produtor clica em remover e depois em Cancelar
- **THEN** nenhuma requisição é enviada e o item continua na lista

### Requirement: Reordenar tipos de ingresso

A seção SHALL oferecer botões de subir e descer em cada item (subir desabilitado no primeiro, descer desabilitado no último) e, ao clicar, SHALL trocar o item com o vizinho na tela de imediato e enviar `PUT /events/{eventId}/ticket-types/order` com a lista completa de ids na nova ordem. Se a requisição falhar, SHALL voltar à ordem anterior e mostrar toast de erro.

#### Scenario: Descer o primeiro de três

- **GIVEN** os tipos A, B e C nessa ordem
- **WHEN** o produtor clica em descer no A
- **THEN** a lista mostra B, A, C
- **AND** o CMS envia `PUT` com `{ "ids": ["B", "A", "C"] }`

#### Scenario: Falha ao reordenar

- **GIVEN** os tipos A, B e C e a API responde 500 ao `PUT`
- **WHEN** o produtor clica em descer no A
- **THEN** a lista volta a mostrar A, B, C
- **AND** aparece toast de erro

#### Scenario: Limites

- **GIVEN** os tipos A, B e C
- **THEN** `ticket-type-move-up` do A e `ticket-type-move-down` do C estão desabilitados

### Requirement: Enter no editor de tipo não salva o evento

Nenhuma tecla ou botão do editor de tipo de ingresso SHALL disparar o envio do formulário do evento. Todos os botões da seção SHALL ter `type="button"`, e Enter num campo do editor SHALL confirmar o tipo em edição sem enviar o evento.

#### Scenario: Enter no campo nome

- **GIVEN** a edição de um evento com o editor de tipo aberto
- **WHEN** o produtor digita no campo nome e aperta Enter
- **THEN** o tipo é confirmado (ou a validação local aparece)
- **AND** nenhuma requisição `PATCH /events/<id>` é enviada

### Requirement: Erros de acesso na listagem

Quando `GET /events/{eventId}/ticket-types` falhar, a seção SHALL mostrar o estado de erro com `data-testid="ticket-types-error"` e esconder o botão de adicionar. Com 404 SHALL dizer `Recurso indisponível neste ambiente`; com 403 SHALL dizer `Você não tem permissão para gerenciar os ingressos deste evento`; com outro erro SHALL mostrar a mensagem da API ou `Não foi possível carregar os ingressos`.

#### Scenario: Backend com a flag desligada

- **GIVEN** a flag do CMS ligada e a API respondendo 404
- **WHEN** a seção carrega
- **THEN** aparece `Recurso indisponível neste ambiente`
- **AND** o resto do editor de evento continua funcionando

#### Scenario: Evento de outro produtor

- **GIVEN** a API responde 403
- **WHEN** a seção carrega
- **THEN** aparece `Você não tem permissão para gerenciar os ingressos deste evento`

### Requirement: Fluxo atual de salvar evento não muda

O CMS SHALL NOT incluir dados de ingresso no schema `createEventSchema`, no payload de `POST /events` nem no de `PATCH /events/:id`. Salvar o evento SHALL NOT enviar nem alterar tipos de ingresso.

#### Scenario: Salvar evento com lotes cadastrados

- **GIVEN** a edição de um evento com 3 tipos
- **WHEN** o produtor altera o título e clica em Salvar
- **THEN** o `PATCH /events/<id>` não contém campo de ingresso
- **AND** nenhuma requisição `ticket-types` é enviada

### Requirement: Formatação de moeda sem ponto flutuante

Os helpers de moeda SHALL converter texto em reais para centavos inteiros sem usar multiplicação de ponto flutuante, e centavos para texto pt-BR em BRL.

#### Scenario: Conversões

- **THEN** `parseReaisToCents('50')` é 5000, `'50,5'` é 5050, `'50,50'` é 5050, `'1.250,00'` é 125000, `'0'` é 0
- **AND** `'abc'`, `''`, `'-1'` e `'10,999'` são inválidos
- **AND** `formatCentsToReais(5000)` é `R$ 50,00`
