import { ArrowDown, ArrowUp, Minus } from "lucide-react";

// Tiny inline +/- delta pill consumed by StatCard.
// Positive renders emerald, negative vermillion, zero muted.
export function Trend({ delta, suffix = "" }: { delta: number; suffix?: string }) {
  if (delta === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-neutral-500 tabular-nums">
        <Minus size={11} />
        0{suffix}
      </span>
    );
  }
  const positive = delta > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs tabular-nums ${
        positive ? "text-emerald-300" : "text-vermillion-300"
      }`}
    >
      {positive ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
      {Math.abs(delta)}
      {suffix}
    </span>
  );
}
