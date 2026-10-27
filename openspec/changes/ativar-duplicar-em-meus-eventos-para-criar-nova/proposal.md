## Why

Produtores repetem o mesmo evento toda semana ou todo mês (mesmo local, descrição, interesses, FAQ). Hoje precisam preencher o formulário inteiro de novo. Em "Meus eventos" (`/cms/producer/my-events`) o menu "⋮" de cada card já tem o item "Duplicar", mas ele está desabilitado: `src/components/cms/event-card.tsx:79` (`disabled: true`), com o texto vindo da chave `myEvents.card.duplicate` (`src/i18n/locales/pt-BR.ts:150`, `en-US.ts:151`). Tarefa no Plane: WEPARTY-245.

O reaproveitamento é direto porque já existe tudo o que a cópia precisa:

- `src/app/cms/producer/edit-event/[id]/page.tsx` carrega um evento com `useEvent(id)` (`src/hooks/use-event.ts`, `GET /events/{id}`) e o converte em valores do formulário com `mapEventToForm` (`src/app/cms/producer/new-event/_schema.ts:168`).
- `src/app/cms/producer/new-event/page.tsx` renderiza `EventForm mode="create"` com `EMPTY_EVENT_FORM`.
- O `EventForm` já cria evento (`useCreateEvent`: `POST /events`, depois fotos, depois FAQ).

Lacunas encontradas ao ler o código (a proposta original não as citava):

- O payload de criação `CreateEventPayload` (`src/types/events.types.ts:189`) **não tem campo `status`**, e `buildPayload` (`_schema.ts:76`) não o envia. Hoje todo evento criado pelo CMS recebe o status padrão do backend. Para a cópia nascer como `DRAFT` é preciso enviar `status: 'DRAFT'`. O backend não está neste workspace: a tarefa 1.1 confirma que o `CreateEventDto` aceita `status`.
- O botão "Salvar rascunho" do formulário existe, mas está desabilitado ("em breve") em `action-bar.tsx:41`. O botão ativo diz "Publicar evento", o que seria falso para uma cópia em rascunho.
- Não existe hoje nenhuma ação no CMS para **publicar** um rascunho: `UpdateEventPayload` (`events.types.ts:229`) não tem `status` e `patchEvent` só é usado para `CANCELLED`. Ver Design e pergunta aberta.
- O formulário não tem campo "atrações" separado; elas ficam na descrição (o placeholder cita "line-up, atrações"). Copiar a descrição copia as atrações.
- `useMyEvents` usa `staleTime` de 60 s e `useCreateEvent` não invalida a lista; sem ajuste, o rascunho recém-criado pode não aparecer em "Meus eventos" por até 1 minuto.
- O CMS não tem runner de testes (`package.json` sem vitest, jest ou cypress). Teste unitário no CMS não existe hoje; a verificação é `yarn lint`, `yarn type-check`, `yarn build`, e a automação E2E mora no repositório `weparty-automation`.

## What Changes

- `event-card.tsx`: o item "Duplicar" fica habilitado e chama a nova prop `onDuplicate(event)`.
- `my-events/page.tsx`: `onDuplicate` navega para `/cms/producer/new-event?from=<id>`.
- `new-event/page.tsx`: lê `from` da URL. Sem `from`, comportamento atual (formulário vazio). Com `from`, carrega o evento de origem (`useEvent`), valida que pertence ao produtor logado e renderiza o `EventForm` pré-preenchido; evento inexistente, de outro produtor ou com erro de carga mostra um painel "Evento não encontrado" com link de volta, sem formulário.
- `new-event/_schema.ts`: nova função pura `mapEventToDuplicateForm(event, suffix)` (título + sufixo; descrição, endereço, `isPublic`, `allowComments`, `interestIds` e FAQ copiados; `startDate` e `endDate` vazios; sem fotos). `buildPayload` aceita a opção `asDraft` e, nesse caso, inclui `status: 'DRAFT'`.
- `events.types.ts`: `CreateEventPayload` ganha `status?: 'DRAFT'`.
- `event-form.tsx` / `action-bar.tsx`: prop `asDraft`; o botão de envio passa a dizer "Salvar como rascunho" e o botão desabilitado "Salvar rascunho" é ocultado nesse modo.
- `use-create-event.ts`: invalida `['my-events']` ao concluir, para o rascunho aparecer na lista.
- i18n pt-BR e en-US: sufixo da cópia, título e subtítulo da tela, rótulo do botão e mensagem de evento não encontrado.

## Fora de escopo

- Recorrência automática (várias datas de uma vez).
- Copiar comentários, curtidas, confirmados, visualizações, compartilhamentos ou fotos/capa.
- Copiar tipos e lotes de ingresso (backlog separado).
- Endpoint novo de duplicação no backend e qualquer mudança de schema ou de contrato do backend.
- Publicar o rascunho depois (ação "Publicar" para eventos `DRAFT`): hoje não existe no CMS e não é criada aqui. Ver pergunta aberta no relatório.
- Publicação agendada.
- Teste unitário no CMS (não há runner; adicionar um é decisão separada).

## Capabilities

### New Capabilities
- `event-duplication`: duplicar um evento próprio a partir de "Meus eventos", criando uma nova edição pré-preenchida, salva como rascunho.

## Impact

- **Arquivos (CMS):** `src/components/cms/event-card.tsx`, `src/app/cms/producer/my-events/page.tsx`, `src/app/cms/producer/new-event/page.tsx`, `src/app/cms/producer/new-event/_schema.ts`, `src/app/cms/producer/new-event/_components/event-form.tsx`, `src/app/cms/producer/new-event/_components/action-bar.tsx`, `src/hooks/use-create-event.ts`, `src/types/events.types.ts`, `src/i18n/locales/pt-BR.ts`, `src/i18n/locales/en-US.ts`, `src/components/cms/event-card.stories.tsx` (se a story passar props).
- **Backend:** nenhuma mudança. Dependência: o `POST /events` precisa aceitar `status: 'DRAFT'` (a confirmar na tarefa 1.1 lendo `we-party-social-backend`).
- **Testes:** Cypress em `weparty-automation` (PR separado, `cypress/e2e/cms/`); no CMS, `yarn lint`, `yarn type-check`, `yarn build`.
- **Como reverter:** o repositório não tem feature flag de produto. Reverter o PR devolve o item "Duplicar" ao estado desabilitado; nada persistido muda. Rascunhos já criados continuam existindo e podem ser excluídos ou arquivados como qualquer evento em "Meus eventos".
