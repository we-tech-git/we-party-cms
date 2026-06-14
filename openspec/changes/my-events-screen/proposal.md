## Why

O produtor não tem como gerenciar seus eventos pelo CMS — a tela `/cms/producer/my-events` é um placeholder "Em construção". Sem essa tela o produtor não consegue visualizar, filtrar, editar, arquivar nem excluir os eventos que criou.

## What Changes

- Implementar a tela completa de gestão de eventos em `/cms/producer/my-events`
- Adicionar serviço `getMyEvents()` em `src/services/events.service.ts`
- Adicionar serviços `deleteEvent()`, `patchEvent()`, `getEventComments()`, `deleteEventComment()` em `src/services/events.service.ts`
- Adicionar hook `useMyEvents` com TanStack Query
- Adicionar hook `useEventComments` com TanStack Query (lazy, por evento)
- Estender `src/types/events.types.ts` com `EventDto`, `MyEventsResponse`, `CommentDto`, `CommentsResponse`

## Capabilities

### New Capabilities
- `my-events-screen`: Tela de gestão de eventos do produtor com listagem em grid/lista, filtros por status, busca por título, ações por evento (editar, arquivar, excluir, comentários) e ações em massa (arquivar/excluir selecionados); drawer lateral para gerenciar comentários de um evento específico; modal de confirmação de exclusão

### Modified Capabilities
- `producer-dashboard-data`: Badge de contagem "Meus eventos" na sidebar passa a refletir o total real de eventos do produtor (atualmente é hardcoded como `'3'`)

## Impact

- **Novos arquivos**: `src/app/cms/producer/my-events/_components/event-card.tsx`, `events-toolbar.tsx`, `comment-drawer.tsx`, `delete-modal.tsx`, `bulk-bar.tsx`; `src/hooks/use-my-events.ts`, `src/hooks/use-event-comments.ts`
- **Arquivos modificados**: `src/app/cms/producer/my-events/page.tsx` (reescrita completa), `src/services/events.service.ts` (novos serviços), `src/types/events.types.ts` (novos tipos), `src/components/cms/sidebar.tsx` (badge dinâmica)
- **APIs**: `GET /events/my-events`, `DELETE /events/:id`, `PATCH /events/:id`, `GET /events/:eventId/comments`, `DELETE /events/:eventId/comments/:commentId`
- **Sem novas dependências de pacotes** — toda a UI usa primitivos já presentes
