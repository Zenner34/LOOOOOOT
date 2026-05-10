import { type ReactNode } from "react";

// In-page section break. Use when a single page has multiple grouped
// regions of content that need their own header.
export function SectionTitle({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-3 flex-wrap mb-3">
      <div className="min-w-0">
        {eyebrow && <div className="eyebrow mb-1">{eyebrow}</div>}
        <h2 className="text-base font-semibold tracking-tight text-neutral-100">{title}</h2>
        {description && <p className="text-xs text-neutral-500 mt-0.5">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
