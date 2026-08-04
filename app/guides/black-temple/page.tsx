import RaidGuide from "../RaidGuide";
import { BT_BOSSES } from "./bosses";

export const metadata = { title: "Black Temple · Raid Guides" };

export default function BlackTemplePage() {
  return <RaidGuide bosses={BT_BOSSES} ariaLabel="Select a Black Temple boss" />;
}
