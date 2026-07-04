# Campaign Intelligence Platform — Agent Instructions

## Project Vision
A multi-tenant marketing campaign tracking and optimization platform. Tracks influencer,
local, and digital campaigns end-to-end: from budget allocation through performance
snapshots to revenue attribution and KPI scoring against goals.

**Primary users:** Small-to-medium business owners running multi-channel marketing
who need a single source of truth for campaign ROI — not another ad dashboard,
but a unified layer that connects what was spent, what ran, and what converted.

**Dogfood tenant:** GuruSan (spiritual wellness platform, gurusan.observer).

**Business model:** SaaS, per-tenant subscription. Free tier for single-user, paid
tiers for team access, API integrations, and AI optimization suggestions.

---

## Tech Stack
| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 16 (App Router) | Consistent with GuruSan; SSR for dashboards |
| Database | Supabase (PostgreSQL) | RLS handles tenant isolation; real-time for live metrics |
| Auth | Supabase Auth | Google OAuth + email; tenant-scoped sessions |
| Hosting | Vercel | CI/CD from GitHub; edge functions available |
| Styling | Tailwind CSS | Utility-first; consistent with GuruSan |
| AI layer | Anthropic API (Claude) | Optimization suggestions, anomaly commentary |
| Email | Resend | Campaign digest emails, anomaly alerts |

**Separate Supabase project from GuruSan.** GuruSan is tenant #1 but shares
no database with this platform. Attribution data flows one-way: GuruSan
pushes conversion events via a webhook or API call.

---

## Multi-Tenancy Rules
- Every table (except reference lookups) carries `tenant_id uuid NOT NULL`
- RLS policy on every table: `USING (tenant_id = auth.jwt() -> 'tenant_id')`
- Tenant ID is embedded in the JWT at login; never derived from a URL param
- Service-role key is used only in Edge Functions and never exposed client-side
- A user belongs to exactly one tenant (v1); multi-org is a v2 concern

---

## Database Schema

### Reference Tables (no tenant_id — shared across all tenants)

```sql
-- Channel taxonomy
CREATE TABLE channels (
  id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,        -- 'Instagram', 'TikTok', 'Google Ads', 'Local Event', etc.
  type text NOT NULL,        -- 'influencer' | 'local' | 'digital' | 'organic' | 'event' | 'print'
  platform text              -- 'meta' | 'google' | 'tiktok' | 'youtube' | 'email' | 'local'
);
```

### Core Tables

