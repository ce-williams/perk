# Ordered implementation plan

| Order | Task and dependency | Milestone / acceptance |
| --- | --- | --- |
| 1 | Product contracts, trust vocabulary, exclusions | PRODUCT, DESIGN, ARCHITECTURE, MVP, RISKS complete before app implementation |
| 2 | Install official Impeccable; render two original directions | /directions compares editorial journal and private ledger; decision documented |
| 3 | Types, fictional fixtures, pure rules | Period, balance, transition and priority tests pass |
| 4 | Persistence adapter and accessible app shell, depends on 3 | Empty and reload paths work; no account gate |
| 5 | Card search and multi-select, depends on 4 | Three cards lead immediately to prioritized actions |
| 6 | Detail, enrollment, eligibility, relevance and usage, depends on 3–5 | User confirmation required; self-report ledger updates with reversible history |
| 7 | Calendar, value analysis and preferences, depends on 6 | Calendar exports; fee unknown handled; preferences persist |
| 8 | Responsive polish and Impeccable audit, depends on 2–7 | Build, types, rules pass; browser QA at phone and desktop |
| 9 | Supabase foundation migration, parallel with 3–8 | Relational schema, RLS and append-only evidence designed; deployment remains gated |
| 10 | Production pilot: auth, repository adapter, deletion and backups | Multi-user/RLS tests and private pilot, real Supabase environment required |
| 11 | Human-verified issuer catalog, depends on content operations | 10–15 approved products with reviewed revisions, eligibility, destinations and freshness SLA |
| 12 | Opt-in reminder worker, depends on 10–11 | Idempotency/retry/opt-out tests and real delivery sandbox |
| 13 | Stripe subscriptions, depends on retained pilot usage | Hosted checkout, webhook verification/replay tests, server entitlements |
| 14 | Household memberships, reconciliation and authorized integrations | Explicit sharing controls; integration agreements and evidence model validated |

## Launch gates and decisions
Do not launch factual benefit recommendations before catalog review and tenant isolation. Pilot the three-card / under-60-second flow with five users. Revenue tests follow evidence of repeated value, not a decorative upgrade modal. Review data minimization, retention, notification consent, trademark use and consumer disclosures with qualified counsel before public launch. Production timelines depend on credential access, content review capacity, and pilot results; no fabricated delivery dates.
