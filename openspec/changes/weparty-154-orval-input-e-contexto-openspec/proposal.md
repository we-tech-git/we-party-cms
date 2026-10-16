## Why

Dois débitos do CMS levantados no saneamento do backend (WEPARTY-154):

1. `orval.config.ts` busca o contrato em `https://api.dev.wepartyapp.com/api-docs-json`. O host `api.dev` foi desativado e o caminho `/api-docs-json` nunca existiu — o backend (`src/main.ts`, `SwaggerModule.setup('api/docs', …, { jsonDocumentUrl: 'api-json' })`) serve o JSON em `/api-json`. Por isso `yarn api:generate` nunca rodou com sucesso.
2. `openspec/config.yaml` tem o `context` vazio, então os artefatos gerados pelo OpenSpec (proposal/design/specs/tasks) nascem sem conhecer stack, convenções e fluxo do repo.

## What Changes

- `orval.config.ts`: `input.target` passa a ser `process.env.ORVAL_OPENAPI_URL ?? 'https://api.wepartyapp.com/api-json'` — rota real do backend no host ativo (o mesmo default de `src/lib/axios.ts`). A variável permite apontar para um backend local (`http://localhost:3000/api-json`) ou para um `openapi.json` versionado no backend, quando existir.
- `orval.config.ts`: `output.baseUrl` deixa de usar o host desativado e passa a ter o mesmo default de `src/lib/axios.ts`.
- `openspec/config.yaml`: `context` preenchido com stack, comandos, arquitetura, integração com o backend, convenções e fluxo (branch, CI, commits), derivado do código e do `AGENTS.md`.
- `AGENTS.md`: seção "Integração com o backend" atualizada para a nova origem do Orval.

## Fora de escopo

- Rodar `yarn api:generate` e versionar `src/lib/api/` (adotar o Orval de fato é outra decisão).
- Apontar para o `openapi.json` versionado no backend: depende do desenho em `CONTRATO-OPENAPI.md`, que não estava disponível nesta rodada.
- Tradução de `AGENTS.md`/context para inglês (outro critério da WEPARTY-154).

## Capabilities

### New Capabilities
- `api-client-generation`: origem do contrato OpenAPI usada pelo gerador de client do CMS.

## Impact

- **Arquivos**: `orval.config.ts`, `openspec/config.yaml`, `AGENTS.md`.
- **Runtime**: nenhum. `orval.config.ts` só é lido por `yarn api:generate`; não entra no `next build`.
- **Sem dependências novas.**