```sql
-- Tenants
CREATE TABLE tenants (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  slug       text UNIQUE NOT NULL,
  industry   text,
  created_at timestamptz DEFAULT now()
);

-- Tenant users (links Supabase auth.users → tenant)
CREATE TABLE tenant_users (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  uuid NOT NULL REFERENCES tenants(id),
  user_id    uuid NOT NULL REFERENCES auth.users(id),
  role       text NOT NULL DEFAULT 'member', -- 'owner' | 'admin' | 'member' | 'viewer'
  created_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);

-- Campaigns (top-level planning unit)
CREATE TABLE campaigns (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id          uuid NOT NULL REFERENCES tenants(id),
  name               text NOT NULL,
  description        text,
  type               text NOT NULL, -- 'influencer' | 'local' | 'digital' | 'mixed'
  status             text NOT NULL DEFAULT 'draft',
    -- 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
  start_date         date,
  end_date           date,
  total_budget_usd   numeric(12,2),
  primary_goal       text NOT NULL,
    -- 'awareness' | 'signups' | 'purchases' | 'engagement' | 'foot_traffic' | 'leads'
  notes              text,
  created_at         timestamptz DEFAULT now(),
  updated_at         timestamptz DEFAULT now()
);

-- KPI targets per campaign (multiple goals allowed)
CREATE TABLE campaign_goals (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id  uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  metric       text NOT NULL,
    -- 'cac' | 'cpa' | 'roas' | 'cpm' | 'cpc' | 'ctr' | 'cpe'
    -- | 'signups' | 'purchases' | 'leads' | 'impressions' | 'engagement_rate'
  target_value numeric(12,4) NOT NULL,
  priority     text NOT NULL DEFAULT 'secondary' -- 'primary' | 'secondary'
);

-- Partners (influencers, venues, publications, creators, agencies)
CREATE TABLE partners (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            uuid NOT NULL REFERENCES tenants(id),
  type                 text NOT NULL, -- 'influencer' | 'venue' | 'publication' | 'creator' | 'agency'
  name                 text NOT NULL,
  handle               text,           -- social handle or contact name
  platform             text,           -- primary platform (instagram, tiktok, youtube, local, etc.)
  profile_url          text,
  audience_size        int,            -- followers / monthly reach
  avg_engagement_rate  numeric(6,4),   -- e.g. 0.0340 = 3.40%
  niche                text[],         -- e.g. ARRAY['wellness','spirituality']
  location             text,           -- city/region, for local partners
  contact_email        text,
  notes                text,
  created_at           timestamptz DEFAULT now()
);

-- Placements (individual executions: one post, one event, one ad group)
CREATE TABLE placements (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id         uuid NOT NULL REFERENCES campaigns(id),
  partner_id          uuid REFERENCES partners(id),  -- null = self-executed
  channel_id          uuid REFERENCES channels(id),
  name                text NOT NULL,
  placement_type      text NOT NULL,
    -- 'post' | 'story' | 'reel' | 'video' | 'event' | 'ad_group'
    -- | 'email' | 'flyer' | 'podcast_mention' | 'article' | 'billboard'
  status              text NOT NULL DEFAULT 'scheduled',
    -- 'scheduled' | 'live' | 'completed' | 'cancelled'
  scheduled_at        timestamptz,
  went_live_at        timestamptz,
  ended_at            timestamptz,
  budget_allocated_usd numeric(12,2),
  spend_actual_usd    numeric(12,2),
  tracking_url        text,     -- UTM-tagged URL for this placement
  promo_code          text,     -- unique code, used for attribution
  content_url         text,     -- link to live post / event page / ad
  content_notes       text,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

-- Performance snapshots (time-series; one row per capture per placement)
CREATE TABLE performance_snapshots (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  placement_id    uuid NOT NULL REFERENCES placements(id),
  captured_at     timestamptz NOT NULL DEFAULT now(),
  -- Reach / awareness
  impressions     bigint,
  reach           bigint,
  views           bigint,
  -- Engagement
  likes           int,
  comments        int,
  shares          int,
  saves           int,
  clicks          int,
  link_clicks     int,
  -- Derived (store at capture time to avoid re-computation drift)
  engagement_rate numeric(8,6), -- (likes+comments+shares+saves) / reach
  -- Data provenance
  source          text NOT NULL DEFAULT 'manual'
    -- 'manual' | 'api' | 'csv_import'
);

-- Attributions (placement → conversion in tenant's product)
CREATE TABLE attributions (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id          uuid NOT NULL REFERENCES tenants(id),
  campaign_id        uuid NOT NULL REFERENCES campaigns(id),
  placement_id       uuid REFERENCES placements(id), -- null = campaign-level only
  conversion_type    text NOT NULL,
    -- 'signup' | 'purchase' | 'lead' | 'assessment_complete' | 'foot_traffic' | 'email_capture'
  revenue_usd        numeric(12,2),   -- null if not a revenue event
  attribution_method text NOT NULL,
    -- 'utm' | 'promo_code' | 'referral_link' | 'self_reported' | 'manual'
  utm_source         text,
  utm_medium         text,
  utm_campaign       text,
  utm_content        text,
  promo_code_used    text,
  external_user_id   text,  -- ID in tenant's own system (e.g. Supabase user ID)
  converted_at       timestamptz NOT NULL
);

-- Spend ledger (immutable record of actual spend)
CREATE TABLE spend_records (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL REFERENCES tenants(id),
  campaign_id   uuid NOT NULL REFERENCES campaigns(id),
  placement_id  uuid REFERENCES placements(id),
  amount_usd    numeric(12,2) NOT NULL,
  spend_type    text NOT NULL,
    -- 'influencer_fee' | 'media_buy' | 'production' | 'event_cost' | 'tool_cost' | 'other'
  paid_at       date NOT NULL,
  invoice_ref   text,
  notes         text
);
```

