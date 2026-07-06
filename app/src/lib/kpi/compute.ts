import type { Tables } from "@/lib/supabase/types";

export type CampaignPerformance = Tables<"campaign_performance">;
export type CampaignGoal = Pick<
  Tables<"campaign_goals">,
  "metric" | "target_value" | "priority"
>;

const METRIC_TO_FIELD: Partial<Record<string, keyof CampaignPerformance>> = {
  cac: "cac",
  cpa: "cpa",
  roas: "roas",
  cpm: "cpm",
  cpc: "cpc",
  ctr: "ctr",
  cpe: "cpe",
  signups: "signups",
  purchases: "purchases",
  leads: "leads",
  impressions: "total_impressions",
};

/** Reads the value for a campaign_goals.metric off a campaign_performance row.
 *  Returns null for metrics the view doesn't compute (e.g. engagement_rate). */
export function getMetricValue(
  performance: CampaignPerformance,
  metric: string
): number | null {
  const field = METRIC_TO_FIELD[metric];
  if (!field) return null;
  const value = performance[field];
  return typeof value === "number" ? value : null;
}

export function formatMetricValue(
  metric: string,
  value: number | null
): string {
  if (value === null || value === undefined) return "—";
  switch (metric) {
    case "roas":
      return `${value.toFixed(2)}x`;
    case "ctr":
    case "engagement_rate":
      return `${(value * 100).toFixed(2)}%`;
    case "cac":
    case "cpa":
    case "cpm":
    case "cpc":
    case "cpe":
      return `$${value.toFixed(2)}`;
    default:
      return value.toLocaleString();
  }
}

const LOWER_IS_BETTER = new Set(["cac", "cpa", "cpm", "cpc", "cpe"]);

/** Whether hitting/beating the target means the value should be >= target
 *  (revenue/volume/rate metrics) vs <= target (cost metrics). */
export function isMetricOnTrack(
  metric: string,
  value: number | null,
  target: number
): boolean | null {
  if (value === null) return null;
  return LOWER_IS_BETTER.has(metric) ? value <= target : value >= target;
}

export function formatUsd(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}
