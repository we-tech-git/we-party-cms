## 1. Implementação
- [x] 1.1 Dono cria link 'Instagram' e recebe code de 8 chars, totalViews=0 e URL completa no CMS.
- [x] 1.2 Promoter não-dono chama GET/POST/DELETE em tracking-links e recebe 403.
- [x] 1.3 Visitante logado (não dono) abre ?ref=code válido: count=1 no dia de Brasília; segunda abertura leva a count=2.
- [x] 1.4 ref inválido ou ausente: nada gravado, resposta igual.
- [x] 1.5 Dono abrindo com ref logado não soma nada.
- [x] 1.6 Link com 3+4 visitas aparece com total 7; link novo mostra 0.
- [x] 1.7 Botão Copiar coloca URL na área de transferência e mostra aviso.
- [x] 1.8 Remover link apaga link e contagens após confirmação.
- [x] 1.9 Flags desligadas: rotas 404 no backend, seção some no CMS.
- [x] 1.10 51º link ou rótulo inválido: 400.
- [x] 1.11 Visitante deslogado vai para /login?next=... e retorna com ref preservado.

## 2. Testes
- [x] 2.1 Backend (Jest): criar link, autorização, totalViews, recordRefView, findById com/sin ref, OptionalAuthGuard, typecheck, openapi.json.
- [x] 2.2 Web-app (Vitest): getEventById com ref, sem ref, URL codificada, compartilhar sem ref, privateRouteGuard com ?next=.
- [x] 2.3 CMS: lint, type-check e build.
- [x] 2.4 Cypress (weparty-automation): criar, copiar, contagem, estados, 403, flag desligada; data-testid tracking-links-*.
