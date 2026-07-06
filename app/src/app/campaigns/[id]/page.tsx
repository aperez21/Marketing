import Link from "next/link";
import { notFound } from "next/navigation";
import { requireTenantSession } from "@/lib/tenant";
import { createClient } from "@/lib/supabase/server";
import {
  getMetricValue,
  formatMetricValue,
  formatUsd,
  isMetricOnTrack,
} from "@/lib/kpi/compute";
import { SpendForm } from "./SpendForm";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireTenantSession();
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: campaign },
    { data: performance },
    { data: placements },
    { data: spendRecords },
  ] = await Promise.all([
    supabase
      .from("campaigns")
      .select("*, campaign_goals(id, metric, target_value, priority)")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("campaign_performance").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("placements")
      .select(
        "id, name, placement_type, status, budget_allocated_usd, spend_actual_usd, channels(name), partners(name)"
      )
      .eq("campaign_id", id)
      .order("created_at"),
    supabase
      .from("spend_records")
      .select("spend_type, amount_usd")
      .eq("campaign_id", id),
  ]);

  if (!campaign) {
    notFound();
  }

  const spendByType = new Map<string, number>();
  for (const record of spendRecords ?? []) {
    spendByType.set(
      record.spend_type,
      (spendByType.get(record.spend_type) ?? 0) + record.amount_usd
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <Link href="/campaigns" className="text-sm text-neutral-500 hover:underline">
          ← Campaigns
        </Link>
        <div className="flex items-center justify-between mt-2">
          <h1 className="text-lg font-semibold">{campaign.name}</h1>
          <span className="inline-block px-2 py-0.5 rounded text-xs bg-neutral-100 dark:bg-neutral-800 capitalize">
            {campaign.status}
          </span>
        </div>
        <p className="text-sm text-neutral-500 mt-1 capitalize">
          {campaign.type} · {campaign.primary_goal.replace("_", " ")}
        </p>
        {campaign.description && (
          <p className="text-sm text-neutral-500 mt-2">{campaign.description}</p>
        )}
      </div>

      {/* Spend summary */}
      <section>
        <h2 className="text-sm font-medium text-neutral-500 mb-3">Spend</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <p className="text-xs text-neutral-500">Budget</p>
            <p className="text-lg font-semibold mt-1">
              {formatUsd(campaign.total_budget_usd)}
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-xs text-neutral-500">Spent</p>
            <p className="text-lg font-semibold mt-1">
              {formatUsd(performance?.total_spend ?? 0)}
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-xs text-neutral-500">Remaining</p>
            <p className="text-lg font-semibold mt-1">
              {formatUsd(performance?.budget_remaining)}
            </p>
          </div>
        </div>
        {spendByType.size > 0 && (
          <div className="mt-4 text-sm">
            <p className="text-xs text-neutral-500 mb-2">By type</p>
            <ul className="space-y-1">
              {[...spendByType.entries()].map(([type, amount]) => (
                <li key={type} className="flex justify-between border-b py-1">
                  <span className="capitalize">{type.replace(/_/g, " ")}</span>
                  <span>{formatUsd(amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-4">
          <SpendForm
            campaignId={id}
            placements={(placements ?? []).map((p) => ({ id: p.id, name: p.name }))}
          />
        </div>
      </section>

      {/* KPI scorecard */}
      <section>
        <h2 className="text-sm font-medium text-neutral-500 mb-3">
          KPI scorecard
        </h2>
        {!campaign.campaign_goals || campaign.campaign_goals.length === 0 ? (
          <p className="text-sm text-neutral-500">No goals set for this campaign.</p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left border-b text-neutral-500">
                <th className="py-2 pr-4 font-medium">Metric</th>
                <th className="py-2 pr-4 font-medium">Current</th>
                <th className="py-2 pr-4 font-medium">Target</th>
                <th className="py-2 pr-4 font-medium">Priority</th>
                <th className="py-2 pr-4 font-medium">On track</th>
              </tr>
            </thead>
            <tbody>
              {campaign.campaign_goals.map((goal) => {
                const value = performance
                  ? getMetricValue(performance, goal.metric)
                  : null;
                const onTrack = isMetricOnTrack(goal.metric, value, goal.target_value);
                return (
                  <tr key={goal.id} className="border-b">
                    <td className="py-2 pr-4 uppercase text-xs font-medium">
                      {goal.metric}
                    </td>
                    <td className="py-2 pr-4">
                      {formatMetricValue(goal.metric, value)}
                    </td>
                    <td className="py-2 pr-4">
                      {formatMetricValue(goal.metric, goal.target_value)}
                    </td>
                    <td className="py-2 pr-4 capitalize">{goal.priority}</td>
                    <td className="py-2 pr-4">
                      {onTrack === null ? (
                        "—"
                      ) : onTrack ? (
                        <span className="text-green-600 dark:text-green-400">
                          On track
                        </span>
                      ) : (
                        <span className="text-red-500">Behind</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {/* Placements */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-neutral-500">Placements</h2>
        </div>
        {!placements || placements.length === 0 ? (
          <p className="text-sm text-neutral-500">No placements yet.</p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left border-b text-neutral-500">
                <th className="py-2 pr-4 font-medium">Name</th>
                <th className="py-2 pr-4 font-medium">Type</th>
                <th className="py-2 pr-4 font-medium">Channel</th>
                <th className="py-2 pr-4 font-medium">Partner</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium">Spend / Budget</th>
              </tr>
            </thead>
            <tbody>
              {placements.map((p) => (
                <tr
                  key={p.id}
                  className="border-b hover:bg-neutral-50 dark:hover:bg-neutral-900"
                >
                  <td className="py-2 pr-4">
                    <Link
                      href={`/campaigns/${id}/placements/${p.id}`}
                      className="font-medium hover:underline"
                    >
                      {p.name}
                    </Link>
                  </td>
                  <td className="py-2 pr-4 capitalize">
                    {p.placement_type.replace(/_/g, " ")}
                  </td>
                  <td className="py-2 pr-4">{p.channels?.name ?? "—"}</td>
                  <td className="py-2 pr-4">{p.partners?.name ?? "—"}</td>
                  <td className="py-2 pr-4">
                    <span className="inline-block px-2 py-0.5 rounded text-xs bg-neutral-100 dark:bg-neutral-800 capitalize">
                      {p.status}
                    </span>
                  </td>
                  <td className="py-2 pr-4">
                    {formatUsd(p.spend_actual_usd)} /{" "}
                    {formatUsd(p.budget_allocated_usd)}
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
