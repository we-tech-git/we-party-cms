## Context

O formulário de evento (`EventForm`) recebe `defaultValues` uma única vez, na montagem (`useForm({ defaultValues })`). Por isso a tela de edição só renderiza o formulário depois que o evento chegou (`edit-event/[id]/page.tsx`). A duplicação precisa do mesmo cuidado.

O backend não é alterado. O CMS valida só por UX; a segurança real é do backend.

## Goals / Non-Goals

**Goals:** cópia em poucos cliques, sempre como `DRAFT`, sem herdar datas, fotos nem contadores, reaproveitando `useEvent`, `mapEventToForm` e `EventForm`.

**Non-Goals:** recorrência, ingressos, ação de publicar rascunho, endpoint novo.

## Decisions

1. **Rota `?from=<id>` na tela existente de novo evento**, em vez de rota nova (`/new-event/duplicate/[id]`). Reaproveita layout e testes. Descartado: rota nova (duplica a página sem ganho).
2. **Carregar a origem com `useEvent(from)`** (`GET /events/{id}`, já usado na edição). Descartado: passar o evento do card por estado ou URL (o card só tem `EventDto`, sem FAQ nem endereço separado em campos) e criar endpoint de duplicação no backend (fora de escopo).
3. **Função pura `mapEventToDuplicateForm(event, suffix)`** em `_schema.ts`, construída sobre `mapEventToForm` e depois sobrescrevendo: `title = title + suffix`, `startDate = ''`, `endDate = ''`, `photos = []`, `existingPhotoUrls = []`. Os horários voltam aos padrões 22:00/06:00 de `EMPTY_EVENT_FORM` (o horário só faz sentido junto com a data). O sufixo vem do i18n (`" (cópia)"` / `" (copy)"`), por isso é parâmetro. Descartado: alterar `mapEventToForm` (usado na edição).
4. **Data obrigatória sem regra nova:** `createEventSchema.startDate` já é `min(1)` e o `ActionBar` já mostra "Adicione um nome e uma data" enquanto estiver vazia. Nada a mudar no schema.
5. **Status DRAFT pelo payload existente:** `POST /events` com `status: 'DRAFT'` via `buildPayload(form, { asDraft: true })`. Descartado: criar publicado e despublicar depois (haveria uma janela em que o evento aparece no feed). Risco: se o DTO do backend não aceitar `status`, a tarefa 1.1 interrompe a implementação.
6. **Rótulo do botão "Salvar como rascunho"** no lugar de "Publicar evento", e o botão desabilitado "Salvar rascunho" some nesse modo, para o texto não prometer publicação. Descartado: manter "Publicar evento" (enganoso).
7. **Autorização por UX no cliente:** a tela compara `event.creator.id` com `useAuthStore().user.id`. Se diferirem, trata como "não encontrado" (não preenche o formulário). Não substitui checagem de backend. Descartado: depender só do backend, porque não foi possível confirmar aqui que `GET /events/{id}` bloqueia eventos de outro produtor (eventos públicos são legíveis por qualquer usuário).
8. **Erro = painel "Evento não encontrado"** (mesmo padrão da edição), não redirect automático: o produtor entende o que houve e tem o link de volta.
9. **Ler `from` com `useSearchParams` dentro de `<Suspense>`** (exigência do Next para páginas estáticas). O Next desta versão tem mudanças de API: conferir `node_modules/next/dist/docs/` antes de escrever. Descartado: ler `window.location` em `useEffect` (como em `my-events/page.tsx:36`), porque o `defaultValues` do formulário só vale na montagem.
10. **Invalidar `['my-events']` em `useCreateEvent`** (`onSuccess`), porque `useMyEvents` tem `staleTime` de 60 s e o rascunho não apareceria. Isso também corrige a criação normal.

## Risks / Trade-offs

- **Backend pode ignorar ou rejeitar `status`.** Mitigação: tarefa 1.1; se rejeitar, a mudança trava e vira dependência de backend.
- **Rascunho sem caminho de publicação no CMS.** O card do rascunho diz "publique para ganhar alcance" (`event-card.tsx:36`), mas o CMS não tem ação de publicar (`UpdateEventPayload` sem `status`). Sem outra mudança, o produtor cria o rascunho e não consegue publicá-lo por aqui. É pergunta aberta para o Pedro; esta spec não decide.
- **Endereço:** eventos externos têm `location` em texto livre; `parseLocation` é "melhor esforço" (comentário em `_schema.ts:140`). A cópia herda esse limite; o produtor revisa antes de salvar.
- **Limite de tamanho do título** no backend não foi verificado; título longo mais o sufixo pode ser rejeitado, e o erro aparece na barra de ação.

## Migration Plan

Sem migração. Deploy normal do PR; reverter o PR desfaz tudo. Rascunhos criados são eventos comuns.
