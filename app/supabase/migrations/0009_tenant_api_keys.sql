-- Tenant API keys for the conversion webhook (see claude-code-tasks/002-webhook-endpoint.md).
--
-- NOTE: not in CLAUDE.md's Database Schema section, but required by its
-- Standing Instructions > Security: "Tenant API keys are hashed (bcrypt) in
-- the DB; plaintext shown only once at creation." Added here to make that
-- requirement concrete. CLAUDE.md's Database Schema section should be
-- updated to include this table (flagging per Documentation Drift).
--
-- key_prefix is the first 8 chars of the raw key, stored in plaintext, so the
-- webhook can look up candidate rows in O(1) before doing the bcrypt compare
-- (bcrypt hashes are salted and can't be looked up by equality directly).

create table tenant_api_keys (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id),
  name        text not null default 'default',
  key_prefix  text not null unique,
  key_hash    text not null,
  created_at  timestamptz default now(),
  revoked_at  timestamptz
);

create index on tenant_api_keys(tenant_id);

alter table tenant_api_keys enable row level security;
create policy tenant_api_keys_isolation on tenant_api_keys
  using (tenant_id = current_tenant_id());
