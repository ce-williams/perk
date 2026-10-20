# Risks and controls

| Risk | Control | Production gate |
| --- | --- | --- |
| Incorrect or stale terms | Separate demo fixtures, verified effective-dated revisions, per-source checked timestamp, human review queue | Reviewer approval; freshness threshold; suppress actions with stale/unknown terms |
| Product variant/eligibility mismatch | Separate variants and user eligibility; unknown is a first-class state | Exact market/tier/legacy/AU eligibility review |
| Misleading value | Integer cents; period and formula beside every total; self-report vs confirmed vs estimate; fee unknown shown as unknown | No implied guaranteed saving or point-value speculation |
| Wrong reset/deadline | Civil-date arithmetic, explicit issuer timezone, clamp policy, boundary tests | Verify each issuer schedule including rolling periods and exceptions |
| Completion inferred from a click | Outbound links have no state mutation; explicit confirmation and evidence log | Trusted integrations required for confirmed status |
| Data exposure | No card numbers, credentials or protected sessions; private-by-default RLS, owner checks and service-only catalog/billing writes | Cross-user authorization tests, deletion and restore drill |
| Local device data | Browser storage is visible to this origin/device; export/delete controls and visible demo notice | Authenticated server persistence before multi-device use; storage-failure handling |
| Unsupported enrollment integration | Official allowlisted destinations only; demo exposes homepage only | Issuer authorization and security assessment before any automation |
| Billing inconsistency | Stripe server integration, signature verification, event dedupe and current-state retrieval | Sandbox webhook replay and server entitlement checks |
| Reminder spam or sensitive notifications | Opt-in, minimal content, idempotency, final send-time recheck, unsubscribe | Consent/quiet hours/delivery policy and real worker tested |
| Financial/regulatory misinterpretation | Benefits organizer only; avoid individualized credit recommendations and unsupported legal claims | Qualified review of disclosures, affiliate relationships, privacy and consumer obligations |
| Trademark affiliation | Original generic card illustrations; factual catalog names; no issuer logos or affiliation claims | Product/brand and approved-link review |

This file is an engineering risk register, not legal advice or a claim of regulatory compliance. No production financial terms are supplied in this demo.
