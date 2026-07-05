import type { SupabaseClient } from "@supabase/supabase-js";

export interface ConversionPayload {
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

export type AttributionMethod =
  | "promo_code"
  | "utm"
  | "referral_link"
  | "self_reported"
  | "manual";

export interface ResolvedAttribution {
  campaign_id: string;
  placement_id: string | null;
  attribution_method: AttributionMethod;
}

interface PlacementRow {
  id: string;
  campaign_id: string;
}

/**
 * Resolves a webhook payload to a campaign (and, where possible, a placement),
 * per CLAUDE.md's priority order: promo_code > utm > referral > self_reported > manual.
 *
 * Referral-link and self-reported/manual resolution aren't implemented here -
 * the schema has no dedicated referral field on placements, and self-reported/
 * manual attribution is a dashboard-assigned flow (CLAUDE.md), not a webhook
 * input. Flagged as an open gap for a human to confirm.
 */
export async function resolveAttribution(
  supabase: SupabaseClient,
  tenantId: string,
  payload: ConversionPayload
): Promise<ResolvedAttribution | null> {
  if (payload.promo_code_used) {
    const { data } = await supabase
      .from("placements")
      .select("id, campaign_id, campaigns!inner(tenant_id)")
      .eq("promo_code", payload.promo_code_used)
      .eq("campaigns.tenant_id", tenantId)
      .maybeSingle<PlacementRow>();

    if (data) {
      return {
        campaign_id: data.campaign_id,
        placement_id: data.id,
        attribution_method: "promo_code",
      };
    }
  }

  // utm_content carries the placement id, per the Webhook API example in CLAUDE.md.
  if (payload.utm_content) {
    const { data } = await supabase
      .from("placements")
      .select("id, campaign_id, campaigns!inner(tenant_id)")
      .eq("id", payload.utm_content)
      .eq("campaigns.tenant_id", tenantId)
      .maybeSingle<PlacementRow>();

    if (data) {
      return {
        campaign_id: data.campaign_id,
        placement_id: data.id,
        attribution_method: "utm",
      };
    }
  }

  // Best-effort fallback: match utm_campaign against campaign name. There's no
  // dedicated campaign slug/utm field in the schema - flagged as an open gap.
  if (payload.utm_campaign) {
    const { data } = await supabase
      .from("campaigns")
      .select("id")
      .eq("tenant_id", tenantId)
      .ilike("name", payload.utm_campaign)
      .maybeSingle<{ id: string }>();

    if (data) {
      return {
        campaign_id: data.id,
        placement_id: null,
        attribution_method: "utm",
      };
    }
  }

  return null;
}
