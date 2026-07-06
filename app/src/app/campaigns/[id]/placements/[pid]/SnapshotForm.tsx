import { createSnapshot } from "./actions";

const FIELDS = [
  ["impressions", "Impressions"],
  ["reach", "Reach"],
  ["views", "Views"],
  ["clicks", "Clicks"],
  ["link_clicks", "Link clicks"],
  ["likes", "Likes"],
  ["comments", "Comments"],
  ["shares", "Shares"],
  ["saves", "Saves"],
] as const;

export function SnapshotForm({
  campaignId,
  placementId,
}: {
  campaignId: string;
  placementId: string;
}) {
  return (
    <form action={createSnapshot} className="border rounded-lg p-4 text-sm">
      <input type="hidden" name="campaign_id" value={campaignId} />
      <input type="hidden" name="placement_id" value={placementId} />
      <div className="grid grid-cols-3 gap-3">
        {FIELDS.map(([name, label]) => (
          <label key={name} className="flex flex-col gap-1">
            <span className="text-xs text-neutral-500">{label}</span>
            <input
              name={name}
              type="number"
              min="0"
              className="border rounded px-2 py-1 bg-transparent"
            />
          </label>
        ))}
      </div>
      <p className="text-xs text-neutral-500 mt-2">
        Engagement rate is computed automatically from reach + engagements.
      </p>
      <button
        type="submit"
        className="mt-3 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded px-3 py-1.5 text-sm"
      >
        Add snapshot
      </button>
    </form>
  );
}
