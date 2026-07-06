# Development Plan — Campaign Intelligence Platform

**Project:** Campaign Intelligence Platform
**Dogfood tenant:** GuruSan (gurusan.observer)
**Last updated:** 2026-07-04

Source of truth for scope/schema/KPIs is `CLAUDE.md`. This file breaks the
Build Phases there into individual tasks and tags who owns each one.

## Legend
- 🤖 **Claude Code** — pure coding: schema, migrations, API routes, UI, edge functions
- 🧑 **Human** — third-party dashboards, account creation, secrets, business decisions
- 🔀 **Mixed** — needs a human step (account/secret/approval) before or after Claude Code's part

---

## Phase 0 — Foundation

- [x] Supabase project created, RLS enabled — 🔀 Human creates the project in the Supabase dashboard; Claude Code writes the RLS policies + migrations
  - **Doc drift corrected 2026-07-04, re-confirmed 2026-07-05:** human created `wtltwglxpasvkgjegcas`. RLS policies (`0006_rls_policies.sql`) applied and confirmed live — `list_tables` shows RLS enabled on all 11 tables, `get_advisors(security)` clean.
- [x] All schema migrations in `supabase/migrations/` — 🤖 Claude Code — written and applied: `app/supabase/migrations/0001`–`0009` applied to `wtltwglxpasvkgjegcas` on 2026-07-04 via the project-scoped Supabase MCP connector. A follow-up `0010_fix_current_tenant_id_search_path.sql` was written and applied to clear a `function_search_path_mutable` security lint raised immediately after. `get_advisors(security)` is now clean.
- [x] `tenants`, `tenant_users`, `channels` seed data — 🤖 Claude Code writes it; 🧑 Human runs it — `channels` seeded (14 rows, via `0007_seed_channels.sql`, applied). `app/supabase/seed/tenants.sql` run 2026-07-05: GuruSan registered as tenant #1 (`428db548-f445-4d48-9574-6aef78d927d7`, slug `gurusan`, industry `spiritual wellness`). `tenant_users` still empty — no Supabase Auth user linked yet (needs an actual auth.users UUID, created via the OAuth login flow, not seedable ahead of time).
- [x] `campaign_performance` view deployed — 🤖 Claude Code writes the SQL; 🧑 Human applies it (`supabase db push` or Supabase MCP) — `0008_campaign_performance_view.sql` applied to `wtltwglxpasvkgjegcas` on 2026-07-04.
- [x] Webhook endpoint live, tested with cURL — 🤖 Claude Code builds it; 🧑 Human runs the cURL test — deployed `process-conversion` edge function (v3) to `wtltwglxpasvkgjegcas`; ran the Next.js route locally and cURL-tested end-to-end 2026-07-05. Fixed a real bug found in testing: the edge function's internal auth check compared the incoming header against `Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")`, but this project has rotated to Supabase's new `sb_secret_...` key format while the route still authenticates with the legacy JWT service_role key - the two never matched. Removed the redundant internal check; the platform's `verify_jwt: true` gate is the real boundary. Confirmed a full `attributions` row lands correctly (promo_code resolution), then deleted the test fixtures.
- [ ] GuruSan wired as tenant #1 — 🧑 Human (cross-project API key/webhook-secret exchange between the two Supabase projects)

## Phase 1 — Core Dashboard

- [~] Auth: Google OAuth → tenant session — 🔀 Claude Code wired Supabase Auth + session logic, the tenant-claim JWT hook, and all app-side code 2026-07-06. **Not yet functional end-to-end** — three human steps remain, see "Phase 1 human steps" below.
- [x] `/campaigns` list page — 🤖 Claude Code, 2026-07-06
- [x] `/campaigns/[id]` detail page — 🤖 Claude Code, 2026-07-06 — spend summary, KPI scorecard vs. `campaign_goals`, placements list
- [x] `/campaigns/[id]/placements/[pid]` detail page — 🤖 Claude Code, 2026-07-06 — performance history table, attributions list
- [x] Manual snapshot entry form — 🤖 Claude Code, 2026-07-06 — server action, engagement_rate computed automatically
- [x] Manual spend entry form — 🤖 Claude Code, 2026-07-06 — server action, campaign- or placement-level

**Phase 1 human steps (blocks real login working):**
1. Google Cloud Console: create an OAuth 2.0 Client ID (Web application), add the Supabase callback URL as an authorized redirect URI.
2. Supabase Dashboard → Authentication → Providers: enable Google, paste the Client ID/Secret from step 1.
3. Supabase Dashboard → Authentication → Hooks (Beta): select `custom_access_token_hook` as the Custom Access Token hook (migration `0011` already created the function — this can't be enabled via SQL/API, only the dashboard).

Until all three are done, `/login` renders and the build is clean, but clicking
"Continue with Google" won't produce a working tenant session.

## Phase 2 — Partner & Influencer Management

- [ ] `/partners` CRUD — 🤖 Claude Code
- [ ] Partner profile page (historical performance, avg KPIs) — 🤖 Claude Code
- [ ] Partner comparison view — 🤖 Claude Code

## Phase 3 — Optimization Signals

- [ ] Automated signal detection via pg_cron — 🔀 Claude Code writes the detection SQL/logic; Human enables the pg_cron extension + confirms the schedule in Supabase
- [ ] Signal inbox in dashboard — 🤖 Claude Code
- [ ] Weekly digest email via Resend — 🔀 Human creates the Resend account + API key; Claude Code builds the template + send logic
- [ ] Claude-powered anomaly commentary — 🔀 Human provides the Anthropic API key; Claude Code builds the integration

## Phase 4 — Integrations (API pulls)

- [ ] Meta Ads API integration — 🔀 Human creates the Meta developer app + completes review; Claude Code writes the integration
- [ ] Google Ads API integration — 🔀 same pattern
- [ ] TikTok Ads API integration — 🔀 same pattern
- [ ] CSV import for manual platforms (event attendance, print, podcast) — 🤖 Claude Code

## Phase 5 — Multi-Tenant Growth

- [ ] Tenant onboarding flow — 🤖 Claude Code
- [ ] Per-tenant API key management — 🤖 Claude Code
- [ ] Billing (Creem.io) — 🔀 Human creates the Creem.io account + product config; Claude Code integrates checkout/webhooks (vendor changed 2026-07-05, was Lemon Squeezy)
- [ ] Tenant admin: user invite, role management — 🤖 Claude Code

---

## Bottom line

Nearly every coding task in this plan — schema, migrations, API routes, UI, edge
functions, signal detection, integrations — can be handed to Claude Code. The
only steps that can't be delegated are: creating accounts/apps in third-party
dashboards (Supabase, Google Cloud, Meta, Resend, Creem.io), supplying
secrets/API keys, and business or legal decisions.

## Suggested handoff order

1. Phase 0 (foundation) — blocks everything else
2. Phase 1 (core dashboard) — first usable product
3. Phases 2–5 in order, though 2 and 3 could interleave

Ready-to-run task briefs for the next phase live in `claude-code-tasks/`.
Session history lives in `project-logs/` — read the latest entry there before
starting new work on this project.
