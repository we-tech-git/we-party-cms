## Context

A tela `/cms/producer/my-events` é atualmente um stub "Em construção". O backend já expõe `GET /events/my-events` (retorna eventos paginados com `status`, `_count`, `eventInterests`), `PATCH /events/:id` (update parcial) e `DELETE /events/:id`. O projeto usa TanStack Query v5 para data fetching, Zustand para auth, e componentes do Design System WeParty (tokens CSS + `GRAD`/`SHADOW` de `@/lib/brand`).

## Goals / Non-Goals

**Goals:**
- Listar os eventos do produtor com filtro por status e busca client-side
- Permitir arquivar (`PATCH status: CANCELLED`), excluir (`DELETE`) e navegar para edição de eventos individuais
- Ações em massa: arquivar/excluir múltiplos eventos selecionados
- Drawer lateral de gerenciamento de comentários por evento (carregamento lazy)
- Modal de confirmação de exclusão destrutiva
- Badge dinâmica na sidebar refletindo total de eventos

**Non-Goals:**
- Duplicar evento (sem endpoint no backend)
- Impulsionar evento (sem endpoint no backend)
- Responder comentários (sem endpoint de reply no backend — botão omitido)
- Ocultar comentários (sem conceito de oculto na API — aba omitida)
- Ranking por evento (endpoint `my-events` não retorna score individual — badge rank omitida)
- Paginação infinita/scroll na primeira versão

## Decisions

### Filtragem client-side
Os dados são carregados de uma vez com `limit=100` e filtrados localmente por tab/busca. Alternativa (server-side por tab) criaria um round-trip por clique sem benefício real dado o volume típico de eventos por produtor.

### Mapeamento de status backend → UI
| `status` backend | `startDate` | Badge UI |
|---|---|---|
| `DRAFT` | qualquer | "Rascunho" (amber) |
| `PUBLISHED` | futuro | "Agendado" (violet) |
| `PUBLISHED` | passado/hoje | "Em alta" (green pulsando) |
| `COMPLETED` | qualquer | "Encerrado" (gray) |
| `CANCELLED` | qualquer | "Arquivado" (gray) |

Tab "Todos" exclui arquivados. Tab "Arquivados" mostra apenas status `CANCELLED`.

### Arquivar = PATCH status CANCELLED
Não existe endpoint dedicado de arquivamento. `PATCH /events/:id { status: "CANCELLED" }` é o mecanismo de arquivamento. A UI chama este endpoint e invalida o cache `['my-events']`.

### Mutações otimistas não usadas
Para exclusão e arquivamento, a UI aguarda confirmação da API antes de atualizar a lista (invalidate query no `onSuccess`). Mutações otimistas adicionariam complexidade de rollback sem ganho perceptível na UX desta versão.

### Componentes controlados via useState local
Esta tela não usa React Hook Form — toda a interatividade (filtro ativo, view mode, seleção, drawer aberto, modal) é controlada via `useState` na page raiz, com estado passado por props para subcomponentes.

### Cover fallback com gradiente
Eventos sem `photos[]` recebem um gradiente CSS gerado a partir do `id` do evento (índice nos gradientes pré-definidos), evitando `img src=undefined` ou imagens quebradas.

### Comentários lazy
`useEventComments(eventId)` tem `enabled: !!eventId`. O `eventId` é `null` quando o drawer está fechado, evitando fetches desnecessários.

## Risks / Trade-offs

- **`limit=100` pode ser insuficiente** para produtores com muitos eventos → Mitigação: implementar paginação no hook (aceitar `page`) e adicionar botão "Carregar mais" quando `totalPages > 1`
- **PATCH com `status: CANCELLED`** pode conflitar com o conceito semântico de "cancelado" vs "arquivado" no backend → Mitigação: documentado como decisão consciente; se o backend adicionar status `ARCHIVED` futuramente, apenas o mapeamento muda
- **Sem feedback de popularidade real** (rank removido) → Mitigação: barra de popularidade calculada localmente com `_count.likes * 3 + _count.comments * 2 + _count.attendances * 2.5`, normalizada pelo máximo da lista
