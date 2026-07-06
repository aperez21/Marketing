# Vercel Microfrontends Architecture

**Status as of 2026-07-06: LIVE.** `gurusan.observer/marketing` routes to this
app's production deployment. See "Current status" below.

## What this is

Vercel Microfrontends composes multiple independently-deployed Vercel projects
into one cohesive application under a single domain, with routing handled by
Vercel's edge — no custom reverse proxy to build or maintain.

This lets the Campaign Intelligence Platform go live as a real, working proof
of concept at `gurusan.observer/marketing` without provisioning (and paying
for) its own dedicated domain first.

## Roles

| Project | Role | Owns |
|---|---|---|
| `guru-san` | **Default app** | The domain (`gurusan.observer`) and the `microfrontends.json` manifest that declares routing rules for all child apps |
| `campaign-intelligence-platform` | **Child app** | Its own independent Vercel project/deployment, mounted at the `/marketing` path prefix |

Each app is deployed, built, and can be redeployed completely independently.
The child app doesn't need to know about the default app's code — only that
it's registered in the shared microfrontends group with a default route.

## How it works

- `app/next.config.js` sets `basePath: "/marketing"`, so every route in this
  Next.js app — pages and API routes, including
  `/api/v1/webhooks/conversion` — actually lives under `/marketing/...`.
- It wraps the Next config in `withMicrofrontends()` from
  `@vercel/microfrontends/next/config`. At build time this needs to resolve
  which microfrontends group the project belongs to, in order to correctly
  infer routing/asset-prefix behavior.
- At request time, a request to `gurusan.observer/marketing/campaigns` is
  routed by Vercel's edge (per the microfrontends group config) to this
  project's deployment — transparent to the end user, no visible redirect.

## Current status

- `campaign-intelligence-platform` exists as a real Vercel project (team
  `aperez21s-projects`), linked locally via `app/.vercel/project.json`.
- Production environment variables `SUPABASE_URL` and
  `SUPABASE_SERVICE_ROLE_KEY` are set.
- Microfrontends group `GuruSan` (id `mfe_QUK5gt8RbeZofQkJ5MtZCaU7mUQa`)
  created 2026-07-05, linking `guru-san` (default app) and
  `campaign-intelligence-platform` (child, default route `/marketing`).
- `GuruSan/app/microfrontends.json` added and pushed (commits `3fa2343`,
  `3cb465b` in the GuruSan repo) — declares the child app's routing
  (`/marketing/:path*`) and the required `development.fallback` for the
  default app entry (`https://gurusan.observer`).
- `GuruSan/app/package.json` now depends on `@vercel/microfrontends`.
- Production deploy of `campaign-intelligence-platform` succeeded 2026-07-06
  (`dpl_7uRCTeEgnKuPpfZvT68NzBspoxPM`), aliased to
  `campaign-intelligence-platform-ten.vercel.app`.
- **Verified live end-to-end:** `curl https://gurusan.observer/marketing`
  returns this app's own 404 page (correct — no dashboard pages exist yet,
  Phase 1 isn't built), with asset paths correctly namespaced under
  `/vc-ap-accd8c/...` (the microfrontends asset-prefix mechanism).
  `gurusan.observer/marketing/api/v1/webhooks/conversion` returns a real 401
  from the actual route handler (missing auth header) — confirming requests
  are reaching this app's real code through GuruSan's domain, not erroring
  at the routing layer.

## Gotchas hit during setup (for next time)

- The `microfrontends.json` schema requires a `development.fallback` field
  on the **default app's** entry, not just routing on the child. Omitting it
  fails schema validation with a somewhat indirect error ("Unable to infer if
  applications/guru-san is the default app or a child app").
- After pushing a `microfrontends.json` change to the default app's repo,
  there's a short propagation delay before the child app's build can resolve
  the updated group config — the first retry deploy failed with the same
  stale schema error even after the fix was live; a second retry ~a minute
  later succeeded.
- Git Bash on Windows mangles a leading `/` in CLI args (MSYS path
  conversion turns `/marketing` into a Windows path). Use
  `MSYS_NO_PATHCONV=1` as an env prefix when passing paths like
  `--project-default-route=child=/marketing` to `vercel` from Git Bash.

## Where to view/manage this in the Vercel dashboard

Project → Settings → Microfrontends, e.g.:

`vercel.com/aperez21s-projects/campaign-intelligence-platform/settings/microfrontends`

Confirmed live 2026-07-05 — currently empty pending group creation. Once the
group exists, this page (and the equivalent page on `guru-san`) shows the
group's member apps and routing.
