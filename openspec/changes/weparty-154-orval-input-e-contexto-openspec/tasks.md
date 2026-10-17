## 1. Spec
- [x] 1.1 Proposal e delta spec (`api-client-generation`)

## 2. Orval
- [x] 2.1 `input.target` → `process.env.ORVAL_OPENAPI_URL ?? 'https://api.wepartyapp.com/api-json'`
- [x] 2.2 `output.baseUrl` com o mesmo default de `src/lib/axios.ts`
- [x] 2.3 Atualizar `AGENTS.md` (seção de integração com o backend)

## 3. OpenSpec
- [x] 3.1 Preencher `context` em `openspec/config.yaml`

## 4. Verificação
- [x] 4.1 `yarn lint`, `yarn type-check`, `yarn build`
- [x] 4.2 `GET https://api.wepartyapp.com/api-json` responde 200
- [x] 4.3 `yarn api:generate` baixa o contrato da nova origem; a geração para na validação do próprio spec do backend (2 erros: `DELETE`/`PATCH /events/{eventId}/faq/{faqId}` sem `eventId` declarado como path param). Correção é do backend (`@ApiParam` no `event-faq.controller.ts`), fora desta rodada.
