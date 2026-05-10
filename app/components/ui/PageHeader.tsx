import { type ReactNode } from "react";

// Standard page header. Every top-level route should use this so the
// eyebrow/title/subtitle rhythm and bottom hairline are consistent.
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 pb-5 mb-2 border-b hairline">
      <div className="min-w-0">
        {eyebrow && <div className="eyebrow mb-1.5">{eyebrow}</div>}
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-100">{title}</h1>
        {subtitle && (
          <p className="mt-1.5 text-sm text-neutral-400 max-w-2xl leading-relaxed">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </header>
  );
}
