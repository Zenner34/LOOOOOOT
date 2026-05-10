// Talent-tree icon for a spec, served from Wowhead's icon CDN.
// Spec key -> icon name mapping lives in lib/specs.ts (SPEC_ICON).

import { SPEC_ICON } from "@/lib/specs";
import { Tooltip } from "@/app/components/ui/Tooltip";

const ICON_BASE = "https://wow.zamimg.com/images/wow/icons/medium/";

export function SpecIcon({
  spec,
  size = 18,
  className,
}: { spec: string; size?: number; className?: string }) {
  const key = SPEC_ICON[spec];
  if (!key) return null;
  return (
    <Tooltip content={spec}>
      <img
        src={`${ICON_BASE}${key}.jpg`}
        alt={spec}
        width={size}
        height={size}
        loading="lazy"
        className={`inline-block rounded-[4px] ring-1 ring-white/10 align-[-3px] flex-shrink-0 ${className ?? ""}`}
        style={{ width: size, height: size }}
      />
    </Tooltip>
  );
}
