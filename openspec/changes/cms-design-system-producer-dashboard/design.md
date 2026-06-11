## Context

The WeParty CMS was bootstrapped with Next.js 16, shadcn/ui defaults, and a generic Tailwind theme. A complete design system (colours, typography, layout, component patterns) has been specified via an HTML mockup. This change applies that design to the real application, starting with the producer dashboard — the most visible surface for producers.

The project uses:
- Tailwind v4 with `@theme inline` in `globals.css` (CSS-variable-driven, no `tailwind.config.js`)
- shadcn/ui via Radix UI primitives
- `next/font/google` for optimised font loading
- Inline SVG icons (no icon library dependency)
- A `proxy.ts` route guard protecting `/cms/*`

## Goals / Non-Goals

**Goals:**
- Define WeParty brand tokens as CSS custom properties and Tailwind utilities
- Load `Bricolage Grotesque` + `Hanken Grotesk` via `next/font`
- Replace the CMS layout shell with topbar + sidebar + content grid
- Deliver the producer home page (`/cms/home`) matching the HTML mockup
- Keep existing admin routes functional and unstyled (they are out of scope)

**Non-Goals:**
- "Alcance na descoberta" card in the right column (deferred)
- Real API integration for dashboard metrics (static mock data)
- Dark mode for the new WeParty theme
- Admin-specific design system changes

## Decisions

### 1. CSS custom properties in `globals.css`, not a separate token file
Tailwind v4 resolves `@theme` from CSS variables at build time. Keeping all tokens in `globals.css` avoids a build step and keeps the token/theme contract visible in one file. The shadcn/ui tokens (card, border, etc.) are preserved and extended — not replaced — to keep shadcn components working.

**Alternative considered**: Separate `tokens.css` imported via `@import`. Rejected because Tailwind v4 requires `@theme` to be in the root CSS file imported by `layout.tsx`.

### 2. Inline SVG icons, no icon library
The HTML mockup uses custom inline SVGs. Adding Lucide or HeroIcons would introduce a dependency and potentially mismatched stroke widths. We pass SVG elements as ReactNode props to components, keeping visual fidelity with the mockup.

**Alternative considered**: Lucide React (already used in shadcn). Rejected for this surface because the mockup SVGs use non-standard `stroke-width="2.2"` and bespoke paths.

### 3. Dashboard components in `src/components/dashboard/`
Each major section (KpiCard, SpotlightCard, ReachChart, EngagementFunnel, EventRow, AiSuggestions, ActivityInbox) becomes its own component. The page file (`cms/home/page.tsx`) orchestrates them but holds no visual logic. This matches shadcn's colocation pattern and makes sections replaceable when real data arrives.

### 4. ReachChart implemented as a client component with `useState`
The period selector requires state (active tab + current data set). The chart SVG is rendered via React from static data objects, not a charting library, matching the mockup's vanilla JS approach. `'use client'` is scoped to `ReachChart` only; all other dashboard components can remain Server Components.

**Alternative considered**: Recharts or Victory. Rejected — the custom SVG area chart in the mockup has a specific aesthetic that chart libraries don't match easily, and adding a library for one chart is disproportionate.

### 5. Static mock data co-located with components
Dashboard metric values, event lists, and suggestion items are defined as `const` arrays inside component files. When the API is ready, they are replaced by `useQuery` calls from TanStack Query. No placeholder loading states are needed in this iteration.

## Risks / Trade-offs

- **Font CLS**: `Bricolage Grotesque` and `Hanken Grotesk` are loaded from Google Fonts via `next/font`. If the font subset is large, there may be a layout shift on first paint. → Mitigation: Use `display: swap` (default in `next/font`) and only request the weights used.

- **Tailwind purge**: Inline SVG `stroke-width` attributes and `style={{}}` props are not purged, so the bundle is not affected. Classes used only in `globals.css` (e.g. `bg-[var(--grad)]`) must be safelisted if Tailwind v4 does not detect them. → Mitigation: Use CSS custom properties directly in `style` props rather than arbitrary Tailwind values for gradient backgrounds.

- **shadcn/ui colour conflicts**: Adding `--ink`, `--violet`, etc. must not override shadcn's `--primary`, `--card`, etc. → Mitigation: WeParty tokens use distinct names that don't overlap with shadcn's slot names.

## Migration Plan

1. Update `globals.css` with WeParty tokens (additive — no shadcn tokens removed)
2. Update `src/app/layout.tsx` to load new fonts and apply CSS variables
3. Update `cms/layout.tsx` to mount `<TopBar>` and replace the sidebar slot
4. Replace `src/components/cms/sidebar.tsx` with the new producer sidebar
5. Add `src/components/cms/topbar.tsx`
6. Add dashboard sub-components under `src/components/dashboard/`
7. Replace `src/app/cms/home/page.tsx`

Rollback: Each step is a file replacement. Reverting any file restores previous behaviour. No database or API changes are involved.

## Open Questions

- Should "Impulsionar", "Insights", "Descoberta", "Audiência", "Engajamento" sidebar links use placeholder routes or be hidden until their pages are built? → Decision: Render as links to `#` with `pointer-events-none` to avoid 404s while communicating future intent.
