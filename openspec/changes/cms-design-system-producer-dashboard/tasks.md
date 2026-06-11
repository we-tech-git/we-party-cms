## 1. Design System Tokens

- [x] 1.1 Add WeParty CSS custom properties to `src/app/globals.css` (`--grad`, `--violet`, `--violet-2`, `--ink`, `--ink-soft`, `--muted`, `--pink`, `--green`, `--blue`, `--amber`, `--line`, `--line-2`, `--shadow`, `--shadow-sm`, `--r`)
- [x] 1.2 Add multi-layer radial gradient background pattern to the `body` rule in `globals.css`
- [x] 1.3 Extend the `@theme inline` block in `globals.css` with Tailwind utility aliases for WeParty brand tokens (e.g. `--color-ink`, `--color-violet`, `--color-pink`, `--color-muted`, `--color-green`, `--color-blue`, `--color-amber`)
- [x] 1.4 Load `Bricolage Grotesque` (500, 700, 800) and `Poppins` (400, 500, 600, 700, 800) via `next/font/google` in `src/app/layout.tsx` — Bricolage exposed as CSS variable `--font-bricolage`; Poppins applied via `.className` directly (replaces Hanken Grotesk spec — `.variable` mode caused Times New Roman fallback on some browsers)
- [x] 1.5 Apply Poppins via `.className` as the default `font-family` on `html`/`body` and set `--font-sans: Poppins, system-ui, sans-serif` in globals.css

## 2. CMS Layout Shell

- [x] 2.1 Create `src/components/cms/topbar.tsx` — sticky frosted-glass top bar with WeParty logo, "Espaço do produtor" sub-label, search pill, notification bell (with pink dot badge), and user avatar (initial from auth store)
- [x] 2.2 Update `src/app/cms/layout.tsx` to render `<TopBar>` above the sidebar+content grid, using a `grid-template-rows: auto 1fr` shell so the topbar is always above the scrollable area
- [x] 2.3 Update `src/app/cms/layout.tsx` content area to use a two-column grid (`230px minmax(0,1fr)`) matching the mockup shell

## 3. Producer Sidebar Redesign

- [x] 3.1 Rewrite `src/components/cms/sidebar.tsx` with WeParty visual style: sticky at `top: 90px`, inline SVG icons, section labels ("Crescimento", "Público"), active gradient style, hover card style
- [x] 3.2 Add navigation groups: root links (Início, Novo evento, Meus eventos with count badge `3`), Crescimento section (Impulsionar, Insights, Descoberta with `#3` badge), Público section (Audiência, Engajamento) — placeholder links use `href="#"` with `pointer-events-none` for unbuilt pages
- [x] 3.3 Add AI promo card at the bottom of the sidebar (dark purple gradient, "✨ Impulsione com IA", gradient CTA button)
- [x] 3.4 Add responsive behaviour: hide section labels and promo card below 880px, collapse to horizontal flex row

## 4. Dashboard Sub-components

- [x] 4.1 Create `src/components/dashboard/kpi-card.tsx` — card with coloured icon, trend badge, large value (Bricolage Grotesque), label, and optional sparkline SVG
- [x] 4.2 Create `src/components/dashboard/spotlight-card.tsx` — event hero card with gradient banner, live badge, popularity progress bar, 4-stat row, and action chip buttons
- [x] 4.3 Create `src/components/dashboard/reach-chart.tsx` — client component with period selector (7D/30D/90D/1A) driving an SVG area chart with brand gradient stroke + violet fill; static data per period
- [x] 4.4 Create `src/components/dashboard/engagement-funnel.tsx` — five-step funnel with proportional-width coloured bars, values, labels, and conversion-rate annotations
- [x] 4.5 Create `src/components/dashboard/event-row.tsx` — single event list item with date chip (violet gradient), name + status badge, sub-info row, and mini popularity bar
- [x] 4.6 Create `src/components/dashboard/ai-suggestions.tsx` — card with four suggestion items (emoji icon, title, description, pink CTA link)
- [x] 4.7 Create `src/components/dashboard/activity-inbox.tsx` — card with four activity feed items (coloured avatar, description, timestamp; comment item has "Responder →" link)

## 5. Producer Dashboard Page

- [x] 5.1 Replace `src/app/cms/home/page.tsx` with the full producer dashboard layout: greeting section, KPI row, two-column content grid (left: SpotlightCard, ReachChart, EngagementFunnel, EventsCard; right: AiSuggestions, ActivityInbox)
- [x] 5.2 Wire static mock data into all dashboard sub-components (no API calls needed — constants defined per component)
- [x] 5.3 Verify responsive breakpoints: 4-column KPIs → 2-column at ≤1180px, two-column content grid → single column at ≤1180px

## 6. Auth Fix (post-spec — required for dashboard to be accessible)

- [x] 6.1 Update `src/stores/auth.store.ts` to write a plain `access_token=<jwt>` cookie on login and clear it on logout (Next.js edge middleware can only read cookies, not localStorage)
- [x] 6.2 Simplify `src/proxy.ts` to read `request.cookies.get('access_token')` — removed Zustand-format cookie parsing
- [x] 6.3 Create `src/providers/auth-hydration.tsx` — client component mounted in root layout that restores the `access_token` cookie from Zustand state on page load (handles browser restart clearing session cookies)

## 7. UI Fixes (post-spec — reported after visual review)

- [x] 7.1 Add `max-w-[1500px] mx-auto` container in `src/app/cms/layout.tsx` so the dashboard doesn't span full ultra-wide screens
- [x] 7.2 Create `src/lib/brand.ts` with hardcoded `GRAD`, `SHADOW`, `SHADOW_SM` constants — replaces `var(--grad)` in inline `style={{}}` props which silently fail if the CSS variable isn't resolved at render time
- [x] 7.3 Replace all `'var(--grad)'` occurrences in inline styles across topbar, sidebar, spotlight-card, engagement-funnel, event-row, home/page.tsx with the `GRAD` import
