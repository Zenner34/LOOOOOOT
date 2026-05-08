// Official WoW class icons served from Wowhead's CDN.
// Stable URL pattern: classicon_<lowercase-class>.jpg

import { CLASS_COLOR } from "@/lib/specs";

const ICON_BASE = "https://wow.zamimg.com/images/wow/icons/medium/classicon_";

const CLASS_KEY: Record<string, string> = {
  Warrior: "warrior",
  Paladin: "paladin",
  Hunter: "hunter",
  Rogue: "rogue",
  Priest: "priest",
  Shaman: "shaman",
  Mage: "mage",
  Warlock: "warlock",
  Druid: "druid",
};

export function ClassIcon({
  cls,
  size = 20,
  className,
}: { cls: string; size?: number; className?: string }) {
  const key = CLASS_KEY[cls];
  if (!key) return null;
  return (
    <img
      src={`${ICON_BASE}${key}.jpg`}
      alt={cls}
      title={cls}
      width={size}
      height={size}
      className={`inline-block rounded-[4px] ring-1 ring-white/10 align-[-3px] ${className ?? ""}`}
      style={{ width: size, height: size }}
      loading="lazy"
    />
  );
}

export function ClassName({
  name,
  cls,
  iconSize = 16,
  className,
}: { name: string; cls: string; iconSize?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className ?? ""}`}>
      <ClassIcon cls={cls} size={iconSize} />
      <span style={{ color: CLASS_COLOR[cls] ?? "#fff" }} className="font-medium">{name}</span>
    </span>
  );
}
