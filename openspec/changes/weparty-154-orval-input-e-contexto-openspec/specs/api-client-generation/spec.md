## ADDED Requirements

### Requirement: Origem do contrato OpenAPI do Orval
O `orval.config.ts` SHALL ler o contrato da rota que o backend realmente serve (`/api-json`), em host ativo, e SHALL permitir sobrescrever a origem pela variável `ORVAL_OPENAPI_URL` sem editar o arquivo.

#### Scenario: Origem padrão
- **WHEN** `yarn api:generate` roda sem `ORVAL_OPENAPI_URL`
- **THEN** o Orval busca `https://api.wepartyapp.com/api-json`

#### Scenario: Origem sobrescrita
- **WHEN** `ORVAL_OPENAPI_URL=http://localhost:3000/api-json yarn api:generate`
- **THEN** o Orval busca o contrato no backend local (ou em qualquer URL/caminho de arquivo informado, como um `openapi.json` versionado)

#### Scenario: Nenhuma referência ao host desativado
- **WHEN** se procura `api.dev.wepartyapp.com` ou `api-docs-json` em `orval.config.ts`
- **THEN** não há ocorrência

### Requirement: Contexto do OpenSpec preenchido
O `openspec/config.yaml` SHALL ter `context` não vazio descrevendo stack, comandos, arquitetura, integração com o backend, convenções de implementação e fluxo de trabalho (branch, CI, commits) do CMS.

#### Scenario: Artefato novo conhece o repo
- **WHEN** um artefato OpenSpec é gerado neste repo
- **THEN** o contexto exibido ao agente inclui a stack (Next.js 16, React 19, TanStack Query, Zustand), a regra de serviços em `src/services/` e o padrão de branch exigido pela CI
