## 1. Tipos e componente

- [x] 1.1 Em `src/types/events.types.ts`, adicionar `totalConfirmed?: number` ao tipo da resposta do dashboard (ao lado de `totalAttendances`, que continua)
- [x] 1.2 Em `src/components/dashboard/engagement-funnel.tsx`, trocar a prop `totalAttendances` por `totalConfirmed`; usar `totalConfirmed` na barra "Confirmados" e na largura relativa; quando `undefined`, exibir "—" no valor (a função `fmt` já faz isso)
- [x] 1.3 Em `src/app/cms/home/page.tsx`, passar `totalConfirmed={data?.totalConfirmed}`
- [x] 1.4 Conferir com `grep -rn totalAttendances src` que o funil não usa mais o campo antigo

## 2. Verificação

- [x] 2.1 `yarn lint`, `yarn type-check` e `yarn build` passam
- [ ] 2.2 Conferir no preview da Vercel, com o backend já com `totalConfirmed`, que "Confirmados" difere de um total que inclui "não vou" (usar um produtor de teste com participações em mais de um status)

## 3. Teste automatizado (repositório `weparty-automation`, PR separado)

- [x] 3.1 Adicionar `totalConfirmed` ao fixture `cypress/fixtures/cms/dashboard.json`, com valor diferente de `totalAttendances`
- [x] 3.2 Acrescentar em `CmsHomePage.js` uma verificação da barra "Confirmados" e um teste em `cypress/e2e/cms/` que confira o valor de `totalConfirmed`, e outro para a resposta sem o campo ("—")

## 4. Encerramento

- [ ] 4.1 Rodar `openspec archive corrigir-metricas-funil-produtor` como último commit, para o requisito alterado entrar em `openspec/specs/producer-dashboard-data/`
