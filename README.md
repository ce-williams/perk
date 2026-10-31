# PERK

A premium credit card benefits journal built with Next.js, TypeScript and Tailwind. This runnable MVP is deliberately a **fictional, local-first demo**. Real product names help users find their cards. Fidelity Rewards Visa Signature includes six published benefit summaries with official sources, reviewed October 30, 2026. These reference summaries do not assert account eligibility or generate tracked allowances or reset reminders. All other cards use invented, clearly labeled benefit scenarios. Nothing is connected to a bank or issuer account.

## Run

Use Node 20.9+ (Node 24 recommended) and pnpm:

```sh
pnpm install
pnpm dev
```

Open http://localhost:3000. Start empty, add three cards, or explicitly load the sample portfolio. `/directions/` contains two original visual studies; the user-selected Private Ledger, adapted to ink blue and burnt orange, is carried through the app.

```sh
pnpm test
pnpm typecheck
pnpm build
```

The build statically exports to `out/`. Serve that directory with any static host supporting directory indexes. `pnpm start` is not used with a static export; use `python3 -m http.server --directory out 3000` for a built preview.

On this Codex host, the bundled Node is `/Users/cewilliams/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node` and pnpm is `/Users/cewilliams/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm`. Use that Node explicitly when the default runtime is too old.

## What works

- Thirteen searchable card identities, multi-select onboarding, portfolio restoration, per-card opening date and user-supplied annual fee.
- All six requested pages, plus original design explorations.
- Deadline-prioritized actions, eligibility and relevance, explicitly confirmed self-reported enrollment, usage journal and auditable reversals.
- Monthly, quarterly, calendar-year and anniversary rules; integer-cent balances; transparent calendar-year value and fee calculations.
- Month navigation, all-day .ics export with opt-in alerts, JSON export, timezone/preferences and explicit reset.
- Browser persistence with visible storage errors. No account, card number, password or API key required.

## Foundations, not connected production services

`supabase/migrations/0001_foundation.sql` defines the relational schema, revision interval constraints, ownership policies, evidence restrictions and append-only client grants. It has **not been applied to a live Supabase instance**. Review it in a sandbox; implement transactional write RPCs and multi-user authorization tests before production. The browser repository is the sole active persistence adapter.

Stripe billing, authenticated cloud sync, real reminder delivery, households, live issuer verification and authorized enrollment integrations are designed in ARCHITECTURE.md and ROADMAP.md; they are not active features. Calendar exports are real files, not a claim of background notification delivery.

Demo benefit fixtures are shared across products without published benefits. Fidelity uses its published reference summaries instead. They are never safe to promote into a production catalog. Production must ingest exact variants, effective-dated verified issuer terms, source timestamps, approved enrollment destinations and human-reviewed eligibility.

## Planning and design

- PRODUCT.md — audience, positioning, jobs, trust, revenue hypothesis and success test.
- DESIGN.md — two directions, selection rationale, tokens, composition and interaction.
- ARCHITECTURE.md — relational model, pure rules, persistence boundary and integration design.
- MVP.md — acceptance criteria and exclusions.
- ROADMAP.md — tasks ordered by dependency and production gates.
- RISKS.md — controls and launch constraints.
- VERIFICATION.md — exact checks performed and limits.

Official Impeccable 4.7.0 was installed project-locally using its official CLI. The engine binary is ignored by Git. Reinstall with `pnpm dlx impeccable@latest install --providers=codex --scope=project --no-hooks --yes`. Automatic hooks were not enabled; the detector is run manually during verification. Skill discovery is available on the next agent turn.

## GitHub Pages

The workflow in `.github/workflows/pages.yml` tests benefit rules, installs the frozen lockfile, builds with Node 24 and publishes the `out/` artifact from `main`. It automatically sets `NEXT_PUBLIC_BASE_PATH` to the repository name, so internal routes and bundled assets work below `/perk/`.

Repository Settings → Pages must use **GitHub Actions** as the publishing source. No Supabase, Stripe, or issuer secrets are needed. This publishes the local-first demo with Fidelity reference summaries; each visitor’s journal stays in their own browser.

To reproduce the project-path build locally:

```sh
NEXT_PUBLIC_BASE_PATH=/perk pnpm build
mkdir -p /tmp/perk-preview
ln -s "$PWD/out" /tmp/perk-preview/perk
python3 -m http.server --directory /tmp/perk-preview 3001
```

Open http://localhost:3001/perk/. Local `pnpm dev` continues using `/`.
