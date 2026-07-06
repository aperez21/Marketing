# Marketing Session Log

Entries are appended below, most recent first. Each entry is written by Claude at the end of a Cowork session.

---

<!-- Template for new entries:

## YYYY-MM-DD — One-line session title
**Scope:** What area (GuruSan marketing / xQuizit marketing / cross-product)
**Done:**
- Item 1
**Decisions:** none / or list decisions
**Open items added:** none / or list new tasks or blockers

-->
## 2026-07-06 (2) — Built Phase 1 Core Dashboard (auth + campaigns/placements pages)
**Scope:** Marketing / Campaign Intelligence Platform — app code only, Supabase migration
**Done:**
- Found a real functional gap before writing any UI: RLS policies depend on
  `auth.jwt() ->> 'tenant_id'`, but nothing populated that claim. Wrote and
  applied migration `0011_custom_access_token_hook.sql` — a
  `custom_access_token_hook` Postgres function that injects `tenant_id` +
  `tenant_role` into the JWT from `tenant_users`. Confirmed security
  advisors clean after applying. This still needs to be manually selected
  in Supabase Dashboard → Authentication → Hooks (Beta) — no SQL/API way to
  enable it.
- Added Tailwind CSS v4 (missing from this app, unlike GuruSan) — postcss
  config + globals.css matching GuruSan's setup.
- Generated real TypeScript types from the live schema
  (`lib/supabase/types.ts`) via the Supabase MCP tool rather than hand-typing
  or using `any`.
- Built the standard `@supabase/ssr` client/server/middleware helpers
  (mirrored GuruSan's proven pattern), a `lib/tenant.ts` session helper that
  distinguishes "not logged in" (→ `/login`) from "logged in, no
  `tenant_users` row yet" (→ `/no-access`, since tenant invitation is a
  Phase 5 concern not built yet), `/login` (Google OAuth only — no
  email/password, no self-serve signup since there's no tenant-creation flow
  for it to feed into), `/auth/callback`, `/auth/signout`.
- Built `/campaigns` (list + primary KPI vs. goal), `/campaigns/[id]` (spend
  summary, KPI scorecard vs. all `campaign_goals`, placements list, manual
  spend entry form), `/campaigns/[id]/placements/[pid]` (performance
  snapshot history, attributions, manual snapshot entry form with
  engagement_rate computed automatically from reach + engagements).
- Hit and fixed two real bugs during `npm run build`:
  - `@supabase/ssr` was pinned to `^0.5.0` (resolved 0.5.2) while
    `@supabase/supabase-js` is on 2.110.0 — the version skew silently broke
    generic type inference on `.insert()` (typed as `never[]`). Bumped to
    `^0.12.0`, matching supabase-js's `__InternalSupabase.PostgrestVersion`
    marker.
  - Next.js 16 deprecated `middleware.ts` in favor of `proxy.ts` — renamed
    and confirmed the build warning cleared.
- Ran `next dev` locally and curl-verified: `/marketing` redirects to
  `/marketing/login` (basePath preserved through the redirect), the login
  page renders the Google sign-in button, `/no-access` renders. Stopped the
  dev server by killing only the port-3001 PID specifically (not
  `taskkill /IM node.exe`, which had collateral-killed an unrelated process
  in a previous session).
