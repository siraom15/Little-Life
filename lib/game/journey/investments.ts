import type { Life } from "../types.ts";
import { randomAt } from "../random.ts";
import { gameConfig } from "./config.ts";
export const investmentRiskLevels = ["low", "normal", "high"] as const;
export const investmentAmounts = [1000, 10000, 100000];
export const investmentKeys = ["fund", "stock", "crypto"] as const;
export const investmentActions = investmentKeys.flatMap((k) => [
  ...investmentAmounts.map((n) => "invest:" + k + ":" + n),
  "sell:" + k,
  ...investmentRiskLevels.map((level) => "risk:" + k + ":" + level),
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
  if (action === "risk") {
    (book.risks ??= {})[key as "fund" | "stock" | "crypto"] = raw as
      "low" | "normal" | "high";
    (book.riskChangedAt ??= {})[key as "fund" | "stock" | "crypto"] = life.age;
    life.history.push({
      id: "risk-" + life.simulation!.actions.length,
      age: life.age,
      title: "ปรับความเสี่ยงลงทุน",
      choice: gameConfig.investment.risks[raw as "low" | "normal" | "high"].label,
      detail: key + " · มีผลต่อพอร์ตทั้งหมดในสินทรัพย์นี้",
      category: "การเงิน",
      money: life.money,
    });
    return;
  }
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
    const cfg = gameConfig.investment[key];
    const risk = gameConfig.investment.risks[book.risks?.[key] || "normal"];
    const crash = randomAt(life.seed, life.age, 280 + i) < risk.crashChance;
    const factor = crash
      ? 1 - risk.crashLoss
      : Math.max(
          0,
          1 +
            (cfg.min + randomAt(life.seed, life.age, 212 + i) * cfg.range - 1) *
              risk.spread,
        );
    const value = Math.round(investmentValue(life, key) * factor);
    if (crash && investmentValue(life, key) > 0)
      life.journey!.queue.push({
        id: "market-crash-" + key + "-" + life.age,
        title: "ตลาดร่วงแรง!",
        text:
          key +
          " สูญมูลค่า " +
          Math.round(risk.crashLoss * 100) +
          "% ตามแผน " +
          risk.label,
        scene: "gift",
        visual: "portfolio",
        chart: [
          { age: life.age - 1, profit: 0 },
          { age: life.age, profit: value - investmentValue(life, key) },
        ],
        effects: "มูลค่าที่เสียไปไม่คืนเมื่อเปลี่ยนแผน",
      });
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
