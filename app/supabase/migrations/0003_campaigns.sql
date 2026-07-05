-- Campaigns (top-level planning unit) and their KPI targets.

create table campaigns (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id          uuid not null references tenants(id),
  name               text not null,
  description        text,
  type               text not null, -- 'influencer' | 'local' | 'digital' | 'mixed'
  status             text not null default 'draft',
    -- 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
  start_date         date,
  end_date           date,
  total_budget_usd   numeric(12,2),
  primary_goal       text not null,
    -- 'awareness' | 'signups' | 'purchases' | 'engagement' | 'foot_traffic' | 'leads'
  notes              text,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);

-- KPI targets per campaign (multiple goals allowed)
create table campaign_goals (
  id           uuid primary key default gen_random_uuid(),
  campaign_id  uuid not null references campaigns(id) on delete cascade,
  metric       text not null,
    -- 'cac' | 'cpa' | 'roas' | 'cpm' | 'cpc' | 'ctr' | 'cpe'
    -- | 'signups' | 'purchases' | 'leads' | 'impressions' | 'engagement_rate'
  target_value numeric(12,4) not null,
  priority     text not null default 'secondary' -- 'primary' | 'secondary'
);
