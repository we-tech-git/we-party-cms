## ADDED Requirements

### Requirement: Sticky top bar renders on all CMS pages
The system SHALL render a `<TopBar>` component at the top of `cms/layout.tsx` that is sticky (`position: sticky; top: 0`), has a frosted-glass background (`rgba(255,244,247,.78)` + `backdrop-filter: blur`), and sits above the sidebar+content shell.

#### Scenario: Scrolling does not lose the top bar
- **WHEN** the user scrolls down on any CMS page
- **THEN** the top bar remains fixed at the top of the viewport

### Requirement: Top bar displays WeParty logo and sub-label
The system SHALL display the WeParty logomark (gradient icon + "WE PARTY" wordmark in the brand gradient) and the sub-label "Espaço do produtor" in violet-pink gradient — both using `Bricolage Grotesque`.

#### Scenario: Logo visible in top bar
- **WHEN** any CMS page loads
- **THEN** the logo and "Espaço do produtor" label are visible in the top bar

### Requirement: Top bar includes search affordance
The system SHALL render a pill-shaped search input placeholder ("Buscar nos seus eventos...") in the top bar centre-right area. Clicking it MAY be a no-op in this iteration (future search feature).

#### Scenario: Search pill visible
- **WHEN** the viewport is wider than 880px
- **THEN** the search pill is visible in the top bar

### Requirement: Top bar shows notification bell and user avatar
The system SHALL show an icon button for notifications (with a pink dot badge) and a circular avatar with the user's initial (derived from the auth store) on the right end of the top bar.

#### Scenario: Notification dot visible
- **WHEN** the top bar renders
- **THEN** a pink dot is visible on the notification bell button

#### Scenario: User avatar shows initial
- **WHEN** the user is authenticated
- **THEN** the avatar displays the first character of the user's name in uppercase
