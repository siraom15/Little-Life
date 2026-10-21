import type { Life } from "../types.ts";
import { randomAt } from "../random.ts";
import { gameConfig } from "./config.ts";
export const investmentAmounts = [1000, 10000, 100000];
export const investmentKeys = ["fund", "stock", "crypto"] as const;
export const investmentActions = investmentKeys.flatMap((k) => [
  ...investmentAmounts.map((n) => "invest:" + k + ":" + n),
  "sell:" + k,
]);
export function portfolioValue(life: Life) {
  return (
    life.simulation!.economy!.fund +
    life.simulation!.economy!.crypto +
    life.journey!.investment.stock
  );
}
export function investmentValue(life: Life, key: string) {
  return key === "stock"
    ? life.journey!.investment.stock
    : life.simulation!.economy![key as "fund" | "crypto"];
}
export function invest(life: Life, id: string) {
  const [action, key, raw] = id.split(":"),
    book = life.journey!.investment;
  const amount = action === "sell" ? investmentValue(life, key) : Number(raw);
  if (action === "sell") {
    life.money += amount;
    book.withdrawn += amount;
  } else {
    life.money -= amount;
    book.deposited += amount;
  }
  const value = action === "sell" ? 0 : investmentValue(life, key) + amount;
  if (key === "stock") book.stock = value;
  else life.simulation!.economy![key as "fund" | "crypto"] = value;
  if (book.startedAt < 0) {
    book.startedAt = life.age;
    book.points = [{ age: life.age, profit: 0 }];
    book.nextReport =
      life.age +
      gameConfig.investment.intervals[
        Math.floor(
          randomAt(life.seed, life.age, 211) * gameConfig.investment.intervals.length,
        )
      ];
  }
  life.history.push({
    id: "invest-" + life.simulation!.actions.length,
    age: life.age,
    title: action === "sell" ? "ขายการลงทุน" : "เพิ่มการลงทุน",
    choice: (action === "sell" ? "+" : "-") + amount.toLocaleString("th-TH"),
    detail: key,
    category: "การเงิน",
    money: life.money,
  });
}
export function yearlyInvestments(life: Life) {
  const book = life.journey!.investment;
  for (const [i, key] of investmentKeys.entries()) {
    const cfg = gameConfig.investment[key],
      value = Math.round(
        investmentValue(life, key) *
          (cfg.min + randomAt(life.seed, life.age, 212 + i) * cfg.range),
      );
    if (key === "stock") book.stock = value;
    else life.simulation!.economy![key] = value;
  }
  if (book.startedAt >= 0)
    book.points.push({
      age: life.age,
      profit: portfolioValue(life) + book.withdrawn - book.deposited,
    });
  if (book.startedAt < 0 || life.age < book.nextReport) return;
  const value = portfolioValue(life),
    profit = value + book.withdrawn - book.deposited,
    percent = book.deposited ? (profit / book.deposited) * 100 : 0;
  book.lastReport =
    "เงินลงทุนสะสม ฿" +
    book.deposited.toLocaleString("th-TH") +
    " · ถอนแล้ว ฿" +
    book.withdrawn.toLocaleString("th-TH") +
    " · พอร์ตปัจจุบัน ฿" +
    value.toLocaleString("th-TH") +
    " · " +
    (profit >= 0 ? "กำไร +" : "ขาดทุน -") +
    Math.abs(profit).toLocaleString("th-TH") +
    " (" +
    percent.toFixed(1) +
    "%) สะสมตั้งแต่อายุ " +
    book.startedAt;
  life.history.push({
    id: "investment-report-" + life.age,
    age: life.age,
    title: "สรุปพอร์ต",
    choice: profit >= 0 ? "กำไร" : "ขาดทุน",
    detail: book.lastReport,
    category: "การเงิน",
    money: life.money,
  });
  book.nextReport =
    life.age +
    gameConfig.investment.intervals[
      Math.floor(
        randomAt(life.seed, life.age, 215) * gameConfig.investment.intervals.length,
      )
    ];
  life.journey!.queue.push({
    id: "investment-report-" + life.age,
    title: "รายงานพอร์ตลงทุน",
    visual: "portfolio",
    chart: structuredClone(book.points),
    text: book.lastReport,
    scene: "gift",
    effects:
      "รายงานถัดไปเมื่ออายุ " + book.nextReport + " ปี · รวมกำไรที่ขายแล้วและยังไม่ขาย",
  });
}
