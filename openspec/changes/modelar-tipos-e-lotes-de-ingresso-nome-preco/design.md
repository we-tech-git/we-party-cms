## Context

O editor de evento é `EventForm` (`src/app/cms/producer/new-event/_components/event-form.tsx`), usado na criação (`new-event/page.tsx`) e na edição (`edit-event/[id]/page.tsx`, modo `edit` com `eventId`). Ele cria um `useForm` com `zodResolver(createEventSchema)` e envolve tudo em `<form onSubmit=... noValidate>`. O FAQ (`faq-editor.tsx`) usa `useFormContext` e só grava na API quando o produtor clica em Salvar.

Regras do repositório que pesam aqui (`AGENTS.md`): reuso antes de criar; ação assíncrona com botão desabilitado e toast; todo componente em `components/cms` com story; `data-testid` estável; validação do front é só UX; nada de `dangerouslySetInnerHTML`.

Não existe flag, não existe biblioteca de DnD e não existe helper de dinheiro.

## Goals / Non-Goals

**Goals:** o produtor gerencia tipos e lotes de um evento já salvo, com aviso claro de que não há venda; tudo desligável por flag; sem tocar no fluxo atual de salvar evento.

**Non-Goals:** os do `proposal.md`.

## Decisions

**D1. Flag lida em um helper: `src/lib/feature-flags.ts`.**
Exporta `isTicketTypesEnabled()`, que devolve `process.env.NEXT_PUBLIC_FF_TICKET_TYPES === 'true'`. A leitura precisa usar a expressão literal `process.env.NEXT_PUBLIC_FF_TICKET_TYPES`, senão o Next não a substitui no bundle do navegador. Qualquer outro valor ou ausência = desligada.
- Alternativa descartada: ler `process.env` dentro do componente. Espalharia a regra e dificultaria as stories.
- Alternativa descartada: flag vinda da API. Não há endpoint de flags.

**D2. Só na edição.**
Os endpoints são `events/{eventId}/ticket-types`; na criação o evento ainda não tem id. Alternativa descartada: guardar tipos em memória e enviá-los depois do `POST /events`, como o FAQ faz. Isso acoplaria a criação do evento a N chamadas extras, e uma falha parcial deixaria o evento criado sem lotes. Na criação, a seção aparece com o aviso "Salve o evento para cadastrar ingressos" (o produtor fica sabendo que ela existe).

**D3. Cada ação grava na hora; a seção não participa do `useForm` do evento.**
O container `TicketTypesEditor` usa TanStack Query (`useQuery` + `useMutation`) e estado local próprio. Motivos: as rotas são independentes; evita perder lotes se o produtor sair sem salvar o evento; evita estado inconsistente entre o formulário do evento e os lotes. Alternativa descartada: sincronizar tudo no Salvar (como o FAQ), que exigiria diff de lista e tratamento de falha parcial.
- Consequência de UI: o botão Salvar do evento **não** salva lotes. A seção diz isso: "Os lotes são salvos na hora, sem precisar clicar em Salvar evento."

**D4. Sem `<form>` aninhado e sem submit acidental.**
O container renderiza dentro do `<form>` do evento. HTML não permite `<form>` dentro de `<form>`, então o editor de um tipo usa `<div>`, todos os botões são `type="button"` e a tecla Enter nos campos é tratada (`onKeyDown`: Enter confirma o tipo em edição e chama `preventDefault`), para nunca disparar o submit do evento. Esse é o risco mais fácil de passar despercebido.
- O editor de um tipo usa `useState` + validação local (função pura em `src/lib/ticket-types.ts`), não `react-hook-form`, para não criar um segundo `FormProvider` dentro do primeiro.

**D5. Preço: o campo mostra reais, a API recebe centavos inteiros.**
`src/lib/currency.ts` converte texto em centavos **sem ponto flutuante**: aceita `50`, `50,5`, `50,50`, `1.250,00`; recusa letras, negativo e mais de 2 casas; `parseReaisToCents('50,5')` devolve `5050`; `formatCentsToReais(5000)` devolve `R$ 50,00` (usa `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` só para exibir). Preço `0` é válido e aparece como "Gratuito".
- Alternativa descartada: `parseFloat(x) * 100` (`50.1 * 100` dá `5010.000000000001`).

**D6. Datas: `datetime-local` convertido como em `buildDateISO`.**
O campo é `input type="datetime-local"`; ao enviar vira ISO UTC via `new Date(value).toISOString()` (mesma conversão de `buildDateISO` em `_schema.ts`). Ao carregar, o ISO volta para horário local. Vazio = `null` (sem limite). A validação local espelha a do backend: fim estritamente depois do início.

**D7. Reordenar com botões subir/descer, chamando `PUT .../order` com a lista completa.**
Sem biblioteca de DnD no projeto, e botões funcionam por teclado. Cada clique troca dois vizinhos localmente (atualização otimista com rollback, como o AGENTS.md prevê para interações de resposta visual imediata) e envia a lista completa de ids. Em erro, volta a ordem anterior e mostra toast de erro. Alternativa descartada: DnD (nova dependência, sem ganho para poucos lotes).

**D8. Remover pede confirmação inline.**
O botão "Remover" abre, no próprio item, "Remover este ingresso?" com "Confirmar" e "Cancelar". Botão com loading e toast ao fim.

**D9. Componente de apresentação separado do container.**
`TicketTypesList` (`src/components/cms/ticket-types-list.tsx`) recebe `items`, `status` (`loading | error | ready`), `errorMessage` e callbacks, e não conhece rede nem flag. Isso permite a story com os estados vazio, preenchido e erro. O container `TicketTypesEditor` liga a lista aos hooks (regra "componente de página fino").

**D10. Erros da API.**
A mensagem de `response.data.message` (texto ou lista) é mostrada como vem, no padrão de `event-form.tsx`, com texto fixo de reserva. Na listagem, 404 vira o estado "Recurso indisponível neste ambiente" (flag do backend desligada) e 403 vira "Você não tem permissão para gerenciar os ingressos deste evento".

**D11. Quem vê a seção.**
Quem consegue abrir a edição do evento. O CMS não decide permissão; a API é a fonte da verdade (dono ou admin) e o CMS só mostra o erro.

## Risks / Trade-offs

- [Flag `NEXT_PUBLIC_*` é fixada no build] → documentado; desligar exige novo build. Registrar em `AGENTS.md`.
- [Enter dentro de um campo envia o formulário do evento] → D4, com teste Cypress dedicado.
- [Lotes e evento salvam separados; o produtor pode achar que "Salvar" salvou tudo] → texto explícito na seção e toast de sucesso por ação.
- [A story exige nó do Figma (`parameters.design`) e o design da seção ainda não existe] → declarar a pendência do Figma no PR e abrir tarefa, como manda o AGENTS.md; não inventar `figmaNode`.
- [Duas flags precisam ficar alinhadas] → estado de erro explícito quando só a do CMS está ligada.

## Migration Plan

1. Merge do PR do backend, com `FEATURE_TICKET_TYPES` desligada em produção.
2. Merge deste PR com `NEXT_PUBLIC_FF_TICKET_TYPES` desligada. Verificar que o editor de evento está idêntico ao de antes.
3. Em dev/homologação, ligar as duas flags (o CMS exige novo build) e rodar o Cypress.
4. Em produção, ligar só com aprovação do Pedro.
5. **Reverter:** desligar `NEXT_PUBLIC_FF_TICKET_TYPES` e refazer o build. Sem dado a migrar.
