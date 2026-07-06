import Link from "next/link";
import { notFound } from "next/navigation";
import { requireTenantSession } from "@/lib/tenant";
import { createClient } from "@/lib/supabase/server";
import { formatUsd } from "@/lib/kpi/compute";
import { SnapshotForm } from "./SnapshotForm";

export default async function PlacementDetailPage({
  params,
}: {
  params: Promise<{ id: string; pid: string }>;
}) {
  await requireTenantSession();
  const { id, pid } = await params;
  const supabase = await createClient();

  const [{ data: placement }, { data: snapshots }, { data: attributions }] =
    await Promise.all([
      supabase
        .from("placements")
        .select(
          "*, channels(name), partners(name), campaigns!placements_campaign_id_fkey(id, name)"
        )
        .eq("id", pid)
        .eq("campaign_id", id)
        .maybeSingle(),
      supabase
        .from("performance_snapshots")
        .select("*")
        .eq("placement_id", pid)
        .order("captured_at", { ascending: false }),
      supabase
        .from("attributions")
        .select("*")
        .eq("placement_id", pid)
        .order("converted_at", { ascending: false }),
    ]);

  if (!placement) {
    notFound();
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <Link
          href={`/campaigns/${id}`}
          className="text-sm text-neutral-500 hover:underline"
        >
          ← {placement.campaigns.name}
        </Link>
        <div className="flex items-center justify-between mt-2">
          <h1 className="text-lg font-semibold">{placement.name}</h1>
          <span className="inline-block px-2 py-0.5 rounded text-xs bg-neutral-100 dark:bg-neutral-800 capitalize">
            {placement.status}
          </span>
        </div>
        <p className="text-sm text-neutral-500 mt-1 capitalize">
          {placement.placement_type.replace(/_/g, " ")}
          {placement.channels?.name ? ` · ${placement.channels.name}` : ""}
          {placement.partners?.name ? ` · ${placement.partners.name}` : ""}
        </p>
        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
          <div>
            <p className="text-xs text-neutral-500">Budget / Spend</p>
            <p className="mt-0.5">
              {formatUsd(placement.budget_allocated_usd)} /{" "}
              {formatUsd(placement.spend_actual_usd)}
            </p>
          </div>
          {placement.promo_code && (
            <div>
              <p className="text-xs text-neutral-500">Promo code</p>
              <p className="mt-0.5 font-mono">{placement.promo_code}</p>
            </div>
          )}
          {placement.tracking_url && (
            <div className="col-span-2">
              <p className="text-xs text-neutral-500">Tracking URL</p>
              <a
                href={placement.tracking_url}
                target="_blank"
                rel="noreferrer"
                className="mt-0.5 text-sm hover:underline break-all"
              >
                {placement.tracking_url}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Performance snapshots */}
      <section>
        <h2 className="text-sm font-medium text-neutral-500 mb-3">
          Performance history
        </h2>
        {!snapshots || snapshots.length === 0 ? (
          <p className="text-sm text-neutral-500">No snapshots recorded yet.</p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left border-b text-neutral-500">
                <th className="py-2 pr-4 font-medium">Captured</th>
                <th className="py-2 pr-4 font-medium">Impressions</th>
                <th className="py-2 pr-4 font-medium">Reach</th>
                <th className="py-2 pr-4 font-medium">Clicks</th>
                <th className="py-2 pr-4 font-medium">Engagements</th>
                <th className="py-2 pr-4 font-medium">Eng. rate</th>
                <th className="py-2 pr-4 font-medium">Source</th>
              </tr>
            </thead>
            <tbody>
              {snapshots.map((s) => {
                const engagements =
                  (s.likes ?? 0) + (s.comments ?? 0) + (s.shares ?? 0) + (s.saves ?? 0);
                return (
                  <tr key={s.id} className="border-b">
                    <td className="py-2 pr-4">
                      {new Date(s.captured_at).toLocaleString()}
                    </td>
                    <td className="py-2 pr-4">
                      {(s.impressions ?? 0).toLocaleString()}
                    </td>
                    <td className="py-2 pr-4">{(s.reach ?? 0).toLocaleString()}</td>
                    <td className="py-2 pr-4">{(s.clicks ?? 0).toLocaleString()}</td>
                    <td className="py-2 pr-4">{engagements.toLocaleString()}</td>
                    <td className="py-2 pr-4">
                      {s.engagement_rate !== null
                        ? `${(s.engagement_rate * 100).toFixed(2)}%`
                        : "—"}
                    </td>
                    <td className="py-2 pr-4 capitalize">{s.source}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <div className="mt-4">
          <SnapshotForm campaignId={id} placementId={pid} />
        </div>
      </section>

      {/* Attributions */}
      <section>
        <h2 className="text-sm font-medium text-neutral-500 mb-3">
          Attributions
        </h2>
        {!attributions || attributions.length === 0 ? (
          <p className="text-sm text-neutral-500">No conversions attributed yet.</p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left border-b text-neutral-500">
                <th className="py-2 pr-4 font-medium">Converted</th>
                <th className="py-2 pr-4 font-medium">Type</th>
                <th className="py-2 pr-4 font-medium">Revenue</th>
                <th className="py-2 pr-4 font-medium">Method</th>
              </tr>
            </thead>
            <tbody>
              {attributions.map((a) => (
                <tr key={a.id} className="border-b">
                  <td className="py-2 pr-4">
                    {new Date(a.converted_at).toLocaleString()}
                  </td>
                  <td className="py-2 pr-4 capitalize">
                    {a.conversion_type.replace(/_/g, " ")}
                  </td>
                  <td className="py-2 pr-4">{formatUsd(a.revenue_usd)}</td>
                  <td className="py-2 pr-4 capitalize">
                    {a.attribution_method.replace(/_/g, " ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
