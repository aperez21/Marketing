-- Tenants and tenant membership.

create table tenants (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text unique not null,
  industry   text,
  created_at timestamptz default now()
);

-- Tenant users (links Supabase auth.users -> tenant)
create table tenant_users (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references tenants(id),
  user_id    uuid not null references auth.users(id),
  role       text not null default 'member', -- 'owner' | 'admin' | 'member' | 'viewer'
  created_at timestamptz default now(),
  unique(tenant_id, user_id)
);
