# Seed Reference & Tenant Data — Task Brief

**Project:** Campaign Intelligence Platform
**Phase:** 0 — Foundation
**Satisfies:** DEVELOPMENT_PLAN.md → "tenants, tenant_users, channels seed data"
**Depends on:** 001-schema-migrations.md
**Goal:** Seed the `channels` reference table and register GuruSan as tenant #1.

## Summary

`channels` is shared across all tenants (Instagram, TikTok, Google Ads, Local
Event, etc. with type/platform). `tenants` needs at least GuruSan
(gurusan.observer) as tenant #1 per CLAUDE.md's dogfooding setup.

## Steps

### Step 1 — Write seed script
**Owner: Claude Code**

**Artifacts:**
- `app/supabase/migrations/0007_seed_channels.sql` — created — inserts the channel taxonomy (types: influencer/local/digital/organic/event/print; platforms: meta/google/tiktok/youtube/email/local)
- `app/supabase/seed/tenants.sql` — created — inserts GuruSan as tenant #1 (name, slug, industry)

**Directories:** `app/supabase/migrations/`, `app/supabase/seed/`

**Libraries:** none beyond existing (raw SQL)

### Step 2 — Provide GuruSan tenant details and run
**Owner: Human**

1. Confirm the exact tenant slug/industry to use for GuruSan
2. Run the seed script against the Supabase project
3. Create the first `tenant_users` row linking your Supabase Auth user to the GuruSan tenant as `owner`
