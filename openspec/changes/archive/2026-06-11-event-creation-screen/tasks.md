## 1. Types e serviços

- [x] 1.1 Adicionar `FaqItem`, `InterestDto`, `CreateEventPayload` em `src/types/events.types.ts`
- [x] 1.2 Adicionar `createEvent()` e `createEventWithImages()` em `src/services/events.service.ts`
- [x] 1.3 Criar `src/services/interests.service.ts` com `getInterests()` e `suggestInterest()`
- [x] 1.4 Criar `src/hooks/use-create-event.ts` (useMutation TanStack Query)
- [x] 1.5 Criar `src/hooks/use-interests.ts` (useQuery TanStack Query)

## 2. Schema Zod e utilidades

- [x] 2.1 Criar `src/app/cms/producer/new-event/_schema.ts` com schema Zod completo e tipo `CreateEventForm`
- [x] 2.2 Implementar helper `buildLocationString()` e `buildDateISO()` com lógica overnight no mesmo arquivo

## 3. Subcomponentes da tela

- [x] 3.1 Criar `_components/cover-dropzone.tsx` (drag-and-drop, preview, trocar imagem)
- [x] 3.2 Criar `_components/event-info-form.tsx` (título, descrição com contador de 600 chars)
- [x] 3.3 Criar `_components/date-time-form.tsx` (data início, hora início, data término, hora término)
- [x] 3.4 Criar `_components/location-form.tsx` (CEP + auto-fill ViaCEP + campos manuais)
- [x] 3.5 Criar `_components/interests-selector.tsx` (busca, sugestões, chips selecionados, sugerir novo)
- [x] 3.6 Criar `_components/faq-editor.tsx` (add/remove inline FAQ items)
- [x] 3.7 Criar `_components/visibility-settings.tsx` (toggles visibilidade e comentários)
- [x] 3.8 Criar `_components/live-preview.tsx` (card de prévia no feed, atualizado via watch)
- [x] 3.9 Criar `_components/action-bar.tsx` (sticky bar com hint, salvar rascunho, publicar)

## 4. Página principal

- [x] 4.1 Reescrever `src/app/cms/producer/new-event/page.tsx` com FormProvider, layout duas colunas, orchestração de subcomponentes e submit handler

## 5. Wiring do dashboard

- [x] 5.1 Atualizar botões "Criar evento" em `src/app/cms/home/page.tsx` para navegar para `/cms/producer/new-event`
- [x] 5.2 Atualizar botão "Criar evento" no `src/components/dashboard/spotlight-card.tsx` para navegar para `/cms/producer/new-event`
