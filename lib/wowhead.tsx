// Wowhead tooltip helper. The tooltip script (loaded in app/layout.tsx)
// reads anchors and decorates them with item icons + tooltips. We use both
// the href URL pattern AND the explicit data-wowhead attribute so the script
// can resolve the item even when the href fails to parse.
//
// `domain=tbc-classic` forces the lookup against the Burning Crusade Classic
// item database — without it the script can fall back to retail and show
// the wrong stats for items whose IDs differ across expansions.

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
      data-wowhead={`item=${wowheadId}&domain=tbc-classic`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {name}
    </a>
  );
}

const ICON_BASE = "https://wow.zamimg.com/images/wow/icons/medium/";
// fallback icon URL if we don't know the actual icon name
const FALLBACK_ICON = "https://wow.zamimg.com/images/wow/icons/medium/inv_misc_questionmark.jpg";

export function WowheadItemCell({
  name,
  wowheadId,
  iconName,
  size = 32,
}: { name: string; wowheadId?: number | null; iconName?: string | null; size?: number }) {
  const src = iconName ? `${ICON_BASE}${iconName.toLowerCase()}.jpg` : FALLBACK_ICON;
  if (!wowheadId) {
    return (
      <span className="inline-flex items-center gap-2.5">
        <span className="rounded-md bg-black/30 ring-1 ring-white/10" style={{ width: size, height: size }} />
        <span className="font-medium text-neutral-300">{name}</span>
      </span>
    );
  }
  return (
    <a
      href={`https://www.wowhead.com/tbc/item=${wowheadId}`}
      data-wowhead={`item=${wowheadId}&domain=tbc-classic`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2.5 group"
    >
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        className="rounded-md ring-1 ring-white/10 group-hover:ring-amber-300/50 transition"
        style={{ width: size, height: size }}
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_ICON; }}
      />
      <span className="font-medium text-amber-200 group-hover:text-amber-100 transition">{name}</span>
    </a>
  );
}
