# MVP scope and acceptance

## Delivered demo scope
Six navigable surfaces: Overview, My Cards, Card Detail & Benefits, Action Center, Benefit Calendar, Settings. Search a 12-card US catalog; add multiple cards without an account, or explicitly load a sample. Local browser persistence, editable opening date and fee, portfolio removal/restoration, benefit relevance, eligibility/enrollment review, usage history, explanatory value accounting, and calendar export. All benefit definitions and allowances are fictional demo fixtures, even when shown alongside real product names. Annual fees start unknown.

## Flows and acceptance
1. Empty overview → Add cards → search/select three → view actions. No personal or payment details required. Selections survive reload. Measure the 60-second task in a later usability study.
2. Action → benefit detail shows what to do, why, period, deadline, calculation, provenance, prerequisites, instructions and verification. Fictional benefits never claim an issuer enrollment link exists. Issuer homepage opens independently.
3. Enrollment → explicit confirmation → self-reported enrolled status. Unknown/estimated/confirmed are distinct; users cannot fabricate issuer-confirmed evidence. Opening a link does not change status.
4. Record usage → positive integer cents, service date in supported current period, amount ≤ remaining cap, explicit confirmation → appended self-reported record. UI totals update, history remains visible, undo creates a reversal rather than silently deleting evidence.
5. Calendar → month navigation and upcoming reset deadlines → download a standards-compatible .ics with all-day reminders. Calendar export is user initiated; no implied email delivery.
6. Settings → relevance/reminder preferences persist; export JSON; explicit delete/reset clears only this demo's key. No card numbers requested. Fees entered by the user produce a clearly described calendar-year comparison.

## Required verification
Unit tests for calendar/month/quarter/year boundaries, leap anniversary clamping, missing dates, invalid dates, year rollover, old/future/reversed usage, integer cents and over-cap rejection, evidence separation, enrollment transitions, irrelevant/ineligible suppression, deterministic priority, fee unknown vs zero, and period-specific balances. Production build and TypeScript must pass. Browser QA should cover empty onboarding, three-card selection, action, confirmation, usage, reload, all pages, and mobile layout. Report any untested environment boundary honestly.

## Exclusions and production gates
No live financial synchronization, enrollment automation, protected-session scraping, recommendations to apply for credit, point valuation, live payment, household sharing, email delivery, issuer-confirmed claims, or production card benefit terms. Supabase migration and integration design are foundations only until configured, tested and deployed. A runnable demo is not a launch-ready financial product. Verified production catalog ingestion, auth, server persistence, billing and delivery are explicit next phases.
