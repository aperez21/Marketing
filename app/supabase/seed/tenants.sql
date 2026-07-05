-- Registers GuruSan as tenant #1 (dogfood tenant per CLAUDE.md).
--
-- slug/industry confirmed by human 2026-07-05. Applied to wtltwglxpasvkgjegcas
-- on 2026-07-05: id 428db548-f445-4d48-9574-6aef78d927d7.

insert into tenants (name, slug, industry) values
  ('GuruSan', 'gurusan', 'spiritual wellness')
on conflict (slug) do nothing;

-- After this runs, link your Supabase Auth user to this tenant, e.g.:
--
-- insert into tenant_users (tenant_id, user_id, role)
-- select id, '<your-auth-user-uuid>', 'owner'
-- from tenants where slug = 'gurusan';