### Key Indexes

```sql
CREATE INDEX ON campaigns(tenant_id, status);
CREATE INDEX ON placements(campaign_id, status);
CREATE INDEX ON performance_snapshots(placement_id, captured_at DESC);
CREATE INDEX ON attributions(campaign_id, conversion_type, converted_at DESC);
CREATE INDEX ON spend_records(campaign_id);
CREATE INDEX ON spend_records(placement_id);
```

### Core Analytics View

```sql
CREATE VIEW campaign_performance AS
SELECT
  c.id,
  c.tenant_id,
  c.name,
  c.type,
  c.status,
  c.total_budget_usd,
  c.primary_goal,
  -- Spend
  COALESCE(SUM(DISTINCT sr.amount_usd), 0)                                      AS total_spend,
  c.total_budget_usd - COALESCE(SUM(DISTINCT sr.amount_usd), 0)                 AS budget_remaining,
  -- Reach
  COALESCE(SUM(ps.impressions), 0)                                               AS total_impressions,
  COALESCE(SUM(ps.reach), 0)                                                     AS total_reach,
  COALESCE(SUM(ps.clicks), 0)                                                    AS total_clicks,
  -- Engagement
  COALESCE(SUM(ps.likes + ps.comments + ps.shares + ps.saves), 0)               AS total_engagements,
  -- Conversions
  COUNT(a.id) FILTER (WHERE a.conversion_type = 'signup')                        AS signups,
  COUNT(a.id) FILTER (WHERE a.conversion_type = 'purchase')                      AS purchases,
  COUNT(a.id) FILTER (WHERE a.conversion_type = 'lead')                          AS leads,
  COALESCE(SUM(a.revenue_usd), 0)                                                AS revenue_attributed,
  -- KPIs (computed inline)
  CASE WHEN SUM(ps.impressions) > 0
    THEN ROUND((SUM(sr.amount_usd) / SUM(ps.impressions)) * 1000, 4) END        AS cpm,
  CASE WHEN SUM(ps.clicks) > 0
    THEN ROUND(SUM(sr.amount_usd) / SUM(ps.clicks), 4) END                      AS cpc,
  CASE WHEN SUM(ps.impressions) > 0
    THEN ROUND(SUM(ps.clicks)::numeric / SUM(ps.impressions), 6) END            AS ctr,
  CASE WHEN SUM(ps.likes + ps.comments + ps.shares + ps.saves) > 0
    THEN ROUND(SUM(sr.amount_usd) /
         SUM(ps.likes + ps.comments + ps.shares + ps.saves), 4) END             AS cpe,
  CASE WHEN COUNT(a.id) FILTER (WHERE a.conversion_type = 'signup') > 0
    THEN ROUND(SUM(sr.amount_usd) /
         COUNT(a.id) FILTER (WHERE a.conversion_type = 'signup'), 2) END        AS cac,
  CASE WHEN COUNT(a.id) FILTER (WHERE a.conversion_type = 'purchase') > 0
    THEN ROUND(SUM(sr.amount_usd) /
         COUNT(a.id) FILTER (WHERE a.conversion_type = 'purchase'), 2) END      AS cpa,
  CASE WHEN SUM(sr.amount_usd) > 0
    THEN ROUND(SUM(a.revenue_usd) / SUM(sr.amount_usd), 4) END                 AS roas
FROM campaigns c
LEFT JOIN spend_records   sr ON sr.campaign_id = c.id
LEFT JOIN placements       p  ON p.campaign_id  = c.id
LEFT JOIN performance_snapshots ps ON ps.placement_id = p.id
LEFT JOIN attributions     a  ON a.campaign_id  = c.id
GROUP BY c.id, c.tenant_id, c.name, c.type, c.status,
         c.total_budget_usd, c.primary_goal;
```

---

## KPI Catalog

### Universal (all campaign types)

