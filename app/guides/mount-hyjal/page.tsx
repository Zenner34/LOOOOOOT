import { EmptyState } from "@/app/components/ui/EmptyState";
import { Layers } from "@/app/components/ui/Icon";

export const metadata = { title: "Mount Hyjal · Raid Guides" };

const BOSSES = [
  "Rage Winterchill",
  "Anetheron",
  "Kaz'rogal",
  "Azgalor",
  "Archimonde",
];

export default function MountHyjalPage() {
  return (
    <div className="space-y-6">
      <div
        className="relative overflow-hidden rounded-2xl border border-white/10 p-6 sm:p-8"
        style={{
          background:
            "radial-gradient(120% 140% at 15% 0%, rgba(255,157,94,0.14), transparent 55%), " +
            "linear-gradient(180deg, #16110d, #0c0a08)",
        }}
      >
        <div className="mb-2 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ff9d5e]">
          Battle for Mount Hyjal
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-50">Mount Hyjal</h2>
        <p className="mt-1.5 text-sm text-neutral-400 max-w-2xl">
          Hold the line through five waves of the Legion&apos;s assault. Boss handbooks land here as we
          progress into the next phase.
        </p>
      </div>

      <EmptyState
        icon={Layers}
        title="Guides coming soon"
        description="Strategy handbooks for the Mount Hyjal encounters are being written for the next phase. Check back before progression night."
      />

      <div className="panel p-4 sm:p-5">
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400 mb-3">Encounters</h3>
        <ol className="grid gap-2 sm:grid-cols-2">
          {BOSSES.map((b, i) => (
            <li key={b} className="flex items-center gap-3 rounded-lg surface-muted px-3 py-2.5">
              <span className="grid h-6 w-6 place-items-center rounded-md bg-white/5 text-[11px] font-bold text-neutral-400">{i + 1}</span>
              <span className="text-sm font-medium text-neutral-200">{b}</span>
              <span className="ml-auto text-[10px] uppercase tracking-wider text-neutral-600">Soon</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
