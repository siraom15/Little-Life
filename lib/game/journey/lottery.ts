import type { Life } from "../types.ts";
import { gameConfig } from "./config.ts";
import { randomAt } from "../random.ts";
export const lotteryPercent = (chance: number) =>
  (chance * 100).toLocaleString("th-TH", { maximumFractionDigits: 4 });
export function lotteryChance(life: Life) {
  return Math.min(
    gameConfig.lottery.maxChance,
    gameConfig.lottery.chance +
      (life.simulation!.economy!.lottery?.years || 0) * gameConfig.lottery.annualIncrease,
  );
}
export function yearlyLottery(life: Life) {
  const e = life.simulation!.economy!,
    ticket = e.lottery;
  if (!ticket?.active || ticket.lastDrawAge >= life.age || e.prisonUntil > life.age)
    return;
  const chance = lotteryChance(life);
  ticket.lastDrawAge = life.age;
  ticket.years++;
  const cost = gameConfig.lottery.annualCost,
    paid = Math.min(life.money, cost);
  life.money -= paid;
  life.journey!.debt += cost - paid;
  const won = randomAt(life.seed, life.age, 31) < chance;
  if (won) {
    life.money += gameConfig.lottery.prize;
    if (gameConfig.lottery.resetOnWin) ticket.years = 0;
  }
  const title = won ? "ถูกรางวัลหวย 8 ล้านบาท!" : "ผลหวยประจำปี";
  const detail =
    "โอกาส " +
    lotteryPercent(chance) +
    "% · ค่าหวย −฿" +
    cost +
    (won
      ? " · รับ +฿" + gameConfig.lottery.prize.toLocaleString("th-TH")
      : " · ไม่ถูกรางวัล");
  life.history.push({
    id: "lottery-" + life.age,
    age: life.age,
    title,
    choice: won ? "ถูกรางวัล" : "ไม่ถูกรางวัล",
    detail,
    category: "การเงิน",
    money: life.money,
  });
  if (won)
    life.journey!.queue.push({
      id: "lottery-win-" + life.age,
      title,
      text: detail,
      visual: "lottery",
      scene: "gift",
      effects:
        "รับเงินเข้ากระเป๋าแล้ว · โอกาสงวดถัดไป " +
        lotteryPercent(lotteryChance(life)) +
        "%",
    });
}