| KPI | Formula | Good threshold | Notes |
|---|---|---|---|
| **CAC** | total_spend / signups | < $10 DTC, < $50 B2B | Customer Acquisition Cost |
| **CPA** | total_spend / purchases | Depends on AOV | Cost Per Acquisition (revenue event) |
| **ROAS** | revenue_attributed / total_spend | > 3.0x target | Return on Ad Spend |
| **Conversion Rate** | purchases / clicks | 1–5% typical | From click to purchase |
| **Budget Utilization** | total_spend / total_budget | 80–100% | Flag if < 60% (underdelivery) |

### Influencer-Specific

| KPI | Formula | Good threshold | Notes |
|---|---|---|---|
| **CPE** | spend / total_engagements | < $0.50 micro, < $2 macro | Cost Per Engagement |
| **CPM** | (spend / impressions) × 1000 | $5–$25 influencer | Cost Per Mille |
| **Engagement Rate** | (likes+comments+shares+saves) / reach | > 3% = healthy | Below 1% = low-trust audience |
| **Influencer ROI** | revenue_attributed / influencer_fee | > 1.0x break-even | Per-partner profitability |
| **Promo Code Capture Rate** | promo_code_attributions / reach | > 0.5% strong | Measures direct response |

### Digital-Specific

| KPI | Formula | Good threshold | Notes |
|---|---|---|---|
| **CPC** | spend / clicks | < $2 awareness, < $5 conversion | Cost Per Click |
| **CTR** | clicks / impressions | > 1% display, > 3% search | Click-Through Rate |
| **CPM** | (spend / impressions) × 1000 | $2–$10 programmatic | |
| **Quality Score** | CTR × conversion_rate | Internal index | Proxy for ad relevance |

### Local-Specific

| KPI | Formula | Good threshold | Notes |
|---|---|---|---|
| **Cost per Contact** | spend / estimated_attendees | Varies by event type | Requires manual attendance input |
| **Lead Capture Rate** | leads / estimated_attendees | > 10% strong | Email signups at events |
| **Geographic Lift** | conversions in target area pre/post | Positive delta | Requires geo-tagged attributions |

### Optimization Signals (flag these automatically)

| Signal | Condition | Action |
|---|---|---|
| Overspend risk | spend > 80% budget with < 50% timeline elapsed | Alert owner |
| Underdelivery | spend < 40% budget with > 70% timeline elapsed | Review placement status |
| ROAS below target | roas < campaign_goals.target_value (primary) | Pause or reallocate |
| Engagement rate collapse | week-over-week drop > 40% | Influencer fatigue or audience mismatch |
| Attribution gap | spend recorded but zero attributions after 14 days | Tracking may be broken |
| High CPM, low CTR | cpm > 2× benchmark AND ctr < 0.5% | Creative or audience problem |

---

## Attribution Model (v1: Last Touch)

1. **UTM parameters** — captured on signup/purchase in the tenant's product; pushed to `attributions` via webhook
2. **Promo codes** — unique per placement; captured at checkout; highest confidence
3. **Referral links** — tracked URLs with placement ID embedded
4. **Self-reported** — "How did you hear about us?" on signup form
5. **Manual** — owner assigns attribution in the dashboard

Priority order for conflict resolution: promo_code > utm > referral > self_reported > manual

**v2 consideration:** multi-touch / linear attribution across a customer's journey.

---

## Webhook API (inbound from tenant products)

Tenants push conversion events to:

```
POST /api/v1/webhooks/conversion
Authorization: Bearer <tenant_api_key>

{
  "conversion_type": "signup" | "purchase" | "lead" | ...,
  "revenue_usd": 11.11,
  "external_user_id": "uuid-from-tenant-system",
  "utm_source": "instagram",
  "utm_medium": "influencer",
  "utm_campaign": "launch-may-2026",
  "utm_content": "placement_id_here",
  "promo_code_used": "ASCEND22",
  "converted_at": "2026-07-04T12:00:00Z"
}
```

