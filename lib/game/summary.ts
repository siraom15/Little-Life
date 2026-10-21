import { events } from "./events.ts";
import type { Life } from "./types.ts";
const milestoneIds = new Set(events.map((event) => event.id));
export function decisionCount(life: Life) {
  if (life.version === 8)
    return (
      life.simulation?.actions.filter((action) => action.type === "choice").length || 0
    );
  return life.history.filter((entry) => milestoneIds.has(entry.id)).length;
}
export function achievements(life: Life) {
  return [
    {
      label: "นักลงทุน",
      earned:
        (life.simulation?.economy?.fund || 0) +
          (life.simulation?.economy?.crypto || 0) +
          (life.journey?.investment.stock || 0) >
        0,
    },
    {
      label: "เสียงจากชุมชน",
      earned:
        life.journey?.careerHistory.includes("politician") ||
        life.flags.includes("politician"),
    },
    {
      label: "ห่วงใยคนข้างหลัง",
      earned: (life.simulation?.economy?.beneficiaryPayout || 0) > 0,
    },
    { label: "นักเดินทาง", earned: life.flags.includes("migrant") },
    {
      label: "บ้านหลังแรก",
      earned: !!life.journey?.house || life.flags.includes("house"),
    },
    { label: "สายความรู้", earned: life.stats.skill >= 80 },
    { label: "คนสำคัญของใครสักคน", earned: life.flags.includes("partner") },
    { label: "ครอบครัวอบอุ่น", earned: life.flags.includes("child") },
    { label: "ความทรงจำ 80 ปี", earned: life.age >= 80 },
  ]
    .filter((item) => item.earned)
    .map((item) => item.label);
}
