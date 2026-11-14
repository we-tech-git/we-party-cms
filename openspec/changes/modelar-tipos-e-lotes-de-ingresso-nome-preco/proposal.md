## Why

O produtor não tem onde cadastrar ingressos. O formulário de evento do CMS (`src/app/cms/producer/new-event/_schema.ts`, `createEventSchema`) tem título, datas, endereço, interesses, FAQ, fotos e visibilidade, mas **nenhum campo de preço, quantidade ou lote**. Sem isso o produtor não planeja lotes (1º lote, 2º lote, pista, VIP) e a We Party não valida o modelo com produtores reais antes de ligar o checkout. Tarefa no Plane: WEPARTY-240.

O que existe hoje, conferido no código:

- A tela de edição é `src/app/cms/producer/edit-event/[id]/page.tsx`. Ela carrega o evento com `useEvent(id)` e renderiza `EventForm` (`new-event/_components/event-form.tsx`) em modo `edit`. O `EventForm` é um único `<form>` (linha 100) e hospeda os painéis um abaixo do outro; o último é `<FaqEditor />` (linha 121).
- Toda chamada HTTP mora em `src/services/events.service.ts` e usa `axiosInstance`. O FAQ é o precedente de sub-recurso do evento (`getEventFaqs`, `createEventFaq`, `deleteEventFaq` em `/events/{eventId}/faq`).
- O CMS **não tem mecanismo de feature flag**. As únicas variáveis `NEXT_PUBLIC_*` são `NEXT_PUBLIC_API_BASE_URL` (`src/lib/axios.ts:5`) e `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (`src/hooks/use-google-code.ts:24`). A flag `NEXT_PUBLIC_FF_TICKET_TYPES` da proposta precisa ser criada aqui.
- `src/components/` não tem nenhum componente de ingresso, e não há biblioteca de arrastar-e-soltar no `package.json`.
- O client Orval (`src/lib/api/`) não existe; os tipos e services são escritos à mão.

Evidência de mercado: o Eventbrite dá a cada tipo de ingresso quantidade, período de venda próprio, opção de começar quando outro esgota, mín/máx por pedido e visibilidade (https://www.eventbrite.com/help/en-us/articles/644100/); usuários do Sympla citam virada de lote e cupons como recursos essenciais (https://www.b2bstack.com.br/product/sympla/avaliacoes).

## What Changes

- Nova seção **"Ingressos e lotes"** no editor de evento, **só na edição** de um evento existente e só com `NEXT_PUBLIC_FF_TICKET_TYPES=true`. Permite listar, adicionar, editar, remover e reordenar tipos de ingresso (nome, preço em reais, quantidade, início e fim da venda, visível ou oculto).
- Aviso fixo na seção: "Venda ainda não disponível. Aqui você só planeja os lotes; nenhum ingresso é vendido."
- Cada ação (adicionar, editar, remover, reordenar) chama a API na hora, **sem depender** do botão Salvar do evento.
- Novos: tipos em `src/types/events.types.ts`; funções em `src/services/events.service.ts`; hook `src/hooks/use-event-ticket-types.ts`; helper de flag `src/lib/feature-flags.ts`; helper de dinheiro `src/lib/currency.ts`; validação em `src/lib/ticket-types.ts`; componente de apresentação `src/components/cms/ticket-types-list.tsx` com `*.stories.tsx`; container `new-event/_components/ticket-types-editor.tsx`; textos em `src/i18n/locales/{pt-BR,en-US}.ts`.
- Com a flag desligada (ou ausente), o CMS não renderiza a seção e não faz nenhuma chamada nova.

## Fora de escopo

- Checkout, Mercado Pago, taxas, pedidos, QR code/check-in, cupons, virada automática de lote, meia-entrada.
- Exibir ingressos no web-app ou em qualquer página pública.
- Cadastrar ingressos na **criação** do evento (o evento ainda não tem id). Na criação, a seção mostra só o aviso "Salve o evento para cadastrar ingressos". Ver `design.md`, D2.
- Arrastar-e-soltar para reordenar (sem biblioteca no projeto; a reordenação usa botões subir/descer).
- Gerar o client Orval.
- Mostrar quantidade vendida ou disponível.
- Os testes Cypress em si: ficam no repositório `weparty-automation`, fora deste repo (ver `tasks.md`, grupo 5).

## Capabilities

### New Capabilities
- `event-ticket-types-editor`: seção do editor de evento para planejar tipos e lotes de ingresso, atrás de `NEXT_PUBLIC_FF_TICKET_TYPES`.

### Modified Capabilities
Nenhuma. A capability `event-creation` não muda: o formulário de evento, o schema zod e o payload enviado a `POST /events` e `PATCH /events/:id` continuam iguais.

## Impact

- **Arquivos (CMS):** os listados acima, mais `new-event/_components/event-form.tsx` (uma linha para renderizar o container), `AGENTS.md` (documentar a variável nova) e `docs/DESIGN_SYSTEM.md` (linha do componente novo).
- **Contrato com o backend:** consome as 5 rotas `events/{eventId}/ticket-types` da mudança de mesmo nome no `we-party-social-backend`. Nada existente muda.
- **Variável de ambiente nova:** `NEXT_PUBLIC_FF_TICKET_TYPES`. Por ser `NEXT_PUBLIC_*`, o Next.js a **grava no bundle na hora do build**: ligar ou desligar exige novo build/deploy do CMS.
- **Ordem de implantação:** backend primeiro (flag `FEATURE_TICKET_TYPES` desligada em produção), depois o CMS (flag desligada), depois ligar as duas em ambiente de teste. Ligar em produção só com aprovação do Pedro. As duas flags precisam estar ligadas juntas; se só a do CMS estiver ligada, a seção mostra o estado de erro "Recurso indisponível" (a API responde 404).
- **Como reverter:** desligar `NEXT_PUBLIC_FF_TICKET_TYPES` e refazer o build; a seção some e nenhuma chamada nova acontece. Para reverter o código, reverter o PR (não há dado nem migration no CMS).
