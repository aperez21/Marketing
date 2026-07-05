-- Partners (influencers, venues, publications, creators, agencies)
create table partners (
  id                   uuid primary key default gen_random_uuid(),
  tenant_id            uuid not null references tenants(id),
  type                 text not null, -- 'influencer' | 'venue' | 'publication' | 'creator' | 'agency'
  name                 text not null,
  handle               text,           -- social handle or contact name
  platform             text,           -- primary platform (instagram, tiktok, youtube, local, etc.)
  profile_url          text,
  audience_size        int,            -- followers / monthly reach
  avg_engagement_rate  numeric(6,4),   -- e.g. 0.0340 = 3.40%
  niche                text[],         -- e.g. ARRAY['wellness','spirituality']
  location             text,           -- city/region, for local partners
  contact_email        text,
  notes                text,
  created_at           timestamptz default now()
);

-- Placements (individual executions: one post, one event, one ad group)
create table placements (
  id                  uuid primary key default gen_random_uuid(),
  campaign_id         uuid not null references campaigns(id),
  partner_id          uuid references partners(id),  -- null = self-executed
  channel_id          uuid references channels(id),
  name                text not null,
  placement_type      text not null,
    -- 'post' | 'story' | 'reel' | 'video' | 'event' | 'ad_group'
    -- | 'email' | 'flyer' | 'podcast_mention' | 'article' | 'billboard'
  status              text not null default 'scheduled',
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
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);
