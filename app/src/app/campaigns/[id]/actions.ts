"use server";

import { revalidatePath } from "next/cache";
import { requireTenantSession } from "@/lib/tenant";
import { createClient } from "@/lib/supabase/server";

export async function createSpendRecord(formData: FormData) {
  const session = await requireTenantSession();

  const campaignId = String(formData.get("campaign_id") ?? "");
  const amountUsd = Number(formData.get("amount_usd"));
  const spendType = String(formData.get("spend_type") ?? "");
  const paidAt = String(formData.get("paid_at") ?? "");
  const placementId = String(formData.get("placement_id") ?? "");
  const invoiceRef = String(formData.get("invoice_ref") ?? "");
  const notes = String(formData.get("notes") ?? "");

  if (!campaignId || !Number.isFinite(amountUsd) || !spendType || !paidAt) {
    throw new Error("Amount, type, and paid date are required.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("spend_records").insert({
    tenant_id: session.tenantId,
    campaign_id: campaignId,
    placement_id: placementId || null,
    amount_usd: amountUsd,
    spend_type: spendType,
    paid_at: paidAt,
    invoice_ref: invoiceRef || null,
    notes: notes || null,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/campaigns/${campaignId}`);
}
