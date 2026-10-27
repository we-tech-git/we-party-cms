## 1. Camada de dados

- [ ] 1.1 `src/types/events.types.ts`: adicionar `TrackingLinkDto { id: string; label: string; code: string; createdAt: string; totalViews: number }`
- [ ] 1.2 `src/services/events.service.ts`: adicionar `getTrackingLinks(eventId)` (`GET /events/${id}/tracking-links`), `createTrackingLink(eventId, label)` (`POST`, corpo `{ label }`) e `deleteTrackingLink(eventId, linkId)` (`DELETE`), todas via `axiosInstance`
- [ ] 1.3 `src/lib/feature-flags.ts` (novo): `export const isTrackingLinksEnabled = process.env.NEXT_PUBLIC_FF_TRACKING_LINKS === 'true'` (referência literal à variável, para o Next substituir no build) e `buildTrackingUrl(eventId, code)` usando `process.env.NEXT_PUBLIC_WEB_APP_URL ?? 'https://wepartyapp.com'` sem barra final
- [ ] 1.4 `src/hooks/use-tracking-links.ts` (novo): `useTrackingLinks(eventId, enabled)` (query `['tracking-links', eventId]`, sem retry em 403) e `useCreateTrackingLink` / `useDeleteTrackingLink` (mutations que invalidam a query)

## 2. Interface

- [ ] 2.1 `src/i18n/locales/pt-BR.ts`: grupo `trackingLinks` com título, rótulo do campo, "Criar link", "Copiar", "Remover", "Link copiado", estado vazio, erro, "Tentar de novo", mensagem de 403, textos da confirmação e dos toasts; `src/i18n/locales/en-US.ts`: mesmas chaves em inglês (o tipo `Dictionary` reprova chave faltando)
- [ ] 2.2 `src/app/cms/producer/edit-event/[id]/_components/tracking-links-section.tsx` (novo): `Panel` com formulário (`react-hook-form` ou estado local; `Input` de `components/ui`, máximo 60 caracteres, `trim`), lista de links, botões `Button`/`IconButton`; estados carregando, vazio, erro, 403; botões com `disabled` + loading durante a ação (regra #2 do `AGENTS.md`); toasts via `useToast`
- [ ] 2.3 Mesmo arquivo: copiar com `navigator.clipboard.writeText` em `try/catch`; confirmação de remoção reaproveitando o padrão de `my-events/_components/delete-modal.tsx` (estender o componente por prop se couber, sem duplicar markup)
- [ ] 2.4 Mesmo arquivo: `data-testid` em `tracking-links-section`, `tracking-links-label-input`, `tracking-links-create`, `tracking-links-item`, `tracking-links-copy`, `tracking-links-views`, `tracking-links-delete`, `tracking-links-empty`, `tracking-links-error`, `tracking-links-forbidden` (para o Cypress)
- [ ] 2.5 `src/app/cms/producer/edit-event/[id]/page.tsx`: depois de `<EventForm mode="edit" .../>`, renderizar `<TrackingLinksSection eventId={event.id} />` somente se `isTrackingLinksEnabled`
- [ ] 2.6 `AGENTS.md`: na seção de variáveis de ambiente, documentar `NEXT_PUBLIC_FF_TRACKING_LINKS` e `NEXT_PUBLIC_WEB_APP_URL` (sem valores reais de segredo)

## 3. Testes

- [ ] 3.1 O CMS não tem suíte de testes: não criar framework novo nesta tarefa. Cobertura E2E fica em `weparty-automation`, `cypress/e2e/cms/tracking-links.cy.ts`: criar link "Instagram", copiar URL, ver contagem 7, estado vazio, estado de erro (500), 403 para não-dono, flag desligada sem seção. Registrar o pedido de teste no PR para o responsável pelo `weparty-automation`

## 4. Verificação

- [ ] 4.1 `yarn lint`, `yarn type-check` e `yarn build` passam
- [ ] 4.2 Com backend local (`FEATURE_TRACKING_LINKS=true`) e `NEXT_PUBLIC_FF_TRACKING_LINKS=true`: criar "Instagram", copiar, abrir a URL copiada em outra sessão e conferir total 1 depois de recarregar a seção; remover e conferir que some
- [ ] 4.3 Com a flag desligada: a seção não aparece e a aba Network não mostra chamadas a `tracking-links`
- [ ] 4.4 No PR: ordem de implantação (backend, CMS, ligar flags) e que `NEXT_PUBLIC_*` exige novo build

## 5. Encerramento

- [ ] 5.1 Rodar `openspec archive permitir-ao-produtor-criar-links-rastreaveis-de` como último commit, para a capability entrar em `openspec/specs/`
