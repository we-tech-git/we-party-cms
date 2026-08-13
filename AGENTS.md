
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# we-party-cms — Agent Context

Este arquivo é lido por agents ANTES de qualquer alteração neste repo. É o **CMS / painel** do We Party (produtor de eventos + admin). Consome a API do `we-party-social-backend` através de um **client gerado (Orval)**.

## Stack (FATO, não alterar sem confirmar)
- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4** + **shadcn/ui** (`@base-ui/react`) + **lucide-react** (ícones)
- **Zustand 5** (state) · **@tanstack/react-query 5** (data fetching/cache)
- **axios** (HTTP) · **react-hook-form** (formulários)
- **Orval** (gera o client de API tipado a partir do OpenAPI do backend)
- **React Compiler** habilitado (`babel-plugin-react-compiler`) · i18n em `src/i18n/`

## Comandos
- `dev` — `next dev`
- `build` — `next build`
- `start` — `next start`
- `lint` — `eslint`
- `api:generate` — **`orval`**: regenera o client de API a partir do OpenAPI do backend (rodar quando o contrato do backend mudar)
> Package manager não fixado no `package.json` — confirmar o padrão do time.

## Arquitetura
```
src/
├── app/                  # App Router (Next 16)
│   ├── (auth)/login/     # autenticação
│   └── cms/              # área logada
│       ├── home/
│       ├── producer/     # fluxo do produtor (ex.: new-event)
│       └── admin/        # admin (users, interests)
├── components/           # ui/ (shadcn), dashboard/, cms/
├── lib/
│   ├── api/              # CLIENT GERADO pelo Orval (não editar à mão) + model/ (schemas)
│   └── axios.ts          # axiosInstance (mutator do Orval) + baseURL
├── providers/            # React Query / contextos
├── stores/               # Zustand
├── hooks/ · services/ · types/ · i18n/locales/
```

## Integração com o backend (importante)

> ⚠️ **ESTADO REAL:** o diretório `src/lib/api/` **não existe**. O Orval está
> configurado mas nunca foi executado com sucesso — o `input.target` aponta para
> `/api-docs-json`, caminho que não existe (o backend serve o JSON em **`/api-json`**
> e a UI em `/api/docs`). **Toda a integração é escrita à mão em
> `src/services/*.service.ts`** usando o `axiosInstance`. É lá que se mexe.
> Para adotar o Orval de fato, corrija antes o `input.target`.

Config em `orval.config.ts` (ainda não operante):
  - **input** (spec): `https://api.dev.wepartyapp.com/api-docs-json` (Swagger/OpenAPI do backend)
  - **output**: `src/lib/api` (mode `tags-split`, client `react-query`, httpClient `axios`), schemas em `src/lib/api/model`
  - **mutator**: `src/lib/axios.ts` → `axiosInstance`
- **Base URL:** `process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api.dev.wepartyapp.com'` (em `src/lib/axios.ts`).
- Ao mudar endpoints/DTOs no backend: rodar `api:generate` para atualizar `src/lib/api`.
- CEP/endereço: usa API externa ViaCEP (`viacep.com.br`) no formulário de evento.

## Variáveis de ambiente (prefixo `NEXT_PUBLIC` p/ client)
- `NEXT_PUBLIC_API_BASE_URL` — URL base da API (default `https://api.dev.wepartyapp.com`)

## Documentação (no repo)
- `openspec/` — specs de capacidades/mudanças
- `CLAUDE.md` — referencia este `AGENTS.md`

## Safety
- `src/lib/api/` não existe hoje; se um dia o Orval passar a gerar, aí sim não editar à mão
- NUNCA commitar `.env` com credenciais reais
- NUNCA push direto em `main`/`develop` — sempre via branch + PR
- Rodar `lint` e `build` antes de commitar
- Branch de trabalho de agent: `<agent>/<feature>`; docs: `docs/<slug>`

## Regras de implementação (frontend) — OBRIGATÓRIAS

### 1. Reuso antes de criar
Antes de escrever botão, input, modal, card, badge, tabela ou qualquer bloco de UI:
1. Procure em `src/components/ui/` e `src/components/cms/` — o componente pode já existir.
2. Se existe algo **parecido mas não igual**, estenda via prop em vez de duplicar o markup.
3. Se a lógica é compartilhada mas o visual não, extraia a lógica para `src/lib/` ou `src/hooks/` e deixe cada tela com seu render. *(Ex.: `relativeTime` vive em `src/lib/date.ts` e é usado pelo feed do produtor e pelo de auditoria admin.)*
4. Só crie um componente novo quando nenhuma das opções acima serve — e crie-o em `components/`, não inline na página.

Copiar-e-colar bloco de estilo entre páginas é considerado bug de revisão.

