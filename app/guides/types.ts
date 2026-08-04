/* Shared boss-guide shapes used by every raid's data file and by
   app/guides/BossGuide.tsx. */

export type Mechanic = { name: string; effect: string; execution: string[] };
export type RoleNote = { title: string; intro: string; points: string[]; accent?: string };
export type Callout = { tone: "tip" | "danger" | "win"; title: string; body: string };

export type Section = {
  id: string;
  tab: string;
  tag: string;
  title: string;
  subtitle?: string;
  lead?: string[];
  callout?: Callout;
  roles?: RoleNote[];
  mechanics?: Mechanic[];
  dps?: { title: string; intro: string; steps: string[]; note?: string };
  order?: { title?: string; steps: string[] };
  execution?: string[];
  positioning?: string[];
  mistakes?: string[];
  flow?: string[];
  wipes?: string[];
  closing?: string;
};

export type Boss = {
  id: string;
  name: string;
  role: string;   // e.g. "Final Boss", "The Council"
  quote?: string;
  accent: string; // hex, 6-digit
  badges: { label: string; hint?: string; tone?: "accent" }[];
  sections: Section[];
};
