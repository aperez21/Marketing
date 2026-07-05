-- Performance snapshots (time-series; one row per capture per placement)
create table performance_snapshots (
  id              uuid primary key default gen_random_uuid(),
  placement_id    uuid not null references placements(id),
  captured_at     timestamptz not null default now(),
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
  source          text not null default 'manual'
    -- 'manual' | 'api' | 'csv_import'
);

-- Attributions (placement -> conversion in tenant's product)
create table attributions (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id          uuid not null references tenants(id),
  campaign_id        uuid not null references campaigns(id),
  placement_id       uuid references placements(id), -- null = campaign-level only
  conversion_type    text not null,
    -- 'signup' | 'purchase' | 'lead' | 'assessment_complete' | 'foot_traffic' | 'email_capture'
  revenue_usd        numeric(12,2),   -- null if not a revenue event
  attribution_method text not null,
    -- 'utm' | 'promo_code' | 'referral_link' | 'self_reported' | 'manual'
  utm_source         text,
  utm_medium         text,
  utm_campaign       text,
  utm_content        text,
  promo_code_used    text,
  external_user_id   text,  -- ID in tenant's own system (e.g. Supabase user ID)
  converted_at       timestamptz not null
);

-- Spend ledger (immutable record of actual spend)
create table spend_records (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references tenants(id),
  campaign_id   uuid not null references campaigns(id),
  placement_id  uuid references placements(id),
  amount_usd    numeric(12,2) not null,
  spend_type    text not null,
    -- 'influencer_fee' | 'media_buy' | 'production' | 'event_cost' | 'tool_cost' | 'other'
  paid_at       date not null,
  invoice_ref   text,
  notes         text
);

-- Key indexes
create index on campaigns(tenant_id, status);
create index on placements(campaign_id, status);
create index on performance_snapshots(placement_id, captured_at desc);
create index on attributions(campaign_id, conversion_type, converted_at desc);
create index on spend_records(campaign_id);
create index on spend_records(placement_id);
