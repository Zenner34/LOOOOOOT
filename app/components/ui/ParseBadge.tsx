// WarcraftLogs "Best Perf. Avg" pill, colored on WCL's percentile scale.

export function wclColor(pct: number): string {
  if (pct >= 100) return "#e5cc80"; // legendary (gold)
  if (pct >= 99) return "#e268a8";  // astounding (pink)
  if (pct >= 95) return "#ff8000";  // epic (orange)
  if (pct >= 75) return "#a335ee";  // rare (purple)
  if (pct >= 50) return "#0070dd";  // uncommon (blue)
  if (pct >= 25) return "#1eff00";  // common (green)
  return "#9ca3af";                 // poor (gray)
}

export function ParseBadge({
  best,
  median,
  kills,
  updatedAt,
}: {
  best: number | null | undefined;
  median?: number | null;
  kills?: number | null;
  updatedAt?: string | Date | null;
}) {
  if (best == null) {
    return (
      <span
        title="No logged parses"
        className="inline-flex items-center rounded px-1 text-[10px] font-medium tabular-nums text-neutral-600 border border-white/10"
      >
        —
      </span>
    );
  }
  const shown = Math.round(best);
  const color = wclColor(shown);
  const title = [
    `Best Perf. Avg ${best.toFixed(1)}`,
    median != null ? `Median ${median.toFixed(1)}` : null,
    kills != null ? `${kills} kills logged` : null,
    updatedAt ? `Updated ${new Date(updatedAt).toLocaleDateString()}` : null,
  ]
    .filter(Boolean)
    .join("  ·  ");
  return (
    <span
      title={title}
      style={{ color, borderColor: `${color}66` }}
      className="inline-flex items-center rounded px-1 text-[10px] font-bold tabular-nums border bg-black/30"
    >
      {shown}
    </span>
  );
}
