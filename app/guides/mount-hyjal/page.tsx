import RaidGuide from "../RaidGuide";
import { MH_BOSSES } from "./bosses";

export const metadata = { title: "Mount Hyjal · Raid Guides" };

export default function MountHyjalPage() {
  return <RaidGuide bosses={MH_BOSSES} ariaLabel="Select a Mount Hyjal boss" raidName="Mount Hyjal" />;
}
