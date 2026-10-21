import type { Life } from "../types.ts";
import { gameConfig } from "./config.ts";
export function startingWallet(life: Life) {
  const income = Object.values(life.journey!.parents).reduce(
      (sum, p) => sum + p.income,
      0,
    ),
    cfg = gameConfig.family.initialMoney;
  return income < cfg.lowIncomeCeiling
    ? { background: "ครอบครัวรายได้น้อย", money: cfg.low }
    : income < cfg.middleIncomeCeiling
      ? { background: "ครอบครัวชนชั้นกลาง", money: cfg.middle }
      : { background: "ครอบครัวมั่นคง", money: cfg.high };
}
export function payChoice(life: Life, cost: number) {
  life.money -= cost;
}
export function receiveMoney(life: Life, amount: number) {
  if (amount > 0 && life.simulation!.economy!.prisonUntil > life.age) {
    life.journey!.frozenMoney = (life.journey!.frozenMoney || 0) + amount;
    return;
  }
  life.money += amount;
}
