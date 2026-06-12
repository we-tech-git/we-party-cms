## ADDED Requirements

### Requirement: Produtor pode criar evento com informações básicas
O sistema SHALL permitir ao produtor preencher título (obrigatório), descrição (opcional, máx 600 chars) e data de início (obrigatória) + horário de início (padrão 22:00), data de término (opcional, padrão = início) + horário de término (padrão 06:00).

#### Scenario: Publicar ativo somente com campos mínimos
- **WHEN** o produtor preenche título e data de início
- **THEN** o botão "Publicar evento" fica habilitado

#### Scenario: Publicar desabilitado sem campos mínimos
- **WHEN** título ou data de início estão vazios
- **THEN** o botão "Publicar evento" permanece desabilitado e o hint na action bar indica os campos faltantes

#### Scenario: Contador de caracteres na descrição
- **WHEN** o produtor digita na descrição
- **THEN** um contador "X/600" é atualizado em tempo real

### Requirement: Upload de imagem de capa
O sistema SHALL permitir upload de imagem de capa via drag-and-drop ou seleção de arquivo (apenas `image/*`).

#### Scenario: Preview após seleção
- **WHEN** o produtor seleciona ou arrasta uma imagem válida
- **THEN** a dropzone exibe preview da imagem e o live preview do feed também é atualizado

#### Scenario: Trocar ou remover imagem
- **WHEN** há uma imagem selecionada e o produtor clica em "Trocar imagem"
- **THEN** o dialog de seleção de arquivo reabre

#### Scenario: Arquivo inválido ignorado
- **WHEN** o produtor tenta fazer upload de arquivo não-imagem
- **THEN** o arquivo é ignorado e a dropzone permanece no estado anterior

### Requirement: Lógica de overnight para datas
O sistema SHALL detectar automaticamente quando o término é no dia seguinte.

#### Scenario: Término no dia seguinte
- **WHEN** horário de término é anterior ao de início e `endDate === startDate`
- **THEN** o payload enviado ao backend usa `endDate + 1 dia` no campo `endDate`

#### Scenario: Datas explicitamente diferentes
- **WHEN** o produtor define `endDate` diferente de `startDate`
- **THEN** a lógica de overnight não altera a data

### Requirement: Localização com CEP auto-fill
O sistema SHALL preencher cidade, estado, bairro e rua automaticamente ao detectar CEP válido (8 dígitos).

#### Scenario: CEP válido auto-preenche campos
- **WHEN** o produtor digita 8 dígitos no campo CEP
- **THEN** os campos cidade, estado, bairro e rua são preenchidos via ViaCEP e ficam editáveis

#### Scenario: CEP inválido mostra feedback
- **WHEN** o CEP digitado não existe na base ViaCEP
- **THEN** é exibido feedback de erro junto ao campo e os demais campos permanecem editáveis

#### Scenario: Campos de localização editáveis manualmente
- **WHEN** o produtor edita qualquer campo de localização diretamente
- **THEN** o valor digitado prevalece, independentemente de um CEP ter sido preenchido antes

### Requirement: Seleção de interesses
O sistema SHALL permitir busca e seleção de múltiplos interesses vindos da API.

#### Scenario: Busca filtra interesses disponíveis
- **WHEN** o produtor digita no campo de busca
- **THEN** os chips de resultado mostram interesses cujo nome contém o termo (case-insensitive), excluindo os já selecionados

#### Scenario: Selecionar e remover interesse
- **WHEN** o produtor clica em um chip de sugestão ou resultado de busca
- **THEN** o interesse move para a seção "Selecionados" e desaparece das sugestões

#### Scenario: Reroll de sugestões
- **WHEN** o produtor clica no botão de shuffle de sugestões
- **THEN** 5 novos interesses aleatórios (não selecionados) são exibidos

#### Scenario: Sugerir novo interesse
- **WHEN** o produtor preenche o campo de sugestão e confirma
- **THEN** `POST /interest` é chamado e o novo interesse é adicionado automaticamente aos selecionados

### Requirement: Editor de FAQ
O sistema SHALL permitir adicionar, editar e remover pares de pergunta-resposta.

#### Scenario: Adicionar novo FAQ
- **WHEN** o produtor clica em "Nova pergunta"
- **THEN** um par de campos (pergunta + resposta) é adicionado inline

#### Scenario: Remover FAQ
- **WHEN** o produtor clica no botão de remover de um FAQ
- **THEN** o par é removido imediatamente

#### Scenario: FAQ vazio não é enviado
- **WHEN** o produtor deixa um campo de FAQ em branco e tenta publicar
- **THEN** o formulário exibe erro inline nesse campo e a submissão é bloqueada

### Requirement: Configurações de visibilidade e comentários
O sistema SHALL permitir configurar se o evento é público ou privado e se permite comentários.

#### Scenario: Toggle visibilidade
- **WHEN** o produtor seleciona "Privado" ou "Público"
- **THEN** o live preview atualiza o badge correspondente e o campo `isPublic` do payload é ajustado

#### Scenario: Toggle comentários
- **WHEN** o produtor seleciona "Permitidos" ou "Não permitidos"
- **THEN** o live preview atualiza o indicador de comentários e `allowComments` é ajustado

### Requirement: Live preview do evento
O sistema SHALL exibir na coluna direita uma prévia de como o evento aparecerá no feed, atualizada em tempo real.

#### Scenario: Preview reflete título
- **WHEN** o produtor digita no campo título
- **THEN** o card de preview mostra o título atualizado em tempo real

#### Scenario: Preview reflete data e localização
- **WHEN** o produtor preenche data de início e cidade
- **THEN** o preview exibe a data formatada (ex: "Sex, 20 jun · 22:00") e a cidade

### Requirement: Publicação do evento
O sistema SHALL enviar o payload correto ao backend ao publicar.

#### Scenario: Publicar sem foto
- **WHEN** o produtor clica "Publicar evento" sem ter selecionado imagem
- **THEN** `POST /events` é chamado com JSON contendo todos os campos; ao sucesso, navega para `/cms/producer/my-events`

#### Scenario: Publicar com foto
- **WHEN** o produtor clica "Publicar evento" com imagem selecionada
- **THEN** `POST /events/with-images` é chamado com FormData; ao sucesso, navega para `/cms/producer/my-events`

#### Scenario: Erro de publicação
- **WHEN** a API retorna erro (4xx/5xx)
- **THEN** uma mensagem de erro é exibida na action bar e o formulário permanece editável
