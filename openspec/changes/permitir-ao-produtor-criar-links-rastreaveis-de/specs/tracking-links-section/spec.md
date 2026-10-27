## ADDED Requirements

### Requirement: Seção atrás de flag

O CMS SHALL mostrar a seção "Links de divulgação" na tela `/cms/producer/edit-event/[id]` somente quando `NEXT_PUBLIC_FF_TRACKING_LINKS` for exatamente `true`. Com a flag desligada ou ausente, a seção SHALL NOT ser renderizada e o CMS SHALL NOT chamar nenhuma rota `/events/:id/tracking-links`. A seção SHALL NOT aparecer na tela de criação de evento (`new-event`).

#### Scenario: Flag desligada

- **GIVEN** `NEXT_PUBLIC_FF_TRACKING_LINKS` ausente
- **WHEN** o produtor abre `/cms/producer/edit-event/E`
- **THEN** a tela mostra o formulário do evento e não mostra "Links de divulgação"
- **AND** nenhuma requisição para `/events/E/tracking-links` é feita

#### Scenario: Flag ligada em edição

- **GIVEN** `NEXT_PUBLIC_FF_TRACKING_LINKS=true`
- **WHEN** o produtor abre `/cms/producer/edit-event/E`
- **THEN** a seção "Links de divulgação" aparece abaixo do formulário
- **AND** o CMS chama `GET /events/E/tracking-links`

#### Scenario: Tela de criação

- **GIVEN** `NEXT_PUBLIC_FF_TRACKING_LINKS=true`
- **WHEN** o produtor abre `/cms/producer/new-event`
- **THEN** a seção não aparece (o evento ainda não tem id)

### Requirement: Listar links com total de visualizações

A seção SHALL listar, para cada link devolvido por `GET /events/:id/tracking-links`, o rótulo, a URL completa `${NEXT_PUBLIC_WEB_APP_URL}/event/${eventId}?ref=${code}` e o `totalViews`. Sem `NEXT_PUBLIC_WEB_APP_URL`, a base SHALL ser `https://wepartyapp.com`. Enquanto carrega, a seção SHALL mostrar o estado de carregamento; sem links, o estado vazio; em falha de rede ou 5xx, o estado de erro com botão "Tentar de novo"; em 403, a mensagem de falta de permissão.

#### Scenario: Dois links

- **GIVEN** `NEXT_PUBLIC_WEB_APP_URL` ausente, o evento `ev-123` e a API devolvendo "Instagram" (`code = k3m9x2ab`, `totalViews = 7`) e "WhatsApp" (`code = p4q5r6st`, `totalViews = 0`)
- **WHEN** a seção carrega
- **THEN** ela mostra "Instagram" com `https://wepartyapp.com/event/ev-123?ref=k3m9x2ab` e total 7
- **AND** mostra "WhatsApp" com `https://wepartyapp.com/event/ev-123?ref=p4q5r6st` e total 0

#### Scenario: Estado vazio

- **WHEN** a API devolve lista vazia
- **THEN** a seção mostra "Nenhum link criado ainda" e o formulário de criação continua visível

#### Scenario: Erro de servidor

- **WHEN** `GET /events/ev-123/tracking-links` responde 500
- **THEN** a seção mostra a mensagem de erro e o botão "Tentar de novo"
- **AND** clicar no botão repete a chamada

#### Scenario: Sem permissão

- **WHEN** `GET /events/ev-123/tracking-links` responde 403
- **THEN** a seção mostra "Você não tem permissão para gerenciar os links deste evento" e esconde o formulário de criação

### Requirement: Criar link

A seção SHALL permitir criar um link informando um rótulo de 1 a 60 caracteres, chamando `POST /events/:id/tracking-links` com `{ label }`. O botão "Criar link" SHALL ficar desabilitado com indicação de carregamento durante a chamada e SHALL ficar desabilitado com o rótulo vazio ou só com espaços. Ao sucesso, a seção SHALL limpar o campo, mostrar o novo link na lista com total 0 e exibir toast de sucesso; ao erro, exibir toast de erro e manter o texto digitado.

#### Scenario: Cria "Instagram"

- **GIVEN** a seção carregada e vazia
- **WHEN** o produtor digita "Instagram" e clica em "Criar link"
- **THEN** o CMS chama `POST /events/ev-123/tracking-links` com `{ "label": "Instagram" }` uma única vez
- **AND** a lista passa a ter 1 item "Instagram" com total 0

#### Scenario: Rótulo em branco

- **WHEN** o campo contém apenas espaços
- **THEN** o botão "Criar link" está desabilitado

#### Scenario: Erro ao criar

- **WHEN** o `POST` responde 400
- **THEN** aparece toast de erro e o campo continua com o texto digitado

### Requirement: Copiar a URL

Cada item SHALL ter um botão "Copiar" que escreve a URL completa do link na área de transferência e mostra o toast "Link copiado". Se a escrita falhar, a seção SHALL mostrar toast de erro e a URL SHALL continuar visível para cópia manual.

#### Scenario: Copia com sucesso

- **WHEN** o produtor clica em "Copiar" no item "Instagram"
- **THEN** a área de transferência contém `https://wepartyapp.com/event/ev-123?ref=k3m9x2ab`
- **AND** aparece o toast "Link copiado"

#### Scenario: Clipboard indisponível

- **GIVEN** que `navigator.clipboard.writeText` rejeita
- **WHEN** o produtor clica em "Copiar"
- **THEN** aparece toast de erro e a URL segue visível

### Requirement: Remover link com confirmação

Cada item SHALL ter um botão "Remover" que abre uma confirmação; só ao confirmar o CMS SHALL chamar `DELETE /events/:id/tracking-links/:linkId`. Ao sucesso, o item SHALL sair da lista; ao erro, SHALL permanecer com toast de erro.

#### Scenario: Confirma a remoção

- **WHEN** o produtor clica em "Remover" no item "Instagram" e confirma
- **THEN** o CMS chama `DELETE /events/ev-123/tracking-links/<id do link>`
- **AND** o item "Instagram" some da lista

#### Scenario: Cancela a remoção

- **WHEN** o produtor clica em "Remover" e cancela
- **THEN** nenhuma chamada `DELETE` é feita e o item continua na lista
