# campaign_performance View — Task Brief

**Project:** Campaign Intelligence Platform
**Phase:** 0 — Foundation
**Satisfies:** DEVELOPMENT_PLAN.md → "campaign_performance view deployed"
**Depends on:** 001-schema-migrations.md
**Goal:** Deploy the `campaign_performance` analytics view exactly as specified in CLAUDE.md (spend, reach, engagement, conversions, and inline KPI calculations).

## Summary

This view joins `campaigns`, `spend_records`, `placements`,
`performance_snapshots`, and `attributions` to compute CPM, CPC, CTR, CPE,
CAC, CPA, and ROAS per campaign. It's the primary read path for the
`/campaigns` dashboard, so it should be deployed before Phase 1 UI work starts.

## Steps

### Step 1 — Create the view
**Owner: Claude Code**

**Artifacts:**
- `app/supabase/migrations/0008_campaign_performance_view.sql` — created — the view, copied verbatim from the SQL in CLAUDE.md's "Core Analytics View" section

**Directories:** `app/supabase/migrations/`
**Libraries:** none beyond existing (raw SQL)

> **Technical note:** Uses `SUM(DISTINCT sr.amount_usd)` for spend to avoid
> double-counting when a campaign has multiple placements each joining
> multiple spend_records rows — the join fan-out is intentional here, not a bug.

### Step 2 — Apply and spot-check
**Owner: Human**

1. Apply the migration (`supabase db push` or Supabase MCP)
2. Query the view for any seeded campaign and confirm totals look right (e.g. spend matches the sum of its spend_records)
