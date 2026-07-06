"use server";

import { revalidatePath } from "next/cache";
import { requireTenantSession } from "@/lib/tenant";
import { createClient } from "@/lib/supabase/server";

function parseOptionalInt(formData: FormData, key: string): number | null {
  const raw = formData.get(key);
  if (raw === null || raw === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export async function createSnapshot(formData: FormData) {
  await requireTenantSession();

  const campaignId = String(formData.get("campaign_id") ?? "");
  const placementId = String(formData.get("placement_id") ?? "");

  if (!campaignId || !placementId) {
    throw new Error("Missing campaign or placement id.");
  }

  const impressions = parseOptionalInt(formData, "impressions");
  const reach = parseOptionalInt(formData, "reach");
  const views = parseOptionalInt(formData, "views");
  const likes = parseOptionalInt(formData, "likes");
  const comments = parseOptionalInt(formData, "comments");
  const shares = parseOptionalInt(formData, "shares");
  const saves = parseOptionalInt(formData, "saves");
  const clicks = parseOptionalInt(formData, "clicks");
  const linkClicks = parseOptionalInt(formData, "link_clicks");

  const engagements = (likes ?? 0) + (comments ?? 0) + (shares ?? 0) + (saves ?? 0);
  const engagementRate = reach && reach > 0 ? engagements / reach : null;

  const supabase = await createClient();
  const { error } = await supabase.from("performance_snapshots").insert({
    placement_id: placementId,
    impressions,
    reach,
    views,
    likes,
    comments,
    shares,
    saves,
    clicks,
    link_clicks: linkClicks,
    engagement_rate: engagementRate,
    source: "manual",
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/campaigns/${campaignId}/placements/${placementId}`);
}
