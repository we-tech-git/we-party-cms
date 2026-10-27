## Context

A tela de edição do evento é `src/app/cms/producer/edit-event/[id]/page.tsx`: carrega o evento com `useEvent` (`src/hooks/use-event.ts`, que chama `GET /events/:id`) e renderiza `<EventForm mode="edit" .../>`. Páginas são finas e delegam render; chamadas HTTP ficam em `src/services/*.service.ts` via `axiosInstance` (`src/lib/axios.ts`); estado de servidor em hooks `use-*.ts` com TanStack Query; textos em `src/i18n/` (tipo `Dictionary` derivado de `pt-BR`, então `en-US` precisa ter as mesmas chaves). Ação assíncrona usa botão com loading + toast (`useToast`, `src/components/ui/toast.tsx`); a regra do `AGENTS.md` exige impedir duplo disparo.

O CMS abre `GET /events/:id` como dono, e o backend (nesta mesma tarefa) passa a não contar essa visita.

## Goals / Non-Goals

**Goals:** criar, copiar, listar com total e remover links, atrás de flag, seguindo as convenções do CMS.

**Non-Goals:** ver "Fora de escopo" na proposta.

## Decisions

1. **Local: tela de edição do evento, não uma tela nova.** A tarefa "página de desempenho por evento" (dependência no card) não existe no código; criar rota nova aqui seria inventar navegação. A seção é um componente isolado (`tracking-links-section.tsx`) que pode ser movido para a futura página sem mudança de lógica. Alternativa descartada: nova rota `/cms/producer/my-events/[id]/links` (precisaria de item de menu e de card de entrada em `my-events`).

2. **Flag `NEXT_PUBLIC_FF_TRACKING_LINKS` lida em `src/lib/feature-flags.ts`:** `process.env.NEXT_PUBLIC_FF_TRACKING_LINKS === 'true'`. Fica em arquivo próprio para a próxima flag reaproveitar. O Next substitui a variável no build, então ela precisa ser referenciada literalmente (não `process.env[nome]`).

3. **URL montada no CMS com `NEXT_PUBLIC_WEB_APP_URL`** (padrão `https://wepartyapp.com`, sem barra final). O backend devolve só o `code`, porque não conhece a origem do web-app (`FRONTEND_URL` só é usado no e-mail de senha). Alternativa descartada: backend devolver a URL pronta (acopla o backend ao domínio do front e quebra em ambiente de dev/preview).

4. **Copiar com `navigator.clipboard.writeText`**, com toast "Link copiado". Se a API não existir ou rejeitar (HTTP sem contexto seguro, permissão negada), mostrar toast de erro e deixar a URL visível e selecionável no campo. Alternativa descartada: `document.execCommand('copy')` (obsoleto).

5. **Remoção com confirmação** (mesmo padrão do `delete-modal.tsx` de `my-events`): remover apaga as contagens no backend e não tem desfazer.

6. **Total vem pronto do backend (`totalViews`)**; o CMS não soma nada. Valor `0` é mostrado como `0` (é uma contagem real, não uma métrica não calculada; a regra "métrica não calculada vira —" não se aplica).

7. **403 tratado como estado próprio**, não como erro genérico: o interceptor do axios só desloga em 401. A mensagem diz que o evento não é do usuário.

8. **Chave de cache** `['tracking-links', eventId]`; criar e remover invalidam essa chave.

## Risks / Trade-offs

- **Flag do CMS ligada com a do backend desligada:** as chamadas dão 404 e a seção mostra erro. Mitigação: ordem de implantação no card/PR.
- **`NEXT_PUBLIC_*` é gravada no build:** ligar/desligar exige novo deploy do CMS. Aceito (é como `NEXT_PUBLIC_API_BASE_URL` já funciona).
- **Domínio padrão fixo (`https://wepartyapp.com`)** gera link de produção em ambiente de dev se a variável não for definida. Mitigação: documentar `NEXT_PUBLIC_WEB_APP_URL` no `AGENTS.md`.
- **Sem testes automatizados no CMS:** a cobertura é E2E no `weparty-automation`; `data-testid` obrigatórios para isso.

## Migration Plan

1. Backend em produção com a migration e a flag desligada.
2. Merge do CMS com `NEXT_PUBLIC_FF_TRACKING_LINKS` ausente (seção invisível).
3. Ligar `FEATURE_TRACKING_LINKS` no backend, depois `NEXT_PUBLIC_FF_TRACKING_LINKS=true` no CMS e refazer o build.
4. Reverter: desligar a flag do CMS e refazer o build.
