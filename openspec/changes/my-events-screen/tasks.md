## 1. Tipos e serviços

- [x] 1.1 Adicionar `EventDto`, `MyEventsResponse`, `CommentDto`, `CommentsResponse` em `src/types/events.types.ts`
- [x] 1.2 Adicionar `getMyEvents(page?, limit?)` em `src/services/events.service.ts`
- [x] 1.3 Adicionar `deleteEvent(id)`, `patchEvent(id, data)` em `src/services/events.service.ts`
- [x] 1.4 Adicionar `getEventComments(eventId, page?, limit?)` e `deleteEventComment(eventId, commentId)` em `src/services/events.service.ts`

## 2. Hooks TanStack Query

- [x] 2.1 Criar `src/hooks/use-my-events.ts` com `useMyEvents(limit?)` — `queryKey: ['my-events']`, `staleTime: 60_000`
- [x] 2.2 Criar `src/hooks/use-event-comments.ts` com `useEventComments(eventId: string | null)` — `enabled: !!eventId`

## 3. Utilitários de mapeamento

- [x] 3.1 Criar helper `mapEventStatus(status, startDate): 'ativo' | 'rascunho' | 'agendado' | 'encerrado' | 'arquivado'` (PUBLISHED + startDate > now → agendado; PUBLISHED + startDate ≤ now → ativo; DRAFT → rascunho; COMPLETED → encerrado; CANCELLED → arquivado)
- [x] 3.2 Criar helper `calcPopularity(event, maxScore): number` com fórmula `_count.likes * 3 + _count.comments * 2 + _count.attendances * 2.5`, normalizado 0–100
- [x] 3.3 Definir array `EVENT_COVER_GRADIENTS` de fallback e helper `getCoverStyle(event): string` (retorna `backgroundImage` com foto ou gradiente)

## 4. Subcomponentes

- [x] 4.1 Criar `src/app/cms/producer/my-events/_components/event-card.tsx` — card único que suporta modo grid e lista via prop `view: 'grid' | 'list'`; exibe cover, badge de status, título, meta (data + local), chips de interesses, stats (views, likes, confirmações, compartilhamentos), barra de popularidade, botão comentários, botão editar, checkbox de seleção e menu de contexto
- [x] 4.2 Criar `src/app/cms/producer/my-events/_components/events-toolbar.tsx` — tabs de filtro com contadores, input de busca, botão de ordenação e toggle grid/lista; recebe estado e callbacks por props
- [x] 4.3 Criar `src/app/cms/producer/my-events/_components/comment-drawer.tsx` — drawer lateral com overlay; recebe `eventId: string | null`; carrega comentários via `useEventComments`; exibe loading, estado vazio e lista de comentários com botão excluir; fecha ao clicar overlay ou X
- [x] 4.4 Criar `src/app/cms/producer/my-events/_components/delete-modal.tsx` — modal de confirmação de exclusão com nome do evento; callbacks `onConfirm` e `onCancel`
- [x] 4.5 Criar `src/app/cms/producer/my-events/_components/bulk-bar.tsx` — barra sticky fixed-bottom que aparece quando `selectedIds.size > 0`; botões Arquivar, Excluir e Cancelar; recebe contagem e callbacks

## 5. Página principal

- [x] 5.1 Reescrever `src/app/cms/producer/my-events/page.tsx` como `'use client'`; orquestra todos os subcomponentes; gerencia estado local: `filter`, `query`, `sortMode`, `viewMode`, `selectedIds`, `openCommentEventId`, `pendingDeleteEvent`; aplica filtragem, busca e ordenação client-side sobre dados do `useMyEvents`; implementa handlers de ações (arquivar, excluir, seleção, bulk) usando `useMutation` + `queryClient.invalidateQueries(['my-events'])`

## 6. Wiring da sidebar

- [x] 6.1 Atualizar `src/components/cms/sidebar.tsx` para consumir total de eventos do `useMyEvents` e exibir badge dinâmica no item "Meus eventos" em vez do valor hardcoded `'3'`
