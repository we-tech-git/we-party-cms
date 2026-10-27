## Why

O produtor divulga o evento em Instagram, WhatsApp, influenciadores e promoters, mas o CMS não mostra qual canal traz público: só existe o total de visualizações do evento. A mudança `permitir-ao-produtor-criar-links-rastreaveis-de` do `we-party-social-backend` cria links de divulgação (`POST/GET/DELETE /events/:id/tracking-links`) e conta visitas por link. O produtor precisa de um lugar no CMS para criar o link com um rótulo (ex.: "Instagram"), copiar a URL e ver quantas visualizações cada link trouxe. Tarefa no Plane: WEPARTY-239.

Hoje o CMS não tem nenhuma tela para isso. A tela de edição (`src/app/cms/producer/edit-event/[id]/page.tsx`) só renderiza `EventForm` com os dados do evento. O CMS também não conhece a URL pública do web-app (a única variável de ambiente de URL é `NEXT_PUBLIC_API_BASE_URL`, `src/lib/axios.ts:5`), e a tela "página de desempenho por evento", da qual esta tarefa depende segundo o card, ainda não existe no código. Por isso a seção entra na tela de edição do evento.

## What Changes

- **Seção "Links de divulgação" na tela de edição do evento** (`edit-event/[id]`), abaixo do formulário, só em modo edição:
  - formulário com campo "Rótulo" (1 a 60 caracteres) e botão "Criar link";
  - lista dos links do evento: rótulo, URL completa, total de visualizações, botão "Copiar" e botão "Remover" (com confirmação);
  - estados: carregando, vazio ("Nenhum link criado ainda"), erro com botão "Tentar de novo", 403 ("Você não tem permissão para gerenciar os links deste evento").
- **URL do link:** `${NEXT_PUBLIC_WEB_APP_URL}/event/${eventId}?ref=${code}`. A variável nova `NEXT_PUBLIC_WEB_APP_URL` tem padrão `https://wepartyapp.com` (mesmo domínio de `SITE_URL` no web-app, `src/composables/useSeoMeta.ts:10`).
- **Flag `NEXT_PUBLIC_FF_TRACKING_LINKS`:** só `true` mostra a seção. Desligada, a seção não aparece e nenhuma chamada a `tracking-links` é feita.
- **Camada de dados:** funções `getTrackingLinks`, `createTrackingLink` e `deleteTrackingLink` em `src/services/events.service.ts`, tipos em `src/types/events.types.ts`, hooks TanStack Query em `src/hooks/use-tracking-links.ts`.
- **i18n:** textos em `src/i18n/locales/pt-BR.ts` e `en-US.ts` (o tipo `Dictionary` obriga as duas).

## Fora de escopo

- Contagem por dia, gráfico ou funil por origem (a página de desempenho por evento é outra tarefa).
- Editar o rótulo de um link; só criar, copiar e remover.
- Comissão de promoter, encurtador de URL, atribuição de confirmação/compra ao link.
- Mostrar a seção para quem não é o criador (o backend responde 403 e a seção mostra a mensagem).
- Gerar o client Orval (continua inexistente; usa-se `axiosInstance` como o resto dos services).

## Capabilities

### New Capabilities
- `tracking-links-section`: seção do CMS que cria, lista, copia e remove links de divulgação de um evento, atrás de flag.

## Impact

- **Arquivos (CMS):** `src/app/cms/producer/edit-event/[id]/page.tsx`, novo `src/app/cms/producer/edit-event/[id]/_components/tracking-links-section.tsx`, `src/services/events.service.ts`, `src/types/events.types.ts`, novo `src/hooks/use-tracking-links.ts`, `src/lib/feature-flags.ts` (novo, expõe `isTrackingLinksEnabled`), `src/i18n/locales/pt-BR.ts`, `src/i18n/locales/en-US.ts`, `AGENTS.md` (documentar as duas variáveis novas).
- **Dependência do backend:** as três rotas novas. Com a flag do CMS ligada e a do backend desligada, as chamadas voltam 404 e a seção mostra o estado de erro; por isso a ordem de implantação é backend, CMS, e só então ligar as duas flags.
- **Variáveis:** `NEXT_PUBLIC_FF_TRACKING_LINKS` e `NEXT_PUBLIC_WEB_APP_URL`. Variáveis `NEXT_PUBLIC_*` são gravadas no build: mudar o valor exige novo build/deploy do CMS.
- **Testes:** o CMS não tem suíte de testes (verificação = lint + type-check + build). Cobertura E2E fica no repositório `weparty-automation` (`cypress/e2e/cms/`), por isso os elementos ganham `data-testid`.
- **Como reverter:** desligar `NEXT_PUBLIC_FF_TRACKING_LINKS` e refazer o build. Sem migration nem dado no CMS.
