## Why
Permitir ao produtor criar um link único por canal de divulgação e ver quantas visualizações cada link trouxe, sem guardar dados do visitante.

## What Changes
- Só o criador do evento pode criar, listar e remover links de rastreamento; promoter ou admin que não é criador recebe 403.
- Limite de 50 links por evento; rótulo obrigatório com 1 a 60 caracteres.
- Código do link tem 8 caracteres do alfabeto seguro, gerado com crypto.randomBytes; colisão tenta até 5 vezes.
- Contagem só incrementa quando ref é válido, pertence ao mesmo evento, flag está ligada e chamador não é o criador.
- Falha ao gravar contagem não derruba a resposta de GET /events/:id; erro vai para log.
- Dia da contagem em horário de Brasília (America/Sao_Paulo); chave primária composta com upsert atômico.
- GET /events/:id ganha OptionalAuthGuard para excluir o criador da contagem.
- Web-app preserva o parâmetro ref no redirect de login via ?next=.
- Tela: CMS: nova seção 'Links de divulgação' na tela de edição do evento, com campo de rótulo, botão 'Criar link', lista com rótulo, URL, total de visualizações, 'Copiar' e 'Remover'.
- Tela: Web-app: nenhuma tela nova; NewEventDetails.vue lê route.query.ref e repassa para getEventById.
- Tela: Backend: sem tela; apenas rotas REST e tabelas novas.
- Dados: Migration aditiva: EventTrackingLink (id, eventId, label, code único 8 chars, createdAt) e EventSourceDailyView (eventId, code, day, count, PK composta).
- Dados: FK de EventSourceDailyView.code para EventTrackingLink.code com ON DELETE CASCADE.
- Dados: Rotas novas: POST/GET /events/:id/tracking-links, DELETE /events/:id/tracking-links/:linkId (só criador).
- Dados: GET /events/:id ganha query param opcional ref e OptionalAuthGuard.
- Dados: Variáveis: FEATURE_TRACKING_LINKS (backend), NEXT_PUBLIC_FF_TRACKING_LINKS e NEXT_PUBLIC_WEB_APP_URL (CMS).

## Impact
- Repositórios: we-party-social-backend, we-party-cms, we-party-web-app
- Fora de escopo: Cookies, deduplicação de visitante, atribuição de compra, comissão de promoter, encurtador de URL, editar rótulo, gráfico por dia, funil por origem, corrigir viewCount antigo.
- Como reverter: Desligar FEATURE_TRACKING_LINKS (backend) e NEXT_PUBLIC_FF_TRACKING_LINKS (CMS, novo build). Tabelas ficam sem uso. Guard novo só é desfeito revertendo o PR do backend.
