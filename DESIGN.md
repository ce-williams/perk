# PERK design system

## Method
Use the official Impeccable skill installed for this project. Product truth lives in PRODUCT.md. Shape two alternatives before implementation; audit hierarchy, copy, accessibility, responsive behavior, motion, and empty/error states after the build. Reference: https://impeccable.style/ and https://github.com/pbakaus/impeccable. User-requested warm paper and serif typography take precedence over generic detector preferences.

## Two directions
### A — The Benefits Journal (original alternate)
An editorial financial companion: warm paper canvas, forest ink, upright display serif headlines, slim horizontal rules, spacious action rows, and bespoke vector card studies. Navigation is a compact left rail on desktop and a wrapped top navigation on mobile. The original lead is a next action. A forest feature panel anchors the page; value accounting appears as a small supporting ledger. Bronze is reserved for dates and selection accents.

### B — The Private Ledger (selected by user)
A more technical instrument: dark forest canvas, ivory ledger sheets, narrow sans-serif headlines, tabular figures, vertical date rail, squared corners, compact table composition. Better for dense auditing and power users; less welcoming to someone seeking their first benefit. Its difference is composition, hierarchy, type, and density, not just color.

Both are rendered at /directions. The user selected B, then requested a blue-and-orange palette. The final system uses ink blue, warm ivory and burnt orange. The original green explorations remain at /directions as historical studies. The final overview leads with the recorded-value ledger, then the portfolio, with next actions alongside.

## Tokens
- Canvas #f5f4f0, surface #fffefa, ink #192d43, primary #1c4169, navigation/night #142c46, secondary ink #596572.
- Rule #d4d9df; pale blue #e7edf4; burnt orange #be5325; dark orange text #a4471d; danger #ac3425.
- Display: self-hosted Barlow Condensed 500/600, uppercase and compact. Body: self-hosted IBM Plex Sans 400/500/600. Georgia is used only for the PERK wordmark and original alternate. No runtime font network dependency. Numbers use tabular numerals.
- Type scale: 12 metadata, 14 secondary, 16 body, 22 section, 36–64 display. Body line height 1.5. Reading width 65 characters.
- Space: 4, 8, 12, 16, 24, 32, 48, 64px. Page gutter clamp(20px, 4vw, 64px).
- Radius: 4px controls, 12px feature panel, 14px card artwork. No nested decorative cards. Primary panels and controls in the final ledger have square or 2px corners. Thin rules organize lists.

## Composition and components
Desktop rail 218px; content max 1440px; overview main + 310px supporting column at wide sizes. Collapse to one column at 1200px and navigation above content below 760px. Card catalog is a searchable list with immediate multi-selection and a persistent continue action. The ledger panel contains recorded value, evidence breakdown, fee completeness and a formula disclosure. The right column contains one next action. Benefit rows show cadence, remaining demo allowance, enrollment, and a detail action. Native dialog provides focus trapping for usage forms. Every field has a visible label; totals have an adjacent explanation.

## Interaction
Selection updates immediately. Persist after successful browser storage; show a visible failure if storage is unavailable. Outbound issuer links never update state. Enrollment confirmation requires a checkbox and explicit submit. Usage requires a positive amount, service date, and explicit self-report confirmation. Removing a card preserves its records locally and restoring it restores history. Resetting all data requires explicit confirmation. Empty states offer a next step. Toasts use a live region.

## Motion and accessibility
160ms status-toast transition and 120ms button feedback; no looping animation. Respect prefers-reduced-motion. Strong visible focus, minimum 44px touch controls, meaningful link text, semantic navigation, status text, and aria-current. Check 390px and 1440px widths, no horizontal overflow, keyboard dialogs, text contrast and 200% zoom. Charts must have text equivalents. Decorative card vectors have no card numbers or issuer marks and are labeled as illustrations.

## Impeccable context note
The installed 4.7.0 engine reported PRODUCT.md as missing its latest schema stamp. Product facts remain the user-supplied brief; the optional `impeccable init` schema migration was not performed as a side effect.
