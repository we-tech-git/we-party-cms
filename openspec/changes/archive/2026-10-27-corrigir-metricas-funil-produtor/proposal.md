## Why

No dashboard do produtor (`/cms/home`), o bloco "Jornada de engajamento" tem 4 barras: Visualizações, Curtidas, Confirmados e Compartilhamentos. A barra **Confirmados** mostra `totalAttendances` (`src/app/cms/home/page.tsx:101` passa o valor para `EngagementFunnel`, que o exibe em `src/components/dashboard/engagement-funnel.tsx:39,46`). Esse total conta todas as participações de qualquer status, inclusive quem marcou "não vou" ou só "tenho interesse". O nome da barra promete outra coisa. Tarefa no Plane: WEPARTY-236.

O backend (mudança de mesmo nome em `we-party-social-backend`) passa a devolver `totalConfirmed`, que conta só quem confirmou presença. Esta mudança faz o CMS usar esse campo.

## What Changes

- `src/types/events.types.ts` (tipo da resposta do dashboard, perto da linha 74): adicionar `totalConfirmed` como campo opcional, porque durante até 5 minutos depois do deploy do backend a resposta guardada em cache ainda pode vir sem ele.
- `src/components/dashboard/engagement-funnel.tsx`: a prop `totalAttendances` é substituída por `totalConfirmed`. A barra "Confirmados" passa a mostrar esse valor. Se o valor não vier (`undefined`), a barra mostra "—", seguindo a regra do projeto de que métrica que o backend não calculou aparece como "—" e nunca como 0. Não há fallback para `totalAttendances`, porque ele traria de volta o número errado.
- `src/app/cms/home/page.tsx`: passar `data?.totalConfirmed` em vez de `data?.totalAttendances`.
- Nenhuma mudança visual além do número da barra (mesmo rótulo, mesma cor, mesma largura relativa).

## Fora de escopo

- Qualquer mudança nas outras barras do funil ou nos KPIs do topo.
- Funil por evento, séries por dia ou novas telas.
- Tradução ou troca do rótulo "Confirmados".
- Feature flag: o repositório não tem esse mecanismo e a mudança se desfaz revertendo o PR.

## Capabilities

### Modified Capabilities
- `producer-dashboard-data`: o requisito "Funil de engajamento usa métricas reais" passa a usar `totalConfirmed` na barra "Confirmados".

## Impact

- **Arquivos (CMS):** `src/types/events.types.ts`, `src/components/dashboard/engagement-funnel.tsx`, `src/app/cms/home/page.tsx`.
- **Teste automatizado:** o CMS não tem suíte de testes própria (verificação = `yarn lint`, `yarn type-check`, `yarn build`). O teste de comportamento fica no repositório `weparty-automation` (Cypress): o fixture `cypress/fixtures/cms/dashboard.json` ganha `totalConfirmed`, e um teste confere o valor da barra "Confirmados". Isso vai em PR separado nesse repositório.
- **Dependência do backend:** precisa do backend com `totalConfirmed` no ar. Sem ele, a barra mostra "—" (não quebra e não mostra número errado).
- **Como reverter:** reverter o PR; a barra volta a mostrar `totalAttendances`.
