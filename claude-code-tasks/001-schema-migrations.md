# Schema Migrations — Task Brief

**Project:** Campaign Intelligence Platform
**Phase:** 0 — Foundation
**Satisfies:** DEVELOPMENT_PLAN.md → "All schema migrations in supabase/migrations/"
**Goal:** Stand up the full schema (reference tables + core tables + indexes) as versioned Supabase migrations with RLS enabled.

## Summary

CLAUDE.md defines the complete schema: `channels`, `tenants`, `tenant_users`,
`campaigns`, `campaign_goals`, `partners`, `placements`, `performance_snapshots`,
`attributions`, `spend_records`, plus required indexes and the multi-tenancy
RLS rule (`tenant_id = auth.jwt() -> 'tenant_id'` on every tenant-scoped table).
None of this exists yet — this task creates it as migrations.

## Steps

### Step 1 — Write migration files
**Owner: Claude Code**

Create one migration per logical group, in dependency order, matching the
schema in CLAUDE.md exactly (column names, types, defaults, constraints).

**Artifacts:**
- `app/supabase/migrations/0001_reference_tables.sql` — created — `channels`
- `app/supabase/migrations/0002_tenants.sql` — created — `tenants`, `tenant_users`
- `app/supabase/migrations/0003_campaigns.sql` — created — `campaigns`, `campaign_goals`
- `app/supabase/migrations/0004_partners_placements.sql` — created — `partners`, `placements`
- `app/supabase/migrations/0005_snapshots_attributions_spend.sql` — created — `performance_snapshots`, `attributions`, `spend_records` + indexes
- `app/supabase/migrations/0006_rls_policies.sql` — created — RLS enabled + policy per tenant-scoped table

**Directories:** `app/supabase/migrations/`

**Libraries:** none beyond existing (raw SQL)

> **Technical note:** Migrations must run in this order — reference tables
> first, then tenants, then everything with a `tenant_id` foreign key —
> or the migration will fail on the FK constraint.

### Step 2 — Apply and verify
**Owner: Human**

1. Confirm the Supabase project exists (see the Phase 0 checklist in DEVELOPMENT_PLAN.md — this must happen first)
2. Run `supabase db push` from `app/`, or apply via the Supabase MCP if connected
3. In the Supabase Table Editor, confirm every table from CLAUDE.md exists with `tenant_id` where specified, and that RLS shows as enabled
