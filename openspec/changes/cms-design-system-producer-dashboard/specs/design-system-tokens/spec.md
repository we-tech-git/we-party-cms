## ADDED Requirements

### Requirement: WeParty brand tokens defined as CSS custom properties
The system SHALL define all WeParty design tokens as CSS custom properties in `globals.css` so that every component can reference them consistently. Tokens include: `--grad` (primary gradient `120deg, #FF9D3D → #FF5F8D → #F0309A`), `--violet` (#7C5CFF), `--violet-2` (#9B6BFF), `--ink` (#221A3D), `--ink-soft` (#544D6E), `--muted` (#8C85A2), `--pink` (#D81B7E), `--green` (#10A87D), `--blue` (#3E7BFB), `--amber` (#E8920C), `--line` (rgba(34,26,61,.08)), `--shadow` and `--shadow-sm`, `--r` (22px border-radius).

#### Scenario: Gradient applied to a button
- **WHEN** a component uses `background: var(--grad)`
- **THEN** it renders the pink-orange gradient matching the WeParty brand

#### Scenario: Semantic color for muted text
- **WHEN** a component uses `color: var(--muted)`
- **THEN** text renders in #8C85A2

### Requirement: WeParty typography loaded via next/font
The system SHALL load `Bricolage Grotesque` (weights 500, 700, 800) and `Hanken Grotesk` (weights 400, 500, 600, 700, 800) via `next/font/google` and apply them as CSS variables `--font-bricolage` and `--font-hanken` respectively. `Hanken Grotesk` SHALL be the default body font; `Bricolage Grotesque` SHALL be used for display headings and numeric values.

#### Scenario: Body text uses Hanken Grotesk
- **WHEN** the app renders any body text
- **THEN** it uses the Hanken Grotesk typeface

#### Scenario: Display headings use Bricolage Grotesque
- **WHEN** a component applies `font-family: var(--font-bricolage)`
- **THEN** it renders in Bricolage Grotesque

### Requirement: Page background uses WeParty radial gradient pattern
The system SHALL apply the multi-layer radial gradient background to the `<body>` — three soft blobs (peach, pink, lavender) over `#FFF4F7` — so the CMS feels warm and premium.

#### Scenario: CMS shell background
- **WHEN** the CMS layout renders
- **THEN** the body background shows the multi-layer radial gradient, not a plain white or grey

### Requirement: Tailwind theme extended with brand tokens
The system SHALL extend the Tailwind v4 `@theme` block with references to the WeParty CSS variables, making them available as Tailwind utility classes (e.g. `text-ink`, `bg-violet`, `shadow-brand`).

#### Scenario: Utility class for brand color
- **WHEN** a component uses `className="text-ink"`
- **THEN** it receives `color: var(--ink)` via Tailwind
