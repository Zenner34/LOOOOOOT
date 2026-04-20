// Small component that renders a wowhead tooltip link when an item has a
// known wowheadId. Wowhead's tooltips.js (loaded in the root layout) will
// decorate these links with tooltips + icons on the client.

export function WowheadLink({
  name,
  wowheadId,
  className,
}: { name: string; wowheadId?: number | null; className?: string }) {
  if (!wowheadId) return <span className={className}>{name}</span>;
  return (
    <a
      className={className ?? "wh"}
      href={`https://www.wowhead.com/tbc/item=${wowheadId}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {name}
    </a>
  );
}
