import { type ReactNode } from "react";

// Horizontal rule with optional centered label chip. Used between
// sub-sections within a single page panel.
export function Divider({ label }: { label?: ReactNode }) {
  if (!label) return <div className="h-px bg-white/[0.06]" />;
  return (
    <div className="flex items-center gap-3" role="separator">
      <div className="h-px flex-1 bg-white/[0.06]" />
      <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">{label}</span>
      <div className="h-px flex-1 bg-white/[0.06]" />
    </div>
  );
}
