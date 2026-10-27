## Contexto

O backend passa a devolver, em `GET /events/{id}/funnel`, as seis contagens e cinco taxas de um evento (ver a mudança de mesmo nome em `we-party-social-backend`). O CMS precisa de uma tela que mostre isso ao produtor, ligada a partir de `my-events`, e de uma forma de entregá-la desligada até o backend estar no ar.

Formato recebido:

    { eventId, views, likes, favorites, interested, going, shares,
      conversions: { likesPerView, favoritesPerView, interestedPerView, confirmationRate, sharesPerView } }

Taxas são frações (0,25 = 25%) ou `null` quando não há base de cálculo.

## Decisões

**D1. Abrir o `EngagementFunnel` em vez de copiá-lo.**
`engagement-funnel.tsx` passa a exportar `FunnelBars({ steps })`, que desenha a lista de barras (largura relativa ao maior valor, valor, rótulo, taxa opcional). O `EngagementFunnel` atual monta suas 4 etapas e chama `FunnelBars`; props, textos e classes de cor não mudam, então `/cms/home` fica igual. A página nova usa `Panel` + `PanelHeader` + `FunnelBars` com 6 etapas.
*Alternativa descartada:* um componente novo só para o evento. É o que o `AGENTS.md` chama de "copiar e colar bloco de estilo" (bug de revisão): as duas telas teriam barras iguais mantidas em dois lugares.
*Alternativa descartada:* dar ao `EngagementFunnel` as 6 props novas. Quebraria o uso de 4 etapas e deixaria o componente cheio de condicionais.

**D2. A taxa vem do backend e `null` vira "—".**
O CMS não recalcula taxas: formata `conversions.*` como porcentagem pt-BR com uma casa (`0.25` → `25,0%`; `2.5` → `250,0%`). `null` mostra "—", nunca `0%` (regra do `AGENTS.md`). A função `pct` do funil atual devolve "—" também para 0 e calcula no cliente; ela continua só para o `EngagementFunnel` da home.
Cada taxa tem rótulo próprio, porque as etapas não formam uma cadeia: curtidas, favoritos, interessados e compartilhamentos são "% das visualizações"; confirmados é "% de quem demonstrou interesse ou confirmou" (`confirmationRate`). A primeira etapa (visualizações) não tem taxa.

**D3. Estados da página.**
- *Carregando*: enquanto a consulta roda, texto "Carregando desempenho…" dentro de `Panel`, no padrão de `my-events`.
- *Erro*: consulta falhou. 403 ou 404 mostram "Evento não encontrado ou sem acesso" com botão de voltar para `my-events` (mesma mensagem de `edit-event`, que não distingue os dois casos); qualquer outro erro mostra "Não foi possível carregar o desempenho" com botão "Tentar novamente" (`refetch`). Não há retry automático em 403/404.
- *Vazio*: as seis contagens são 0. Usa `EmptyState` com "Este evento ainda não teve interação". Não mostra 6 barras zeradas.
- *Dados*: seis barras com taxa. Se só algumas contagens forem 0, as barras aparecem normalmente.

**D4. Flag: um módulo, dois pontos de uso, padrão desligada.**
`src/lib/feature-flags.ts` exporta `EVENT_INSIGHTS_ENABLED = process.env.NEXT_PUBLIC_FF_EVENT_INSIGHTS === 'true'`. A referência precisa ser literal (`process.env.NEXT_PUBLIC_...`), senão o Next.js não a embute no bundle do cliente. Usos: (a) `my-events/page.tsx` só passa `onInsights` ao `EventCard` quando a flag está ligada; (b) `insights/page.tsx` é um Server Component que, com a flag desligada, chama `redirect('/cms/producer/my-events')` antes de renderizar o cliente.
*Alternativa descartada:* checar a flag em `src/proxy.ts`. O proxy hoje só decide login; misturar regra de produto ali esconde a flag num terceiro lugar.
*Alternativa descartada:* checar a flag dentro do componente cliente com `useEffect` + `router.replace`. Renderizaria a tela por um instante antes de sair e dispararia a consulta ao backend.
*Alternativa descartada:* flag em runtime (consulta ao backend). O repositório não tem esse mecanismo e a proposta pede variável de ambiente.
Consequência assumida: `NEXT_PUBLIC_` é embutida no build; ligar ou desligar exige novo deploy.

**D5. Rota em `producer/events/[id]/insights`.**
É o caminho pedido na proposta. Fica diferente do padrão atual (`producer/edit-event/[id]`), mas agrupa as telas futuras do evento sob `events/[id]/` sem mexer na rota existente. Antes de escrever o `page.tsx` consultar `node_modules/next/dist/docs/` (o `AGENTS.md` avisa que esta versão do Next tem mudanças incompatíveis), em especial `params` assíncrono e `redirect`.

**D6. Autorização continua no backend.**
O CMS não verifica dono nem role na página. Se o produtor digitar a URL de um evento alheio, o backend responde 403 e a página mostra o estado de erro de D3. O link de `my-events` só existe para eventos do próprio produtor (a lista vem de `GET /events/my-events`).

**D7. Tipo, service e hook no padrão do repositório.**
`EventFunnelDto` em `src/types/events.types.ts`; `getEventFunnel(eventId)` em `src/services/events.service.ts` (`axiosInstance.get<EventFunnelDto>(\`/events/${id}/funnel\`)`); `useEventFunnel(id)` em `src/hooks/use-event-funnel.ts` com TanStack Query, chave `['event-funnel', id]`, `enabled: !!id`, `staleTime: 30_000` e `retry` desligado para 403/404.

## Riscos

- **Mudar um componente da home.** `EngagementFunnel` é usado em `/cms/home`. Mitigação: o componente mantém props e visual; o `cms-smoke` e os specs do dashboard no Cypress rodam antes do merge.
- **Flag embutida no build.** Desligar não é instantâneo. Mitigação: documentado; a flag nasce desligada, então o primeiro deploy não expõe nada.
- **Números de eventos antigos.** `viewCount` antigo está inflado (WEPARTY-236) e conta chamadas, não pessoas; as taxas por visualização parecem menores. Mitigação: o rótulo diz "visualizações", não "pessoas".
- **Design System.** Mudança em `EventCard` e no funil sem o Figma correspondente seria divergência silenciosa. Mitigação: tarefa de verificação para atualizar o Figma/story ou declarar a pendência no PR.

## Plano de implantação

1. Backend com `GET /events/{id}/funnel` no ar.
2. Merge do CMS com a flag desligada em produção (nada muda para o produtor).
3. Ligar `NEXT_PUBLIC_FF_EVENT_INSIGHTS=true` no preview da Vercel, validar com um produtor de teste, depois em produção com novo deploy.
4. Reverter: variável de volta para desligada + novo deploy.
