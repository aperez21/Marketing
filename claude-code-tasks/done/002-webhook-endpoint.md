# Conversion Webhook Endpoint — Task Brief

**Project:** Campaign Intelligence Platform
**Phase:** 0 — Foundation
**Satisfies:** DEVELOPMENT_PLAN.md → "Webhook endpoint live and tested with cURL"
**Depends on:** 001-schema-migrations.md (needs `attributions` table to exist)
**Goal:** Inbound endpoint that lets tenant products push conversion events, per the Webhook API spec in CLAUDE.md.

## Summary

Tenants POST to `/api/v1/webhooks/conversion` with a bearer tenant API key and
a conversion payload (type, revenue, UTM/promo fields, external_user_id,
converted_at). The handler validates the key, resolves campaign/placement from
UTM or promo code (priority: promo_code > utm > referral > self_reported >
manual), inserts into `attributions`, and returns 202 Accepted without
blocking the tenant's checkout. Hard rule: never store PII beyond
`external_user_id`.

## Steps

### Step 1 — Build the endpoint
**Owner: Claude Code**

**Artifacts:**
- `app/src/app/api/v1/webhooks/conversion/route.ts` — created — request handler
- `app/src/lib/attribution/resolve.ts` — created — UTM/promo-code → placement resolution, priority order
- `app/supabase/functions/process-conversion/index.ts` — created — edge function version (async processing so the handler can return 202 immediately)

**Directories:** `app/src/app/api/v1/webhooks/conversion/`, `app/src/lib/attribution/`, `app/supabase/functions/process-conversion/`

**Libraries:** `@supabase/ssr` (or existing Supabase client), none new beyond that

> **Technical note:** Rate limit at 100 req/min per tenant per CLAUDE.md.
> Validate the API key against its bcrypt hash — never compare plaintext.

### Step 2 — Test with cURL
**Owner: Human**

1. Obtain a test tenant API key (create one via the seed data in 003, or manually insert a test tenant)
2. Run a cURL POST against the deployed endpoint with a sample payload matching the spec in CLAUDE.md
3. Confirm a 202 response and that a row appears in `attributions`
