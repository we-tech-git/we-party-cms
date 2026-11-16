## ADDED Requirements

### Requirement: Regra 1
The system SHALL cumprir: Só o criador do evento pode criar, listar e remover links de rastreamento; promoter ou admin que não é criador recebe 403.

#### Scenario: Regra 1 respeitada
- **WHEN** o card WEPARTY-239 está em uso
- **THEN** Só o criador do evento pode criar, listar e remover links de rastreamento; promoter ou admin que não é criador recebe 403.

### Requirement: Regra 2
The system SHALL cumprir: Limite de 50 links por evento; rótulo obrigatório com 1 a 60 caracteres.

#### Scenario: Regra 2 respeitada
- **WHEN** o card WEPARTY-239 está em uso
- **THEN** Limite de 50 links por evento; rótulo obrigatório com 1 a 60 caracteres.

### Requirement: Regra 3
The system SHALL cumprir: Código do link tem 8 caracteres do alfabeto seguro, gerado com crypto.randomBytes; colisão tenta até 5 vezes.

#### Scenario: Regra 3 respeitada
- **WHEN** o card WEPARTY-239 está em uso
- **THEN** Código do link tem 8 caracteres do alfabeto seguro, gerado com crypto.randomBytes; colisão tenta até 5 vezes.

### Requirement: Regra 4
The system SHALL cumprir: Contagem só incrementa quando ref é válido, pertence ao mesmo evento, flag está ligada e chamador não é o criador.

#### Scenario: Regra 4 respeitada
- **WHEN** o card WEPARTY-239 está em uso
- **THEN** Contagem só incrementa quando ref é válido, pertence ao mesmo evento, flag está ligada e chamador não é o criador.

### Requirement: Regra 5
The system SHALL cumprir: Falha ao gravar contagem não derruba a resposta de GET /events/:id; erro vai para log.

#### Scenario: Regra 5 respeitada
- **WHEN** o card WEPARTY-239 está em uso
- **THEN** Falha ao gravar contagem não derruba a resposta de GET /events/:id; erro vai para log.

### Requirement: Regra 6
The system SHALL cumprir: Dia da contagem em horário de Brasília (America/Sao_Paulo); chave primária composta com upsert atômico.

#### Scenario: Regra 6 respeitada
- **WHEN** o card WEPARTY-239 está em uso
- **THEN** Dia da contagem em horário de Brasília (America/Sao_Paulo); chave primária composta com upsert atômico.

### Requirement: Regra 7
The system SHALL cumprir: GET /events/:id ganha OptionalAuthGuard para excluir o criador da contagem.

#### Scenario: Regra 7 respeitada
- **WHEN** o card WEPARTY-239 está em uso
- **THEN** GET /events/:id ganha OptionalAuthGuard para excluir o criador da contagem.

### Requirement: Regra 8
The system SHALL cumprir: Web-app preserva o parâmetro ref no redirect de login via ?next=.

#### Scenario: Regra 8 respeitada
- **WHEN** o card WEPARTY-239 está em uso
- **THEN** Web-app preserva o parâmetro ref no redirect de login via ?next=.

### Requirement: Critérios de aceite
The system SHALL cumprir: Os critérios de aceite do card.

#### Scenario: Aceite 1
- **WHEN** o card WEPARTY-239 está em uso
- **THEN** Dono cria link 'Instagram' e recebe code de 8 chars, totalViews=0 e URL completa no CMS.

#### Scenario: Aceite 2
- **WHEN** o card WEPARTY-239 está em uso
- **THEN** Promoter não-dono chama GET/POST/DELETE em tracking-links e recebe 403.

#### Scenario: Aceite 3
- **WHEN** o card WEPARTY-239 está em uso
- **THEN** Visitante logado (não dono) abre ?ref=code válido: count=1 no dia de Brasília; segunda abertura leva a count=2.

#### Scenario: Aceite 4
- **WHEN** o card WEPARTY-239 está em uso
- **THEN** ref inválido ou ausente: nada gravado, resposta igual.

#### Scenario: Aceite 5
- **WHEN** o card WEPARTY-239 está em uso
- **THEN** Dono abrindo com ref logado não soma nada.

#### Scenario: Aceite 6
- **WHEN** o card WEPARTY-239 está em uso
- **THEN** Link com 3+4 visitas aparece com total 7; link novo mostra 0.

#### Scenario: Aceite 7
- **WHEN** o card WEPARTY-239 está em uso
- **THEN** Botão Copiar coloca URL na área de transferência e mostra aviso.

#### Scenario: Aceite 8
- **WHEN** o card WEPARTY-239 está em uso
- **THEN** Remover link apaga link e contagens após confirmação.

#### Scenario: Aceite 9
- **WHEN** o card WEPARTY-239 está em uso
- **THEN** Flags desligadas: rotas 404 no backend, seção some no CMS.

#### Scenario: Aceite 10
- **WHEN** o card WEPARTY-239 está em uso
- **THEN** 51º link ou rótulo inválido: 400.

#### Scenario: Aceite 11
- **WHEN** o card WEPARTY-239 está em uso
- **THEN** Visitante deslogado vai para /login?next=... e retorna com ref preservado.

### Requirement: Tratamento de erros
The system SHALL cumprir: Os casos de erro do card.

#### Scenario: Erro 1
- **WHEN** o card WEPARTY-239 está em uso
- **THEN** Sem login nas rotas de gerenciamento: 401.

#### Scenario: Erro 2
- **WHEN** o card WEPARTY-239 está em uso
- **THEN** Usuário logado que não é criador: 403.

#### Scenario: Erro 3
- **WHEN** o card WEPARTY-239 está em uso
- **THEN** Evento inexistente: 404.

#### Scenario: Erro 4
- **WHEN** o card WEPARTY-239 está em uso
- **THEN** Limite de 50 links ou rótulo fora de 1-60 caracteres: 400.

#### Scenario: Erro 5
- **WHEN** o card WEPARTY-239 está em uso
- **THEN** ref inválido ou ausente: resposta normal, sem gravação.

#### Scenario: Erro 6
- **WHEN** o card WEPARTY-239 está em uso
- **THEN** Flag desligada no backend: rotas respondem 404; ref ignorado.

#### Scenario: Erro 7
- **WHEN** o card WEPARTY-239 está em uso
- **THEN** Flag desligada no CMS: seção não aparece.

#### Scenario: Erro 8
- **WHEN** o card WEPARTY-239 está em uso
- **THEN** Falha ao gravar EventSourceDailyView: log + resposta normal.
