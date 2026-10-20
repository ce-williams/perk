# PERK

## Product purpose
Help people discover, activate, track, and use benefits on cards they already own. The first useful result is a short, explainable next-action list, available immediately after selecting cards. PERK is a benefits companion, not a bank or a recommendation to acquire credit.

## Audience and context
US adults with two to six rewards cards, little patience for issuer portals, and recurring uncertainty about enrollment and reset dates. They use a phone between errands or a desktop while planning travel. A later audience is a household coordinating benefits across cardholders.

## Jobs to be done
- When I add my cards, show which benefits deserve my attention today.
- When enrollment is required, explain prerequisites and send me to an approved official destination.
- When I use a benefit, let me record the actual value and distinguish my report from issuer confirmation.
- Before a reset or annual fee, help me assess what I actually used without inflating theoretical savings.

## Positioning and differentiation
An evidence-aware benefits journal. Compete on reliable provenance, transparent calculations, relevance, and low effort rather than automatic enrollment or a broad spend optimizer. No feature parity assumptions about named competitors are required. Prioritize the three most useful actions, hide irrelevant benefits on request, preserve a history of changes, and make uncertainty visible beside the amount.

## First session
No account gate in the demo. Search a 12-card catalog, select three, and open an action. Start with an empty personal portfolio; offer an explicit sample portfolio for exploration. Card selection stores no account number. The demo runs locally in the browser; production authentication and sync are separate deployment work.

## Trust and value
Separate content provenance (demo, verified, stale, unverified), evidence (confirmed, self-reported, estimated, unknown), enrollment, eligibility, and relevance. A click never implies enrollment. Only explicit user confirmation changes enrollment; only a recorded redemption increases realized value. Show net value only when an annual fee is provided, with assumptions and time window. Never sum overlapping benefits into an implied guaranteed saving.

## Revenue hypotheses
Keep useful first value free. Test paid willingness for larger portfolios, household coordination, smart reminders, reconciliation, and annual-fee reviews. Prices and card limits are hypotheses until validated. No checkout or collection of money in this demo. Stripe belongs behind a server boundary and a separately validated billing launch.

## Product voice and inclusion
Quiet, direct, useful. “Review enrollment” rather than “Unlock rewards.” Explain deadlines without manufactured urgency. Keyboard and touch support, reduced motion, readable financial figures, visible labels, and no reliance on color alone.

## Success and measurement
Primary target: a new user selects three cards and opens the highest-priority relevant benefit within 60 seconds after catalog load. Instrument catalog_loaded, card_added, portfolio_opened, action_opened, enrollment_reported, usage_recorded with anonymous session IDs only after consent. Usability validation: five unfamiliar participants; at least four meet the target with no help. This target is not yet empirically validated. Secondary: first-week recorded usage, action completion, provenance comprehension, and paid intent. Avoid counting outbound clicks as completion.
