# PERK architecture

## Runtime boundary
Next.js App Router, TypeScript, Tailwind CSS, semantic native controls and native dialog. The runnable MVP is a local-first demo, with browser storage under a versioned key and no credentials or issuer requests. Exportable static pages allow a portable preview. A repository interface separates persistence from the rule engine. Supabase/PostgreSQL, Stripe, and scheduled jobs are production foundations, not falsely simulated live integrations.

## Relational model
The executable foundation is supabase/migrations/0001_foundation.sql.

| Entity | Relationships and purpose |
| --- | --- |
| issuers | Official identity, approved host |
| card_products / card_variants | Stable family, network/tier variant, catalog status |
| benefit_definitions / benefit_revisions | Stable identity plus immutable effective-dated terms, integer cents, currency, cadence, eligibility, enrollment, reset timezone, demo/verification state |
| benefit_sources / approved_links | Evidence URL, checked timestamp, verification reviewer, approved enrollment/instruction destination |
| households / household_memberships | Future explicit sharing boundary; users remain private by default |
| user_cards | Owner, variant, nickname, opening date, fee supplied by user, archived timestamp |
| user_benefit_states | Card + benefit, eligibility, relevance, enrollment and evidence; no monetary balances stored here |
| enrollment_events | Append-only transitions and evidence with actor and timestamp |
| usage_records | Revision and card references, actual cents, service date, evidence, reversal link; append-only |
| user_preferences | Timezone, reminder opt-in and lead days |
| subscriptions / webhook_events | Server-owned Stripe identity, entitlements, idempotency |
| reminder_jobs / catalog_reviews | Idempotent work, retry/lease metadata, freshness review queue |

## Revisions and audit
Never overwrite a published revision. A new revision closes the prior effective interval in an administrative transaction and appends a new row. Historical usage points to its original revision. UI calculations choose the revision effective for the service date and calculate each period without reinterpreting prior redemptions. Catalog publish must reject interval overlap and unverified terms. Revocation does not delete history. A migration to production must not promote demo rows.

## Rules engine
Pure functions in src/lib/rules.ts accept a civil date (YYYY-MM-DD), revision, opening date, and records. Date-only math uses UTC components as arithmetic, not the device's current timezone. Production converts instants into issuer reset timezone first. Periods are half-open [start, nextStart); deadline is nextStart minus one day. Monthly and quarterly reset on calendar boundaries; calendar year starts Jan 1. Anniversary clamps Feb 29 to Feb 28 in non-leap years; missing opening date yields unknown, not a guessed date. No rollover in demo schedules. Production must model caps, sublimits, rolling windows and exceptions before publishing such benefits.

Remaining allowance = max(0, period cap − qualifying non-reversed usage), rounded only at display and stored as cents. Reject future, pre-opening, invalid, negative, and over-cap entries. Estimated and unknown usage never increase realized value. Confirmed and self-reported realized values remain separate. Annual fee analysis = selected calendar-year realized usage − user-provided fee; explicitly a calendar-year comparison, not an anniversary-year return. Do not annualize unused allowances.

Actions: ineligible or irrelevant → excluded; unknown eligibility → review eligibility; unknown enrollment → check enrollment; required but not enrolled → enroll; otherwise remaining > 0 → use. Sort by days until reset, then remaining cents, then stable ID. Show the exact ranking explanation; this is a deterministic heuristic, not a savings prediction. Recompute on mutations, date rollover, or tab return. Clicks never imply completion. User confirmations create self-reported evidence; confirmed is reserved for trusted integration evidence.

## Production integrations
Supabase Auth + RLS, tenant isolation at every nested relationship, private storage if evidence attachments are added. Public clients read only published verified catalog rows; demo fixtures ship in a separate module. RLS protects user-owned tables; service roles never reach browser bundles. Catalog administration uses a separate privileged path. Stripe hosted checkout and portal are server-only; verify raw-body webhook signatures, deduplicate event IDs, retrieve current subscription state before updating entitlements, and enforce quotas server-side. No Stripe secrets are needed for the demo.

Scheduled reminders: enqueue only after opt-in; unique key user/card/benefit/period/channel/lead day; recheck relevance, remaining balance and enrollment immediately before sending. Use PostgreSQL cron plus a worker or a managed job service. Retry with backoff and dead-letter alert. Catalog job flags stale sources; human review republishes, automated HTML changes never silently change benefit rules. Demo supports downloadable calendar reminders; it does not send email or push.

## Deployment and security
Next build/typecheck/test are release gates. Production additionally needs auth/RLS integration tests, catalog review, webhook replay tests, timezone coverage, backup/restore test, error telemetry and deletion flow. CSP and server headers belong on the deployment host. Store no PAN, CVV, bank password, protected session cookie, or issuer authentication token. Approved official links are source-checked before publication; demo links are clearly issuer homepages, not verified enrollment destinations.

## References checked during planning
- https://nextjs.org/docs/app/getting-started/installation
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://docs.stripe.com/webhooks (signature verification and duplicate delivery handling)
