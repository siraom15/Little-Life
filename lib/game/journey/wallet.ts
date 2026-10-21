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
  life.money += amount;
}
