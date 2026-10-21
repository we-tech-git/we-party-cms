# Segurança do CMS — levantamento e backlog

Levantamento feito na WEPARTY-232 (login, sessão e exibição de dados). Checklist permanente: `AGENTS.md › Checklist de segurança` + skill `security-review`. Cobertura automatizada: `weparty-automation/cypress/e2e/cms/cms-seguranca.cy.js` (CT-190 a CT-200).

## Corrigido na WEPARTY-232
| Achado | Correção | Teste |
|---|---|---|
| **Next.js 16.2.9 com 3 críticos (RCE)** e axios/follow-redirects/source-map-js com altos (108 vulns em dependências de produção, 4 críticas) | `next` 16.4.2, `axios` 1.20, `resolutions` p/ transitivas; `shadcn` (CLI) movido para devDependencies → **0 vulnerabilidades em produção** | `yarn audit --groups dependencies` |
| Login guardava a resposta inteira do usuário em `localStorage` (a API pode incluir `apiKey`, `passwordResetToken`, `googleId`…) | allowlist de campos em `auth.store.ts` (`SAFE_USER_FIELDS`) | CT-190 |
| 401 de **credencial errada** disparava o "sessão expirada" (recarregava e escondia o erro); 401 de sessão expirada não limpava o estado persistido (cookie era reescrito → loop de redirect) | interceptor ignora rotas de login e chama `logout()` completo | CT-166, CT-196 |
| `dangerouslySetInnerHTML` na home (texto de alcance) | trocado por nós React | CT-197 (XSS) |
| Upload de capa aceitava qualquer `image/*` (inclui SVG) e sem limite | allowlist JPG/PNG/WebP/GIF/AVIF + 5 MB | CT-198, CT-199 |
| Sem cabeçalhos de segurança | `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, COOP, HSTS (prod), sem `X-Powered-By` | CT-194 |
| Cookie `access_token` sem `Secure` em HTTPS | `lib/auth-cookie.ts` (`Secure` quando HTTPS) | — |
| `JSON.parse` da config do axios no erro de login | usa as variáveis da mutação | CT-165/166 |
| Segredo/PII em URL | verificado: token/senha nunca em query string | CT-191 |
| Guard de rota, logout e links externos | já corretos; agora cobertos | CT-192, 193, 195, 200 |

## Backlog → **uma tarefa única no Plane: "CMS — segurança essencial (hardening)"**
Ordem sugerida por risco. Nada abaixo cabe na migração de layout.

**P0 — sessão e autorização**
1. **Token acessível por JavaScript** (3 cópias: `ACCESS_TOKEN`, `we-party-auth` e o cookie `access_token`). Um XSS rouba a sessão. ➜ cookie **HttpOnly + Secure + SameSite** emitido pelo backend (ou BFF em Route Handler do Next), `withCredentials`, remover do localStorage. (Limitação documentada em `lib/auth-cookie.ts`.)
2. **`proxy.ts` só checa se o cookie existe.** Não valida assinatura nem `exp`. ➜ validar o JWT na borda (jose) e checar o papel em `/cms/admin/*`.
3. **Autorização de admin é só visual no cliente** (`useIsAdmin` lê `localStorage`, editável). ➜ auditar **todos** os endpoints usados pelas telas admin: `RoleGuard` obrigatório e teste 403 para não-admin (estender `api/auth-guards.cy.js`).
4. **Respostas de login (`/users/login` e `/users/google-auth`) espalham o objeto do usuário** (`...userWithoutPassword`). ➜ DTO de resposta com allowlist no backend (hoje o CMS se defende filtrando).
5. **Expiração/revogação**: logout não invalida o token no servidor; `REFRESH_TOKEN` existe nas chaves mas não é usado. ➜ token curto + refresh rotativo + revogação.

**P1 — abuso e vazamento**
6. **Rate limit / bloqueio / captcha no login** (backend) e respostas iguais para conta existente/inexistente — hoje a mensagem "email não verificado" revela que a conta existe, e o CMS mostra a mensagem do servidor como veio.
7. **CSP completa** (começar em report-only): `script-src` com Google Identity Services, `connect-src` com API e ViaCEP, `img-src` do storage, `frame-ancestors 'none'`.
8. **`NEXT_PUBLIC_API_BASE_URL` com fallback para produção**: um ambiente sem a variável escreve em produção. ➜ falhar fechado.
9. **Upload no backend**: validar magic bytes, tamanho, reprocessar a imagem e servir de domínio separado (a validação do front é só UX).
10. **`GET /users/{id}` usado para checar admin**: garantir que devolve só o mínimo (histórico de vazamento de `passwordResetToken`/`apiKey` — ver AGENTS.md).

**P2 — processo**
11. Dependências de **desenvolvimento** com ~200 alertas (toolchain: storybook/shadcn/eslint). ➜ Dependabot/Renovate + `yarn audit` no CI com allowlist.
12. **Pipeline de CI** rodando `cms-seguranca.cy.js` e `yarn audit` a cada PR (`weparty-automation/docs/ci-cd.md`).
13. PII em `localStorage` (`REMEMBERED_EMAIL`, `NEW_CREATED_USER`): baixo risco; expirar/limpar no logout se o time preferir.

## Prática (a cada implementação)
Ver `AGENTS.md › Prática obrigatória de segurança` e a skill `security-review`.
