-- Reference tables: shared across all tenants, no tenant_id.

create extension if not exists pgcrypto;

create table channels (
  id       uuid primary key default gen_random_uuid(),
  name     text not null,        -- 'Instagram', 'TikTok', 'Google Ads', 'Local Event', etc.
  type     text not null,        -- 'influencer' | 'local' | 'digital' | 'organic' | 'event' | 'print'
  platform text                  -- 'meta' | 'google' | 'tiktok' | 'youtube' | 'email' | 'local'
);
