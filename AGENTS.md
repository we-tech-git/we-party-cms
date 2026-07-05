<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

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
- O client de API é **gerado**, não escrito à mão. Config em `orval.config.ts`:
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
- **NÃO editar à mão** `src/lib/api/` (é gerado pelo Orval — regenerar via `api:generate`)
- NUNCA commitar `.env` com credenciais reais
- NUNCA push direto em `main`/`develop` — sempre via branch + PR
- Rodar `lint` e `build` antes de commitar
- Branch de trabalho de agent: `<agent>/<feature>`; docs: `docs/<slug>`
