---
name: security-review
description: Revisão de segurança antes de abrir PR no CMS/web-app (We Party). Use ao tocar em login, sessão, token, upload, rotas, exibição de dados de usuário ou dependências.
license: MIT
metadata:
  author: we-tech
  version: "1.0"
---

Faça esta revisão **a cada implementação** e cole o resultado na descrição do PR.

1. **Mapeie o que mudou**: autenticação/sessão? dado de usuário exibido? upload? rota nova? chamada de API nova? dependência nova?
2. **Percorra o checklist** em `AGENTS.md › Checklist de segurança` (coluna Frontend + Sempre; Backend se tocou a API). Para cada item aplicável: tratado / n/a / pendência.
3. **Verifique na prática** (comandos): `grep -rn "dangerouslySetInnerHTML\|target=\"_blank\"\|localStorage\|document.cookie\|console.log" src` — todo achado novo precisa de justificativa.
4. **Dados**: o que a tela mostra/guarda é o mínimo? (allowlist de campos; nada de token/segredo em log, URL ou storage além do necessário.)
5. **Testes**: rode `weparty-automation/cypress/e2e/cms/cms-seguranca.cy.js`; crie caso novo se a mudança abriu superfície nova (CT-19x/20x).
6. **Pendências grandes** ⇒ `docs/SECURITY.md` (backlog) + tarefa no Plane. Nunca "fica pra depois" sem registro.
7. Dependência nova: nome exato conferido no registro, lockfile junto, `yarn audit`.
