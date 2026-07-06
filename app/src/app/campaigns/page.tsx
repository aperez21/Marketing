import Link from "next/link";
import { requireTenantSession } from "@/lib/tenant";
import { createClient } from "@/lib/supabase/server";
import {
  getMetricValue,
  formatMetricValue,
  formatUsd,
  type CampaignPerformance,
} from "@/lib/kpi/compute";

export default async function CampaignsPage() {
  await requireTenantSession();
  const supabase = await createClient();

  const [{ data: campaigns, error: campaignsError }, { data: performance }] =
    await Promise.all([
      supabase
        .from("campaigns")
        .select(
          "id, name, type, status, total_budget_usd, primary_goal, campaign_goals(metric, target_value, priority)"
        )
        .order("name"),
      supabase.from("campaign_performance").select("*"),
    ]);

  if (campaignsError) {
    return (
      <div className="p-6 text-red-500 text-sm">
        Failed to load campaigns: {campaignsError.message}
      </div>
    );
  }

  const performanceById = new Map<string, CampaignPerformance>(
    (performance ?? [])
      .filter((p): p is CampaignPerformance & { id: string } => p.id !== null)
      .map((p) => [p.id, p])
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold">Campaigns</h1>
      </div>

      {!campaigns || campaigns.length === 0 ? (
        <p className="text-sm text-neutral-500">No campaigns yet.</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b text-neutral-500">
              <th className="py-2 pr-4 font-medium">Name</th>
              <th className="py-2 pr-4 font-medium">Type</th>
              <th className="py-2 pr-4 font-medium">Status</th>
              <th className="py-2 pr-4 font-medium">Spend</th>
              <th className="py-2 pr-4 font-medium">Budget</th>
              <th className="py-2 pr-4 font-medium">Primary KPI</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => {
              const perf = performanceById.get(c.id);
              const primaryGoal = (c.campaign_goals ?? []).find(
                (g) => g.priority === "primary"
              );
              const kpiValue =
                perf && primaryGoal
                  ? getMetricValue(perf, primaryGoal.metric)
                  : null;

              return (
                <tr
                  key={c.id}
                  className="border-b hover:bg-neutral-50 dark:hover:bg-neutral-900"
                >
                  <td className="py-2 pr-4">
                    <Link
                      href={`/campaigns/${c.id}`}
                      className="font-medium hover:underline"
                    >
                      {c.name}
                    </Link>
                  </td>
                  <td className="py-2 pr-4 capitalize">{c.type}</td>
                  <td className="py-2 pr-4">
                    <span className="inline-block px-2 py-0.5 rounded text-xs bg-neutral-100 dark:bg-neutral-800 capitalize">
                      {c.status}
                    </span>
                  </td>
                  <td className="py-2 pr-4">
                    {formatUsd(perf?.total_spend ?? 0)}
                  </td>
                  <td className="py-2 pr-4">
                    {formatUsd(c.total_budget_usd)}
                  </td>
                  <td className="py-2 pr-4">
                    {primaryGoal ? (
                      <span>
                        {formatMetricValue(primaryGoal.metric, kpiValue)}
                        <span className="text-neutral-400">
                          {" "}
                          /{" "}
                          {formatMetricValue(
                            primaryGoal.metric,
                            primaryGoal.target_value
                          )}{" "}
                          target
                        </span>
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
