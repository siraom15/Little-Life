import type { Life } from "../types.ts";
import { gameConfig } from "./config.ts";
export type RetirementWork = keyof typeof gameConfig.retirement.work;
export function retirementWorkTerms(life: Life, mode: RetirementWork) {
  const terms = gameConfig.retirement.work[mode];
  return { ...terms, income: Math.round(life.income * terms.incomeRate) };
}
export function retirementWorkDetail(life: Life, mode: RetirementWork) {
  const t = retirementWorkTerms(life, mode);
  return (
    "รายได้เหลือ " +
    Math.round(t.incomeRate * 100) +
    "% ของเดิม (฿" +
    t.income.toLocaleString("th-TH") +
    "/ปี) · สุขภาพ −" +
    t.healthLossPerYear +
    " ทุกปีที่ทำงาน"
  );
}
export function yearlyRetirementWork(life: Life, wasImprisoned = false) {
  const mode = life.journey!.retirementWork;
  if (
    !mode ||
    wasImprisoned ||
    life.simulation!.economy!.prisonUntil > life.age ||
    life.journey!.health.hospitalUntil >= life.age
  )
    return;
  const loss = gameConfig.retirement.work[mode].healthLossPerYear;
  life.stats.health = Math.max(0, life.stats.health - loss);
  life.history.push({
    id: "retirement-work-" + life.age,
    age: life.age,
    title: "ภาระงานหลังเกษียณ",
    choice: "ทำงานต่ออีกปี",
    detail:
      "สุขภาพ −" +
      loss +
      " จากการทำงาน · รายได้งาน ฿" +
      life.income.toLocaleString("th-TH") +
      "/ปี",
    category: "การงาน",
    money: life.money,
  });
}
