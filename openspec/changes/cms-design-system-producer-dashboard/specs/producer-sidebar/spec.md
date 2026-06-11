## ADDED Requirements

### Requirement: Producer sidebar uses WeParty visual style
The system SHALL replace the current plain sidebar with the WeParty-styled sidebar: 230px wide, sticky below the topbar (`top: 90px`), with SVG icon links, section labels, active state using the brand gradient, and hover state with white card + shadow.

#### Scenario: Active link shows gradient background
- **WHEN** the current route matches a sidebar link
- **THEN** that link renders with the brand gradient background and white text

#### Scenario: Hover state on inactive links
- **WHEN** the user hovers over an inactive link
- **THEN** the link shows a white card with shadow-sm

### Requirement: Sidebar navigation groups match producer context
The system SHALL organise sidebar navigation into three groups:
1. Root links (no label): Início (Home icon → `/cms/home`)
2. Root links: Novo evento (Calendar+ icon → `/cms/producer/new-event`), Meus eventos (Calendar icon → `/cms/producer/my-events`) with a count badge showing the number of active events (static value `3` acceptable in this iteration)
3. **Crescimento** section: Impulsionar, Insights, Descoberta (with badge `#3`)
4. **Público** section: Audiência, Engajamento

Items without a real route in this iteration SHALL still render as links but navigate to `/cms/home` as a placeholder.

#### Scenario: Section labels render
- **WHEN** the sidebar renders
- **THEN** "Crescimento" and "Público" section labels appear above their respective link groups

#### Scenario: Badge on "Meus eventos"
- **WHEN** the sidebar renders
- **THEN** "Meus eventos" shows a violet badge with the number 3

### Requirement: Sidebar includes AI promo card
The system SHALL render a promo card at the bottom of the sidebar with a dark purple gradient background, a headline "✨ Impulsione com IA", a short description, and a "Ativar agora" button styled with the brand gradient.

#### Scenario: Promo card visible on desktop
- **WHEN** the viewport is wider than 880px
- **THEN** the AI promo card is visible at the bottom of the sidebar

### Requirement: Sidebar collapses on mobile
The system SHALL hide section labels and the promo card on viewports narrower than 880px and lay out links horizontally (flex-row wrap).

#### Scenario: Mobile sidebar layout
- **WHEN** the viewport is narrower than 880px
- **THEN** the sidebar renders as a horizontal scrollable row of icon links without labels