- Added the public `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  env vars to Vercel Production (safe to expose by design) so the next
  deploy has what it needs — did not trigger a deploy this session.
- Updated `DEVELOPMENT_PLAN.md` Phase 1 checkboxes and documented the three
  remaining human steps inline there.
**Decisions:**
- Login is Google-only for now, matching the specific Phase 1 checklist item
  in `DEVELOPMENT_PLAN.md` rather than the tech-stack table's broader
  "Google OAuth + email" — there's no tenant self-serve signup flow yet for
  email/password to feed into (tenant invitation is Phase 5), so it would be
  dead UI right now.
- Did not deploy this work to Vercel or push to git this session — build
  and local dev were verified, but real Google sign-in can't work until the
  three human steps land, so shipping it now would just be a login page
  nobody can get past.
**Open items added:**
- Phase 1 human steps (Google Cloud OAuth client, enable Google provider in
  Supabase, enable the custom_access_token_hook in Supabase Dashboard) — see
  `DEVELOPMENT_PLAN.md`.
- Not yet committed to git or deployed — ask before doing either, since the
  login flow can't be fully tested until the human steps land.

## 2026-07-06 — Deployed Campaign Intelligence Platform live on gurusan.observer/marketing
**Scope:** Cross-project (Marketing + GuruSan) — Vercel Microfrontends wiring
**Done:**
- Found the local Vercel project link (`app/.vercel/project.json`) pointed at
  a project ID that didn't exist remotely; removed it and relinked, which
  revealed the real `campaign-intelligence-platform` project already existed
  (created ~2h prior in an earlier session) with `SUPABASE_URL` set but
  missing `SUPABASE_SERVICE_ROLE_KEY` in Production — added it.
- Created the Vercel Microfrontends group `GuruSan`
  (`mfe_QUK5gt8RbeZofQkJ5MtZCaU7mUQa`), linking `guru-san` (default app,
  owns `gurusan.observer`) and `campaign-intelligence-platform` (child app,
  default route `/marketing`).
- Edited GuruSan's repo (a separate, live production business repo) to add
  `app/microfrontends.json` and the `@vercel/microfrontends` dependency;
  committed and pushed after confirming with the user, since this triggers a
  real production redeploy of `gurusan.observer`. Two commits: initial
  wiring, then a schema fix (missing required `development.fallback` field
  on the default app entry).
- GuruSan's working tree had several unrelated uncommitted changes (a
  `.claude/scheduled_tasks.lock` deletion, and a Paddle→Creem vendor-name
  sweep across `privacy`, `refund-policy`, `terms` pages and the Privacy
  Policy draft) that blocked the pre-push rebase hook. **These were not
  stale — the user confirmed another terminal was actively working in the
  same GuruSan repo concurrently while this session ran.** Stashed them by
  explicit path (not blanket) immediately before each push and restored them
  immediately after, rather than leaving them stashed for any length of
  time, to minimize the window where the other terminal's live edits
  weren't on disk. Did not touch or commit any of that work. Risk flagged
  for next time below.
- Deployed `campaign-intelligence-platform` to production
  (`dpl_7uRCTeEgnKuPpfZvT68NzBspoxPM`). First deploy attempt after the schema
  fix failed with the same stale error (propagation delay); retry ~1 min
  later succeeded.
- Verified live end-to-end via curl: `gurusan.observer/marketing` returns
  this app's own 404 (no dashboard pages built yet — expected), with assets
  correctly namespaced; the webhook route returned a real 401 from the
  actual handler, confirming requests reach the real app through GuruSan's
  domain rather than failing at the routing layer.
- Documented the architecture, gotchas, and current status in
  `docs/vercel-microfrontends-architecture.md`.
**Decisions:**
- Treated creating the microfrontends group and editing/pushing to GuruSan's
  repo as actions requiring explicit user confirmation first, since both
  touch shared/live production infrastructure outside this project — asked
  before each, per the user's answers.
- Deployed to Production directly (not Preview) since GuruSan's Preview
  environment variables can't be scoped to `main` (it's the Production
  branch), and a real proof-of-concept URL was the actual goal.
**Open items added:**
- Phase 1 (Core Dashboard) still needs to be built — right now
  `gurusan.observer/marketing` has no pages, only the webhook API route.
- **Concurrency risk in GuruSan's repo:** another terminal/session is
  actively editing files there (confirmed by the user) at the same time
  Claude Code sessions may be pushing to it. Stash-then-pop around a push is
  not fully safe against a genuinely concurrent writer — a future session
  touching GuruSan's repo should check for other active work (e.g. recent
  file mtimes, `.claude/scheduled_tasks.lock`, ask the user) before stashing
  uncommitted changes, and keep any such stash window as short as possible.
- GuruSan's in-progress Paddle→Creem legal-page rename is still uncommitted
  in that repo — it's someone else's active work, not part of this
  session's scope, and shouldn't be committed by a future session without
  checking first.

## 2026-07-05 — Marketing repo bootstrapped: git, dev plan, Claude Code handoff structure
**Scope:** Marketing / Campaign Intelligence Platform infrastructure
**Done:**
- Initialized git in the project folder, set default branch to `main`, linked remote to https://github.com/aperez21/Marketing, pushed initial commit
- Created `DEVELOPMENT_PLAN.md` breaking CLAUDE.md's Build Phases (0-5) into tasks tagged Human / Claude Code / Mixed ownership
- Created `claude-code-tasks/` with a handoff convention (README) and 4 ready-to-run Phase 0 task briefs: schema migrations, webhook endpoint, seed reference data, campaign_performance view
- Created a `project-logs/` directory (README + first entry) intended for the same purpose as this file — see note below
**Decisions:** Repo root is `C:\Users\AuZ\Documents\Claude\Projects\Marketing`; remote is `aperez21/Marketing`
**Open items added:** Supabase project for the Campaign Intelligence Platform not yet created (blocks all Phase 0 applied steps); GuruSan-side webhook API key/secret exchange not started

