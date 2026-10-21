import { educationBonus } from "./education.ts";
import type { Life } from "../types.ts";
import type { StoryChoice } from "./types.ts";
import { skillLabels } from "./catalog.ts";
export function successChance(life: Life, choice: StoryChoice) {
  if (!choice.chance) return 100;
  const rule = choice.chance,
    j = life.journey!;
  return Math.max(
    5,
    Math.min(
      95,
      Math.round(
        rule.base +
          (choice.success.career ? educationBonus(life, choice.success.career) : 0) +
          (rule.skill ? j.skills[rule.skill] * 0.35 : 0) +
          (rule.stat ? life.stats[rule.stat] * (rule.statWeight ?? 0.15) : 0) +
          (j.luck - 50) * 0.3 +
          (["marry", "child", "repair"].includes(choice.success.relationship || "") &&
          j.partner
            ? (j.partner.bond - 50) * 0.15
            : 0),
      ),
    ),
  );
}
export function chanceExplanation(choice: StoryChoice) {
  if (!choice.chance) return "ผลแน่นอน ไม่มีการสุ่ม";
  const names = {
    health: "สุขภาพ",
    happy: "ความสุข",
    skill: "ทักษะรวม",
    social: "ความสัมพันธ์",
  };
  return [
    choice.chance.skill ? skillLabels[choice.chance.skill] : null,
    choice.chance.stat ? names[choice.chance.stat] : null,
    ["marry", "child", "repair"].includes(choice.success.relationship || "")
      ? "ความผูกพัน"
      : null,
    "ดวงปีนี้",
  ]
    .filter(Boolean)
    .join(" + ");
}
