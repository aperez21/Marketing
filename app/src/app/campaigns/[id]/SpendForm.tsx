import { createSpendRecord } from "./actions";

const SPEND_TYPES = [
  "influencer_fee",
  "media_buy",
  "production",
  "event_cost",
  "tool_cost",
  "other",
];

export function SpendForm({
  campaignId,
  placements,
}: {
  campaignId: string;
  placements: { id: string; name: string }[];
}) {
  return (
    <form action={createSpendRecord} className="border rounded-lg p-4 text-sm">
      <input type="hidden" name="campaign_id" value={campaignId} />
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-neutral-500">Amount (USD)</span>
          <input
            name="amount_usd"
            type="number"
            step="0.01"
            min="0"
            required
            className="border rounded px-2 py-1 bg-transparent"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-neutral-500">Type</span>
          <select
            name="spend_type"
            required
            className="border rounded px-2 py-1 bg-transparent"
          >
            {SPEND_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-neutral-500">Paid on</span>
          <input
            name="paid_at"
            type="date"
            required
            className="border rounded px-2 py-1 bg-transparent"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-neutral-500">Placement (optional)</span>
          <select
            name="placement_id"
            className="border rounded px-2 py-1 bg-transparent"
          >
            <option value="">Campaign-level</option>
            {placements.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-neutral-500">Invoice ref</span>
          <input
            name="invoice_ref"
            type="text"
            className="border rounded px-2 py-1 bg-transparent"
          />
        </label>
        <label className="flex flex-col gap-1 col-span-2">
          <span className="text-xs text-neutral-500">Notes</span>
          <input
            name="notes"
            type="text"
            className="border rounded px-2 py-1 bg-transparent"
          />
        </label>
      </div>
      <button
        type="submit"
        className="mt-3 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded px-3 py-1.5 text-sm"
      >
        Add spend
      </button>
    </form>
  );
}
