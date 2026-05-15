// Wowhead tooltip helper. The tooltip script (loaded in app/layout.tsx)
// reads anchors and decorates them with item icons + tooltips. We use both
// the href URL pattern AND the explicit data-wowhead attribute so the script
// can resolve the item even when the href fails to parse.
//
// `domain=tbc` forces the lookup against the Burning Crusade Classic item
// database — without it the script can fall back to retail and show the
// wrong stats for items whose IDs differ across expansions. The `tbc`
// value matches the URL slug (wowhead.com/tbc/item=...). The same default
// is also set globally on `window.whTooltips.domain` in app/layout.tsx so
// any link without an explicit domain still resolves against TBC.
//
// We render the icon and the epic-purple text colour ourselves rather than
// relying on Wowhead's iconizeLinks/colorLinks JS post-decoration: that JS
// is async and sometimes runs before / after React hydration, so the look
// was inconsistent. Now both lookups happen at render time via iconFor()
// out of lib/wowhead-ids.json. The Wowhead JS still attaches the on-hover
// item tooltip via the data-wowhead attribute.

import { iconFor } from "./wowhead-lookup";

const ICON_BASE = "https://wow.zamimg.com/images/wow/icons/medium/";
const FALLBACK_ICON = `${ICON_BASE}inv_misc_questionmark.jpg`;

// Canonical WoW epic item colour — used everywhere we render loot names.
const EPIC_COLOR = "#a335ee";

// Compact inline icon + name. Default 16px icon, suitable for table cells
// and inline mentions (Overview "Last item", Player detail timeline, etc).
// Pass `iconSize` to scale up.
export function WowheadLink({
  name,
  wowheadId,
  className,
  iconSize = 16,
}: { name: string; wowheadId?: number | null; className?: string; iconSize?: number }) {
  const iconName = iconFor(name);
  const iconSrc = iconName ? `${ICON_BASE}${iconName.toLowerCase()}.jpg` : FALLBACK_ICON;

  const inner = (
    <>
      <img
        src={iconSrc}
        alt=""
        width={iconSize}
        height={iconSize}
        loading="lazy"
        className="rounded-sm ring-1 ring-purple-500/30 flex-shrink-0"
        style={{ width: iconSize, height: iconSize }}
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_ICON; }}
      />
      <span style={{ color: EPIC_COLOR }} className="font-medium">{name}</span>
    </>
  );

  if (!wowheadId) {
    return (
      <span className={`inline-flex items-center gap-1.5 align-middle ${className ?? ""}`}>
        {inner}
      </span>
    );
  }
  return (
    <a
      className={`inline-flex items-center gap-1.5 align-middle hover:underline decoration-purple-400/60 underline-offset-2 ${className ?? ""}`}
      href={`https://www.wowhead.com/tbc/item=${wowheadId}`}
      data-wowhead={`item=${wowheadId}&domain=tbc`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {inner}
    </a>
  );
}

// Larger card-style display (icon + bigger name) for the loot catalog.
export function WowheadItemCell({
  name,
  wowheadId,
  iconName,
  size = 32,
}: { name: string; wowheadId?: number | null; iconName?: string | null; size?: number }) {
  const resolvedIcon = iconName ?? iconFor(name);
  const src = resolvedIcon ? `${ICON_BASE}${resolvedIcon.toLowerCase()}.jpg` : FALLBACK_ICON;
  if (!wowheadId) {
    return (
      <span className="inline-flex items-center gap-2.5">
        <img
          src={src}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          className="rounded-md ring-1 ring-purple-500/30"
          style={{ width: size, height: size }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_ICON; }}
        />
        <span className="font-medium" style={{ color: EPIC_COLOR }}>{name}</span>
      </span>
    );
  }
  return (
    <a
      href={`https://www.wowhead.com/tbc/item=${wowheadId}`}
      data-wowhead={`item=${wowheadId}&domain=tbc`}
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
        className="rounded-md ring-1 ring-purple-500/40 group-hover:ring-purple-400/70 transition"
        style={{ width: size, height: size }}
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_ICON; }}
      />
      <span className="font-medium group-hover:underline decoration-purple-400/60 underline-offset-2 transition" style={{ color: EPIC_COLOR }}>
        {name}
      </span>
    </a>
  );
}