The webhook handler:
1. Validates the tenant API key
2. Resolves campaign/placement from UTM or promo code
3. Inserts into `attributions`
4. Returns 202 Accepted (async — never blocks the tenant's checkout)

**HARD RULE: the webhook never stores PII beyond `external_user_id`.** No names,
emails, or raw behavioral data from the tenant's product.

---

## Build Phases

### Phase 0 — Foundation (before any UI)
- [ ] Supabase project created, RLS enabled on all tables
- [ ] `tenants`, `tenant_users`, `channels` seed data
- [ ] All schema migrations in `supabase/migrations/`
- [ ] `campaign_performance` view deployed
- [ ] Webhook endpoint live and tested with cURL
- [ ] GuruSan wired as tenant #1 (conversion webhook sending)

### Phase 1 — Core Dashboard
- [ ] Auth: Google OAuth → tenant session
- [ ] `/campaigns` — list with status, spend, primary KPI vs. goal
- [ ] `/campaigns/[id]` — campaign detail: placements list, spend breakdown, KPI scorecard
- [ ] `/campaigns/[id]/placements/[pid]` — placement detail: snapshot chart, attribution list
- [ ] Manual snapshot entry form (until API integrations exist)
- [ ] Manual spend entry form

### Phase 2 — Partner & Influencer Management
- [ ] `/partners` — CRUD for influencers, venues, publications
- [ ] Partner profile page: historical performance across campaigns, avg KPIs
- [ ] Partner comparison view: side-by-side CPE, ROAS, engagement rate

### Phase 3 — Optimization Signals
- [ ] Automated signal detection (run nightly via Supabase pg_cron)
- [ ] Signal inbox in dashboard (overspend risk, ROAS below target, attribution gap)
- [ ] Weekly digest email via Resend: spend, top/bottom placements, signals
- [ ] Claude-powered commentary: "This influencer's engagement rate dropped 42% week-over-week. Likely causes: audience fatigue or off-brand content."

### Phase 4 — Integrations (API pulls, not just webhook pushes)
- [ ] Meta Ads API → auto-populate performance_snapshots for Facebook/Instagram ads
- [ ] Google Ads API → auto-populate for search/display
- [ ] TikTok Ads API
- [ ] CSV import for manual platforms (event attendance, print, podcast)

### Phase 5 — Multi-Tenant Growth
- [ ] Tenant onboarding flow
- [ ] Per-tenant API key management
- [ ] Billing (Lemon Squeezy — consistent with GuruSan precedent)
- [ ] Tenant admin: user invite, role management

---

## File Structure

```
app/
  src/
    app/
      api/
        v1/
          webhooks/
            conversion/     ← inbound attribution events
      campaigns/
        page.tsx            ← campaign list
        [id]/
          page.tsx          ← campaign detail
          placements/
            [pid]/
              page.tsx      ← placement detail
      partners/
        page.tsx
        [id]/
          page.tsx
      settings/
        page.tsx            ← tenant settings, API key
    lib/
      supabase/
        client.ts
        server.ts
      kpi/
        compute.ts          ← KPI calculation utilities
        signals.ts          ← optimization signal detection
      attribution/
        resolve.ts          ← UTM + promo code → placement lookup
  supabase/
    migrations/
    functions/
      process-conversion/   ← webhook handler edge function
      weekly-digest/        ← scheduled digest email
      signal-detection/     ← nightly optimization signals
```

---

## Standing Instructions

### Security
- Tenant API keys are hashed (bcrypt) in the DB; plaintext shown only once at creation
- Webhook endpoint rate-limited: 100 req/min per tenant
- All monetary values stored as `numeric(12,2)`, never floats
- No raw PII from tenant products stored — `external_user_id` only

### Data Integrity
- `spend_records` is append-only (no updates, no deletes). Corrections are new rows with negative amounts
- `performance_snapshots` are append-only. The latest snapshot per placement is the current state
- `attributions` are append-only. Disputes are flagged with a `disputed` boolean, not deleted

### Documentation Drift
Same rule as GuruSan: when two documents disagree on schema, KPI definition, or a
vendor decision, identify the authoritative source, update all stale documents,
and report the conflict before continuing.

### Vendor Decision
Payment processor: **Lemon Squeezy** (Merchant of Record model, consistent with
GuruSan). Do not build against Stripe.
