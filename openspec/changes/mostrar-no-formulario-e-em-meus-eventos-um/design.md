## Context

O formulário de evento e o card de Meus eventos trabalham com formatos diferentes: o formulário tem `CreateEventForm` (`_schema.ts:34`), a lista tem `EventDto` (`events.types.ts:163`). O checklist precisa dar o mesmo resultado nos dois, sem backend novo e sem chamada extra.

## Goals / Non-Goals

**Goals:**
- Uma única regra de completude, pura e testável, usada nas duas telas.
- Atualização ao vivo no formulário, sem recarregar.
- Nunca mostrar número enganoso quando o dado não existe.

**Non-Goals:**
- Bloquear salvar ou publicar; qualquer score ou persistência.

## Decisions

### 1. Função pura com entrada normalizada e três estados

`computeCompleteness` recebe `{ hasCover, descriptionLength, faqCount, interestCount, hasEndDate }`, cada campo `boolean | number | null` (`null` = dado ausente). Devolve `items` com `state: 'done' | 'pending' | 'unknown'`, `doneCount` e `total: 5`. Regras: capa `done` se há ao menos 1 foto; descrição `done` com 200 ou mais caracteres depois de `trim()`; FAQ `done` com 1 ou mais pares com pergunta e resposta preenchidas (mesma regra de `buildPayload`, `_schema.ts:92`); interesses `done` com 1 ou mais; término `done` se informado. `null` vira `unknown`.
- Alternativa descartada: receber o `CreateEventForm` ou o `EventDto` direto. Acopla a regra a dois formatos e dificulta o teste.

### 2. Dois adaptadores finos

`completenessFromForm` lê `photos.length + existingPhotoUrls.length`, `description.trim().length`, FAQs com os dois campos preenchidos, `interestIds.length` e `endDate !== ''`. `completenessFromEvent` lê `photos.length`, `description.trim().length`, `faq` (se `undefined`, vira `null`), `eventInterests.length` e `endDate !== null`.

### 3. Selo "—" quando algum item é `unknown`

No card, se qualquer item for `unknown`, o selo mostra "—" (regra "Estado vazio ≠ zero" do `AGENTS.md`). Motivo: o `EventDto` da lista hoje não traz `faq`. Mostrar "3/5" para um evento que na verdade tem FAQ seria afirmar algo falso.
- Alternativa descartada: buscar `GET /events/{id}` por card. Gera até 100 chamadas por abertura da tela (limite padrão de `useMyEvents`, `use-my-events.ts:4`).
- Alternativa descartada: contar FAQ como pendente quando ausente. Faz o selo mostrar nota menor que a real.
- Alternativa descartada: alterar o backend. Fora de escopo desta fatia.

### 4. "Data de término" na lista

Na lista, `endDate !== null` conta como `done`. O CMS sempre envia `endDate` ao criar, então o item quase sempre está feito na lista; isso é aceito e registrado como limitação. No formulário o item reflete o campo vazio ou preenchido.

### 5. Sem feature flag

A proposta dizia que o CMS não tem flag. Tem (`src/lib/feature-flags.ts`), mas a fatia é informativa, sem dado nem API, e reverter o PR basta. Flag adicionaria variável de ambiente e deploy sem ganho.
- Alternativa descartada: `NEXT_PUBLIC_FF_COMPLETENESS`.

### 6. Posição e reuso

O painel fica na coluna da direita do `EventForm`, abaixo de `LivePreview` (`event-form.tsx:113`). Usa `Panel`/`PanelHeader` (`src/components/cms/panel.tsx`) e `Chip` (`src/components/ui/chip.tsx`); a regra de reuso do `AGENTS.md` pede isso. O selo usa `Chip`, sem markup novo de badge.

## Risks / Trade-offs

- Se o backend não devolver `faq` na lista, o selo mostra "—" em todos os cards. Mitigação: a tarefa 1.1 confere a resposta real e o PR registra o resultado; o formulário funciona de qualquer forma.
- A regra dos 200 caracteres é opinião de produto. Mitigação: constante nomeada `MIN_DESCRIPTION_LENGTH` em um só lugar.
- Figma: o `AGENTS.md` exige par no Figma para componente novo. Mitigação: a tarefa 4.3 registra no PR se o espelho no Figma foi feito.

## Migration Plan

Sem migração. Sem flag; reverter o PR remove tudo.