### 2. Ação assíncrona = loading no gatilho + toast no fim
Toda ação que dispara requisição (salvar, publicar, excluir, bloquear, upload) deve:
- **Desabilitar o próprio botão e mostrar estado de carregando nele** já no clique — o feedback fica no elemento acionado, não só numa área distante da tela.
- Ao terminar, emitir **toast** de sucesso ou de erro com mensagem acionável.
- Impedir duplo disparo enquanto pendente.

**Exceção:** interações cujo retorno já é visual e imediato — like, comentário, "eu vou", toggle de favorito. Nesses casos use atualização otimista e reverta em caso de erro, sem toast de sucesso (o toast de erro continua valendo).

### 3. Estado vazio ≠ zero
Métrica que o backend não sabe calcular deve chegar `null` e renderizar `—`. Renderizar `0` é afirmar um fato falso ao admin.

### 4. Boas práticas de arquitetura
- Chamada HTTP mora em `src/services/*.service.ts`; componente não chama `axios` direto.
- Cache/estado de servidor é do TanStack Query (`src/hooks/use-*.ts`); Zustand só para estado de cliente.
- Tipos da API em `src/types/`, espelhando o DTO do backend.
- Normalize a resposta na camada de service — a página recebe dado já em formato próprio.
- Componente de página fino: orquestra hooks e delega render.

## Checklist de segurança (verificar a CADA nova implementação)

Não é burocracia: a lista existe porque estes erros já apareceram neste código.
Antes de abrir PR, percorra a coluna que se aplica ao que você mexeu.

### Sempre (qualquer camada)
- **Exposição excessiva de dados** — nunca devolver o model do ORM inteiro. Selecione campos explicitamente. *(Já aconteceu aqui: `GET /users/:id` vazava `passwordResetToken` e `apiKey`.)*
- **IDOR / BOLA** (Broken Object Level Authorization) — receber um `id` do cliente e confiar nele. Sempre validar que o solicitante pode acessar **aquele objeto**, não só que está autenticado.
- **Autorização por função ≠ autenticação** — `UserInfoGuard` só prova quem é; falta `RoleGuard` para provar que pode.
- **Segredo em log / mensagem de erro** — tokens, senhas, e-mails completos e stack traces não vão para log nem para a resposta.
- **Falha aberta** — em caso de erro, o padrão é negar. Nunca `catch` que devolve "autorizado".

### Backend / API
- **Mass assignment** — não repassar `req.body` direto para `update()`. Use DTO com allowlist (`whitelist: true` no ValidationPipe). Campos como `role`, `isBlocked`, `type` jamais vêm do cliente.
- **Injeção de SQL** — em `$queryRaw`/`$queryRawUnsafe`, todo valor do cliente entra como **parâmetro vinculado** (`$1`), nunca concatenado na string.
- **SSRF** — ao buscar URL fornecida pelo usuário (imagem, webhook, ViaCEP), validar esquema e bloquear IPs internos (169.254.169.254, 10/8, 127/8, ::1).
- **Path traversal / Zip slip** — nome de arquivo vindo do usuário nunca compõe caminho de disco sem normalizar e confinar ao diretório-alvo.
- **JWT** — validar `exp`, algoritmo fixado (rejeitar `alg: none`), segredo forte e fora do código.
- **Enumeração de contas** — login, "esqueci a senha" e cadastro devem responder igual para e-mail existente e inexistente, e ter rate limit.
- **Comparação de segredo em tempo constante** — API key/token com `crypto.timingSafeEqual`, não `===`.
- **ReDoS** — regex com quantificador aninhado (`(a+)+`) sobre entrada do usuário trava o event loop.
- **Race condition / TOCTOU** — "verifica depois grava" precisa de transação ou constraint única no banco.
- **CORS** — allowlist explícita. Nunca refletir `Origin` com `credentials: true`.

### Frontend
- **XSS** — evitar `v-html` (Vue) e `dangerouslySetInnerHTML` (React). Se for inevitável, sanitizar antes. Conteúdo de usuário (comentário, bio, nome de evento) é sempre hostil.
- **Upload de SVG** — SVG executa script. Trate como imagem só depois de sanitizar, ou sirva de outro domínio/com `Content-Disposition: attachment`.
- **Tabnabbing** — `target="_blank"` sempre com `rel="noopener noreferrer"`.
- **Open redirect** — parâmetro de retorno (`?next=`) só pode apontar para caminho relativo da própria app.
- **Token em storage** — não logar, não colocar em URL/query string, limpar no logout (inclusive cookie).
- **Dado sensível em query string** — vai para histórico, log de proxy e `Referer`. Use corpo da requisição.
- **Confiar em validação de cliente** — validação no front é UX; a regra tem que existir no backend também.
- **Prototype pollution** — merge recursivo de objeto vindo da API sem bloquear `__proto__`/`constructor`.

### Dependências
- **Dependency confusion / typosquatting** — conferir o nome exato do pacote e se ele existe no registro público antes de instalar.
- **Lockfile** — mudança de dependência sempre com lockfile versionado junto.
- Rodar `yarn npm audit` (ou equivalente) quando adicionar dependência nova.
