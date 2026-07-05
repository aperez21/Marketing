-- Row Level Security for tenant isolation.
--
-- NOTE on doc drift (see CLAUDE.md "Documentation Drift" standing instruction):
-- CLAUDE.md's Multi-Tenancy Rules give the policy shape as
--   USING (tenant_id = auth.jwt() -> 'tenant_id')
-- but `auth.jwt() -> 'tenant_id'` returns jsonb, which cannot be compared to a
-- uuid column. The working form used below is:
--   USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid)
-- (`->>` extracts text, then cast to uuid.) CLAUDE.md should be updated to
-- this form.
--
-- NOTE on doc drift #2: CLAUDE.md's Multi-Tenancy Rules state "every table
-- (except reference lookups) carries tenant_id". In the actual schema,
-- campaign_goals, placements, and performance_snapshots do NOT have a
-- tenant_id column - they're scoped transitively through campaign_id /
-- placement_id. Policies for those three tables below use a subquery through
-- the parent chain instead of a direct tenant_id comparison.

create or replace function current_tenant_id() returns uuid
language sql stable
as $$
  select (auth.jwt() ->> 'tenant_id')::uuid
$$;

-- channels: shared reference data, readable by any authenticated tenant user.
alter table channels enable row level security;
create policy channels_select on channels
  for select using (true);

alter table tenants enable row level security;
create policy tenants_isolation on tenants
  using (id = current_tenant_id());

alter table tenant_users enable row level security;
create policy tenant_users_isolation on tenant_users
  using (tenant_id = current_tenant_id());

alter table campaigns enable row level security;
create policy campaigns_isolation on campaigns
  using (tenant_id = current_tenant_id());

alter table campaign_goals enable row level security;
create policy campaign_goals_isolation on campaign_goals
  using (
    campaign_id in (select id from campaigns where tenant_id = current_tenant_id())
  );

alter table partners enable row level security;
create policy partners_isolation on partners
  using (tenant_id = current_tenant_id());

alter table placements enable row level security;
create policy placements_isolation on placements
  using (
    campaign_id in (select id from campaigns where tenant_id = current_tenant_id())
  );

alter table performance_snapshots enable row level security;
create policy performance_snapshots_isolation on performance_snapshots
  using (
    placement_id in (
      select id from placements where campaign_id in (
        select id from campaigns where tenant_id = current_tenant_id()
      )
    )
  );

alter table attributions enable row level security;
create policy attributions_isolation on attributions
  using (tenant_id = current_tenant_id());

alter table spend_records enable row level security;
create policy spend_records_isolation on spend_records
  using (tenant_id = current_tenant_id());
