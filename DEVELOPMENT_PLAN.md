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

- [ ] Supabase project created, RLS enabled — 🔀 Human creates the project in the Supabase dashboard; Claude Code writes the RLS policies + migrations
- [ ] `tenants`, `tenant_users`, `channels` seed data — 🤖 Claude Code
- [ ] All schema migrations in `supabase/migrations/` — 🤖 Claude Code
- [ ] `campaign_performance` view deployed — 🤖 Claude Code writes the SQL; 🧑 Human applies it (`supabase db push` or Supabase MCP)
- [ ] Webhook endpoint live, tested with cURL — 🤖 Claude Code builds it; 🧑 Human runs the cURL test
- [ ] GuruSan wired as tenant #1 — 🧑 Human (cross-project API key/webhook-secret exchange between the two Supabase projects)

## Phase 1 — Core Dashboard

- [ ] Auth: Google OAuth → tenant session — 🔀 Human sets up the OAuth consent screen + credentials in Google Cloud Console; Claude Code wires Supabase Auth + session logic
- [ ] `/campaigns` list page — 🤖 Claude Code
- [ ] `/campaigns/[id]` detail page — 🤖 Claude Code
- [ ] `/campaigns/[id]/placements/[pid]` detail page — 🤖 Claude Code
- [ ] Manual snapshot entry form — 🤖 Claude Code
- [ ] Manual spend entry form — 🤖 Claude Code

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
- [ ] Billing (Lemon Squeezy) — 🔀 Human creates the Lemon Squeezy account + product config; Claude Code integrates checkout/webhooks
- [ ] Tenant admin: user invite, role management — 🤖 Claude Code

---

## Bottom line

Nearly every coding task in this plan — schema, migrations, API routes, UI, edge
functions, signal detection, integrations — can be handed to Claude Code. The
only steps that can't be delegated are: creating accounts/apps in third-party
dashboards (Supabase, Google Cloud, Meta, Resend, Lemon Squeezy), supplying
secrets/API keys, and business or legal decisions.

## Suggested handoff order

1. Phase 0 (foundation) — blocks everything else
2. Phase 1 (core dashboard) — first usable product
3. Phases 2–5 in order, though 2 and 3 could interleave

Ready-to-run task briefs for the next phase live in `claude-code-tasks/`.
Session history lives in `project-logs/` — read the latest entry there before
starting new work on this project.
