## Why

O produtor não tem como criar eventos pelo CMS — a tela `/cms/producer/new-event` é um placeholder "Em construção". Sem criação de eventos, o produto não tem valor para o produtor que acabou de se cadastrar.

## What Changes

- Implementar a tela completa de criação de eventos em `/cms/producer/new-event`
- Adicionar serviço de criação de eventos (`POST /events` e `POST /events/with-images`)
- Adicionar serviço de interesses (`GET /interest`, `POST /interest`)
- Adicionar hook de mutation `useCreateEvent` com TanStack Query
- Adicionar hook de query `useInterests`
- Estender `src/types/events.types.ts` com os tipos de payload de criação

## Capabilities

### New Capabilities
- `event-creation`: Formulário completo de criação de eventos com upload de capa, data/hora, localização (CEP auto-fill), interesses, FAQ, configurações de visibilidade e comentários; live preview no feed; action bar sticky com rascunho e publicação

### Modified Capabilities
- `producer-dashboard-data`: Botão "Criar evento" no dashboard passa a navegar para `/cms/producer/new-event` (hoje é um botão sem ação)

## Impact

- **Novos arquivos**: `src/app/cms/producer/new-event/_schema.ts`, `_components/` (8 subcomponentes), `src/services/interests.service.ts`, `src/hooks/use-create-event.ts`, `src/hooks/use-interests.ts`
- **Arquivos modificados**: `src/types/events.types.ts`, `src/services/events.service.ts`, `src/app/cms/producer/new-event/page.tsx`, `src/app/cms/home/page.tsx` (wiring do botão)
- **APIs**: `POST /events`, `POST /events/with-images`, `GET /interest`, `POST /interest`, externo `GET viacep.com.br/ws/{cep}/json/`
- **Sem dependências novas de pacotes** — toda a UI usa primitivos já presentes
