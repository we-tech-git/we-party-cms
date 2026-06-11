## ADDED Requirements

### Requirement: Dashboard shows personalised greeting
The system SHALL display a greeting section at the top of `/cms/home` with: a large avatar (user initial in violet-pink gradient), a heading "Bem-vindo, <name>!" with the name in the brand gradient, a subtitle with weekly reach stats, a date pill, an "Arquivados" ghost button, and a "Criar evento" primary gradient button.

#### Scenario: Greeting uses authenticated user name
- **WHEN** the authenticated user loads the dashboard
- **THEN** their display name appears in the greeting heading

#### Scenario: Primary CTA button visible
- **WHEN** the dashboard loads
- **THEN** a "Criar evento" button with the brand gradient is visible in the header actions area

### Requirement: Dashboard KPI row shows four metrics
The system SHALL display a responsive 4-column KPI row (2-column on tablet) with cards for: Pessoas alcançadas (38,2k · +22%), Impressões na descoberta (128k · +31%), Visualizações (45.892 · +12.5%), Curtidas (3.218 · +42%). Static/mock data is acceptable in this iteration. Each card SHALL include a coloured icon, a trend badge, a large numeric value, a label, and an optional sparkline SVG.

#### Scenario: Four KPI cards render
- **WHEN** the dashboard loads
- **THEN** exactly four KPI cards are visible in a row

#### Scenario: Trend badge shows positive growth
- **WHEN** a KPI has a positive trend
- **THEN** the badge shows green text with an upward arrow

### Requirement: Dashboard shows featured event spotlight card
The system SHALL render the spotlight card for the producer's top event ("Sunset Beach Party") with: a gradient hero banner with "Em alta agora" live badge, popularity index progress bar (87/100), event stats row (views, likes, confirmados, shares), and action buttons "Impulsionar alcance", "Ver página", "Editar". Static mock data is acceptable.

#### Scenario: Spotlight card renders with gradient banner
- **WHEN** the dashboard loads
- **THEN** the spotlight card shows a colourful gradient hero section with the event name

#### Scenario: Popularity bar shows 87%
- **WHEN** the spotlight card renders
- **THEN** the progress bar fill is at approximately 87% width

### Requirement: Dashboard shows reach growth chart with period selector
The system SHALL render an area chart (`<svg>`) displaying reach over time, with a segmented period selector (7D, 30D, 90D, 1A). Switching periods updates the chart data, total value, and growth label. Chart uses the brand violet-pink gradient stroke and a soft violet fill area. Static data sets per period are acceptable.

#### Scenario: Default period is 7D
- **WHEN** the chart first renders
- **THEN** the "7D" button is active and shows 7-day data

#### Scenario: Switching to 30D updates chart
- **WHEN** the user clicks the "30D" button
- **THEN** the chart re-renders with 30-day data and the total updates to 182k

### Requirement: Dashboard shows engagement funnel
The system SHALL render a funnel visualisation with five steps: Impressões → Visualizações → Curtidas → Confirmados → Compartilhamentos. Each step shows a coloured horizontal bar whose width is proportional to conversion, a numeric value, a step label, and a conversion-rate annotation. Static mock data is acceptable.

#### Scenario: Funnel steps render in order
- **WHEN** the engagement funnel renders
- **THEN** five coloured bars appear from widest (Impressões) to narrowest (Compartilhamentos)

### Requirement: Dashboard shows upcoming events list
The system SHALL render the "Seus eventos" card with a list of the producer's events. Each row shows: a date chip (day + month abbreviation in violet gradient), event name with status badge (Em alta / Rascunho / Agendado), sub-info (location, views, likes, confirmed count), and a mini popularity bar with label. Static mock data of three events is acceptable.

#### Scenario: Event status badges render with correct colour coding
- **WHEN** an event has status "Em alta"
- **THEN** its badge renders with green background and dark text

#### Scenario: Date chip shows day and month
- **WHEN** an event row renders
- **THEN** the date chip shows the day number and 3-letter month abbreviation in violet gradient

### Requirement: Dashboard right column shows AI suggestions
The system SHALL render the "Sugestões da IA" card with four actionable suggestion items, each with an emoji icon, a bold title, a description, and a pink call-to-action link button. Static mock data is acceptable.

#### Scenario: Four AI suggestion items visible
- **WHEN** the dashboard loads
- **THEN** four AI suggestion rows are visible in the right column

### Requirement: Dashboard right column shows recent activity feed
The system SHALL render the "Atividade recente" card with a list of recent engagement events (comment, likes, shares, confirmations) each with a coloured avatar, description text, and timestamp. Comment items SHALL show a "Responder →" link. Static mock data is acceptable.

#### Scenario: Activity feed shows comment with reply action
- **WHEN** the activity feed renders
- **THEN** the comment item shows a "Responder →" link

### Requirement: Dashboard layout is two-column on desktop, single-column on tablet
The system SHALL use a two-column content grid (main content + 372px right column) on viewports >= 1180px, and collapse to a single column below that breakpoint.

#### Scenario: Two-column layout on wide viewport
- **WHEN** the viewport is wider than 1180px
- **THEN** the main content and right column appear side by side
