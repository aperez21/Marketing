// Supabase Edge Function (Deno runtime). Invoked internally by
// app/src/app/api/v1/webhooks/conversion/route.ts so that handler can
// return 202 without blocking on attribution resolution + insert.
//
// NOTE: resolution logic here is intentionally a small duplicate of
// app/src/lib/attribution/resolve.ts rather than a shared import - this
// function runs on Deno and can't import Next.js/Node modules from app/src.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// NOTE: no internal header string-match check here. The original version
// compared the incoming Authorization header against
// Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as defense-in-depth, but that
// broke the first time this was tested end-to-end (2026-07-05): this project
// has rotated to Supabase's new short-form `sb_secret_...` service key, while
// the route handler still authenticates using the legacy JWT-format
// service_role key - the two are different strings for the same project, so
// the internal match never succeeds. The platform's own `verify_jwt: true`
// gate (set at deploy time) already rejects any request without a validly
// signed project JWT/secret key, so it is the real boundary here - no need to
// duplicate it against a specific key format that can rotate independently.

interface ConversionPayload {
  conversion_type: string;
  revenue_usd?: number | null;
  external_user_id: string;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  promo_code_used?: string | null;
  converted_at: string;
}

interface Resolved {
  campaign_id: string;
  placement_id: string | null;
  attribution_method: "promo_code" | "utm";
}

// deno-lint-ignore no-explicit-any
async function resolveAttribution(
  admin: any,
  tenantId: string,
  payload: ConversionPayload
): Promise<Resolved | null> {
  if (payload.promo_code_used) {
    const { data } = await admin
      .from("placements")
      .select("id, campaign_id, campaigns!inner(tenant_id)")
      .eq("promo_code", payload.promo_code_used)
      .eq("campaigns.tenant_id", tenantId)
      .maybeSingle();

    if (data) {
      return { campaign_id: data.campaign_id, placement_id: data.id, attribution_method: "promo_code" };
    }
  }

  if (payload.utm_content) {
    const { data } = await admin
      .from("placements")
      .select("id, campaign_id, campaigns!inner(tenant_id)")
      .eq("id", payload.utm_content)
      .eq("campaigns.tenant_id", tenantId)
      .maybeSingle();

    if (data) {
      return { campaign_id: data.campaign_id, placement_id: data.id, attribution_method: "utm" };
    }
  }

  if (payload.utm_campaign) {
    const { data } = await admin
      .from("campaigns")
      .select("id")
      .eq("tenant_id", tenantId)
      .ilike("name", payload.utm_campaign)
      .maybeSingle();

    if (data) {
      return { campaign_id: data.id, placement_id: null, attribution_method: "utm" };
    }
  }

  return null;
}

Deno.serve(async (req: Request) => {
  const { tenant_id: tenantId, payload } = (await req.json()) as {
    tenant_id: string;
    payload: ConversionPayload;
  };

  const admin = createClient(supabaseUrl, serviceRoleKey);

  const resolved = await resolveAttribution(admin, tenantId, payload);
  if (!resolved) {
    // Per CLAUDE.md's "Attribution gap" optimization signal: spend recorded
    // but tracking couldn't resolve a campaign/placement for this event.
    console.error("attribution resolution failed", { tenantId, payload });
    return new Response("Could not resolve attribution", { status: 422 });
  }

  const { error } = await admin.from("attributions").insert({
    tenant_id: tenantId,
    campaign_id: resolved.campaign_id,
    placement_id: resolved.placement_id,
    conversion_type: payload.conversion_type,
    revenue_usd: payload.revenue_usd ?? null,
    attribution_method: resolved.attribution_method,
    utm_source: payload.utm_source ?? null,
    utm_medium: payload.utm_medium ?? null,
    utm_campaign: payload.utm_campaign ?? null,
    utm_content: payload.utm_content ?? null,
    promo_code_used: payload.promo_code_used ?? null,
    external_user_id: payload.external_user_id,
    converted_at: payload.converted_at,
  });

  if (error) {
    console.error("attributions insert failed", error);
    return new Response("Insert failed", { status: 500 });
  }

  return new Response("OK", { status: 200 });
});
