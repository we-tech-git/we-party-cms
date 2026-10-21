# Design System do CMS (visual B)

Fonte de verdade visual: arquivo Figma **Venus Design** — páginas *Design System* (tokens, ícones, cobertura) e *Componentes* (uma ficha por componente). Telas aprovadas: páginas *CMS Desktop* e *CMS Mobile* (seção "Novo layout"). Código e Figma andam juntos — regra em `AGENTS.md › Design System: Figma ↔ código ↔ Storybook`.

- Storybook: `yarn storybook` → http://localhost:6007 · build: `yarn build-storybook`.
- Link Figma de cada story: `parameters.design` (helper `src/lib/figma.ts`).
- Fluxo: skill `figma-code-sync` (`.opencode/skills/figma-code-sync`).

## Tokens (`src/app/globals.css`) ↔ variáveis do Figma
| Token CSS | Classe Tailwind | Figma (Cores/…) | Valor |
|---|---|---|---|
| `--wp-bg` | `bg-wp-bg` | background/app | `#FFF6F8` (fundo liso — sem manchas de gradiente) |
| `--wp-line` | `border-wp-line` | border/warm | `#F6E1E9` |
| `--ink` | `bg-ink` `text-ink` | ink/900 · ink/dark | `#221A3D` |
| `--wp-body` / `--wp-sub` / `--wp-faint` | `text-wp-body` … | neutral/800 · 600 · 400 | `#1F2937` · `#6A7282` · `#9CA3AF` |
| `--wp-primary` / `--wp-secondary` | `bg-wp-primary` … | brand/primary · secondary | `#FF5F8F` · `#FF9A4D` |
| `--wp-magenta` | `text-wp-magenta` | brand/magenta | `#D6336C` |
| `--wp-purple` · `--wp-green` · `--wp-orange` · `--wp-danger` | `text-wp-*` | accent/* · feedback/danger | `#6C5CE7` · `#10A87D` · `#E8730C` · `#DC2626` |
| `--tint-pink/orange/purple/green` | `bg-tint-*` | tint/* | `#FFE8F1` `#FFF1E4` `#EFEAFF` `#E3F7F0` |
| `--wp-gradient` (`-v`) | `bg-(image:--wp-gradient)` | gradient/brand | laranja `#FF9A4D` → coral `#FF5F8F` |
| `--wp-ink-card` | `bg-(image:--wp-ink-card)` | cartão escuro / capa | `#3A2A5E → #8A2F62` |
| raio | `rounded-ctl` (14) · `rounded-panel` (20) | radius/md · card | — |
| sombra | `shadow-card` · `shadow-dark` | shadow/card · dark-card | — |

Regras: **gradiente só em ação principal (Button primary), item ativo e destaques**; nada de preto puro (usar tinta `#221A3D`); sem sombra rosa/glow; emoji → ícone `lucide-react`.

## Mapeamento componente ↔ Figma
Nó = id do componente no Figma (`?node-id=3021-129` etc.). Todos têm `*.stories.tsx`.

| Código | Story | Figma (página Componentes) | Nó |
|---|---|---|---|
| `ui/button.tsx` (variants `primary` `dark` `soft` `line`; sizes `md` `compact`) | UI/Button | Button | 3021:129 |
| `ui/icon-button.tsx` | UI/IconButton | Icon button | 3098:519 |
| `ui/input.tsx` · `ui/field.tsx` | UI/Input | Input | 3022:184 |
| `ui/password-input.tsx` | UI/PasswordInput | Input (login › senha com olho) | 3093:367 |
| `ui/textarea.tsx` | UI/Textarea | Textarea | 3100:582 |
| `ui/search-field.tsx` | UI/SearchField | Search input | 3024:225 |
| `ui/checkbox.tsx` | UI/Checkbox | Checkbox | 3093:404 |
| `ui/switch.tsx` | UI/Switch | Switch | 3098:527 |
| `ui/chip.tsx` | UI/Chip | Chip | 3022:119 |
| `ui/tabs.tsx` (`UnderlineTabs`, `PillTabs`) | UI/Tabs | Tab | 3022:79 |
| `ui/social-button.tsx` | UI/SocialButton | Social button | 3093:408 |
| `ui/toast.tsx` | UI/Toast | Snackbar | 3024:178 |
| `cms/panel.tsx` (`Panel`, `PanelHeader`) | CMS/Panel | Panel header | 3098:577 |
| `cms/stat-card.tsx` | CMS/StatCard | Stat card | 3098:563 |
| `cms/page-header.tsx` | CMS/PageHeader | Page header | 3098:567 |
| `cms/empty-state.tsx` | CMS/EmptyState | bloco "Vazio" (telas CMS) | — |
| `cms/brand-panel.tsx` | CMS/BrandPanel | Brand panel | 3094:533 |
| `cms/event-card.tsx` | CMS/EventCard | CMS event card | 3100:598 |
| `cms/bulk-bar.tsx` | CMS/BulkBar | Bulk bar | 3100:568 |
| `cms/sidebar.tsx` + `nav-link.tsx` | — (usa hooks de dados) | CMS sidebar / Nav item | 3100:1265 · 3093:380 |
| `cms/bottom-nav.tsx` | — (usa hooks de dados) | Bottom nav | 3094:407 |
| `cms/topbar.tsx` | — (usa hooks de dados) | CMS top bar | 3098:503 |
| `cms/icon-tile.tsx` | — | Icon tile | 3022:153 |
| `cms/logo.tsx` | — | logo (WE PARTY) | — |

Sem story hoje: `sidebar`, `bottom-nav`, `topbar` (dependem de store/React Query/rota) — pendência registrada: criar stories com decorators de mock (MSW ou providers fake).

## Telas implementadas (WEPARTY-232)
Login (`app/(auth)/login`), Início (`app/cms/home`), Meus eventos (`app/cms/producer/my-events`), Novo/Editar evento (`app/cms/producer/new-event`). Pendentes no novo layout: telas de administração, drawers de comentários/atividades, modais restantes.

## Checklist ao mexer em componente
1. Figma atualizado (componente + ficha em *Componentes*) · 2. story com todas as variantes · 3. este arquivo · 4. `data-testid` + spec na automação · 5. revisão de segurança (`security-review`).
