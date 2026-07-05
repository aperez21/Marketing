# Vercel Microfrontends Architecture

**Status as of 2026-07-05:** partially wired, not yet live. See "Current status" below.

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
- **No microfrontends group exists yet.** The first production deploy
  (`vercel deploy --prod`) failed at build time with:
  ```
  Error [MicrofrontendsError]: Unable to automatically infer the location of
  the `microfrontends.json` file...
  ```
  This is expected until the group is created — see Next step below.

## Next step (not yet executed)

Create the group, linking both projects:

```
vercel microfrontends create-group \
  --name="GuruSan" \
  --default-app=guru-san \
  --project=guru-san \
  --project=campaign-intelligence-platform \
  --project-default-route=campaign-intelligence-platform=/marketing \
  --yes
```

This is a shared-infrastructure change — it modifies `guru-san`'s live
project configuration (a production project already serving
`gurusan.observer`) — so it should be run deliberately, not as a
side effect of an unrelated task.

After the group exists, re-run `vercel deploy --prod` from `app/` for this
project; `withMicrofrontends()` should then resolve the group automatically.

## Where to view/manage this in the Vercel dashboard

Project → Settings → Microfrontends, e.g.:

`vercel.com/aperez21s-projects/campaign-intelligence-platform/settings/microfrontends`

Confirmed live 2026-07-05 — currently empty pending group creation. Once the
group exists, this page (and the equivalent page on `guru-san`) shows the
group's member apps and routing.
