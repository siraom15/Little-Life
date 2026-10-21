import {
  investmentActions,
  investmentValue,
  invest,
  yearlyInvestments,
} from "./investments.ts";
import { gameConfig } from "./config.ts";
import { settleFamily, householdIncome } from "./family.ts";
import {
  assetActions,
  assetLocked,
  purchaseAsset,
  assetMaintenance,
  settleAssets,
} from "./assets.ts";
import type { Life } from "../types.ts";
import {
  applyVenture,
  ventureLockedReason,
  settleDeathBenefit,
  emptyEconomy,
} from "../economy.ts";
import { policyTerms } from "../ventures.ts";
import { randomAt } from "../random.ts";
import { familyIncome } from "./family.ts";
export const financeIds = [
  ...assetActions,
  ...investmentActions,
  "rent-room",
  "fund",
  "crypto",
  "sell-fund",
  "sell-crypto",
  "lottery",
  "basic",
  "family",
  "cancel-policy",
  "loan",
  "repay",
  "repay-all",
];
export function annualExpenses(life: Life) {
  if (!life.journey!.hasWorked && !life.flags.includes("retired"))
    return assetMaintenance(life);
  return Math.max(
    0,
    (!life.journey!.hasWorked && !life.flags.includes("retired")
      ? 0
      : life.journey!.homeless
        ? 60000
        : 120000) +
      (life.journey!.hasWorked || life.flags.includes("retired")
        ? life.journey!.children.filter(
            (child) => life.age - child.bornAt < gameConfig.family.supportUntil,
          ).length * gameConfig.family.childCost
        : 0) +
      (life.journey!.partner?.status === "married"
        ? gameConfig.family.spouseLivingCost
        : 0) +
      (life.location === "ญี่ปุ่น" ? 60000 : 0) +
      assetMaintenance(life) -
      (life.journey!.house && life.journey!.hasWorked ? 36000 : 0),
  );
}
export function debtPayment(debt: number) {
  return Math.min(Math.ceil(debt * 1.18), Math.max(6000, Math.ceil(debt * 1.18 * 0.2)));
}
export function logFinance(life: Life, title: string, detail: string) {
  life.history.push({
    id: "finance-" + life.age + "-" + life.history.length,
    age: life.age,
    title,
    choice: title,
    detail,
    category: "การเงิน",
    money: life.money,
  });
}
export function bankrupt(life: Life) {
  const j = life.journey!,
    e = life.simulation!.economy!;
  life.money = 0;
  j.frozenMoney = 0;
  j.homeless = true;
  j.extraCars = [];
  j.investment.stock = 0;
  e.fund = 0;
  e.crypto = 0;
  j.house = null;
  j.car = null;
  j.debt = 0;
  j.arrears = 0;
  j.creditUntil = life.age + 8;
  life.stats.happy = Math.max(0, life.stats.happy - 20);
  life.flags.push("bankrupt");
  logFinance(
    life,
    "ล้มละลาย",
    "ยึดบ้าน รถ พอร์ต และเงินสดทั้งหมด ล้างหนี้ ห้ามกู้ถึงอายุ " + j.creditUntil + " ปี",
  );
  j.queue.push({
    id: "bankrupt-" + life.age,
    title: "เริ่มต้นใหม่หลังล้มละลาย",
    text:
      "เงินสดถูกยึดทั้งหมด คุณต้องอยู่ข้างถนน บ้าน รถ และพอร์ตถูกยึด หนี้ถูกล้าง และกู้ไม่ได้ถึงอายุ " +
      j.creditUntil +
      " ปี ยังทำงานและค่อย ๆ ตั้งหลักใหม่ได้",
    scene: "home",
    effects: "ความสุข −20 · รายได้จากงานยังคงอยู่",
  });
}
export function financeLocked(life: Life, id: string): string | null {
  if (
    !financeIds.includes(id) ||
    life.done ||
    life.simulation?.notice ||
    life.journey?.pending
  )
    return "รอเหตุการณ์ปัจจุบันจบก่อน";
  if (assetActions.includes(id)) return assetLocked(life, id);
  const j = life.journey!;
  if (life.age < 18) return "เริ่มใช้เมื่ออายุ 18 ปี";
  if ((life.simulation!.economy?.prisonUntil || 0) > life.age)
    return "ทำรายการไม่ได้ระหว่างรับโทษ";
  if (id === "rent-room")
    return !j.homeless ? "มีที่พักแล้ว" : life.money < 12000 ? "ต้องมีเงิน 12,000" : "";
  if (investmentActions.includes(id) && !j.hasWorked) return "เริ่มลงทุนได้หลังมีงานแรก";
  if (investmentActions.includes(id)) {
    const [action, key, raw] = id.split(":");
    return action === "sell"
      ? investmentValue(life, key) <= 0
        ? "ยังไม่มีสินทรัพย์"
        : null
      : life.money < Number(raw)
        ? "เงินไม่พอ"
        : null;
  }
  if (id === "loan") {
    if (j.creditUntil > life.age)
      return "กู้ได้อีกครั้งเมื่ออายุ " + j.creditUntil + " ปี";
    if (j.lastBorrowAge === life.age) return "กู้ได้ปีละครั้ง";
    if (j.debt + 50000 > Math.max(50000, Math.min(200000, life.income * 0.6)))
      return "เกินวงเงินตามรายได้";
    return null;
  }
  if (id === "repay" || id === "repay-all")
    return j.debt <= 0
      ? "ไม่มีหนี้"
      : life.money < (id === "repay" ? Math.min(10000, j.debt) : j.debt)
        ? "เงินสดไม่พอ"
        : null;
  const e = life.simulation!.economy!;
  if ((id === "fund" || id === "crypto") && !j.hasWorked)
    return "เริ่มลงทุนได้หลังมีงานแรก";
  if (id === "fund" || id === "crypto")
    return life.money < (id === "fund" ? 10000 : 5000) ? "เงินไม่พอ" : null;
  if (id === "sell-fund" || id === "sell-crypto")
    return e[id === "sell-fund" ? "fund" : "crypto"] <= 0 ? "ยังไม่มีสินทรัพย์นี้" : null;
  return ventureLockedReason(life, id);
}
export function financeAction(life: Life, id: string) {
  if (financeLocked(life, id)) return false;
  if (assetActions.includes(id)) return purchaseAsset(life, id);
  const j = life.journey!;
  const e = life.simulation!.economy!;
  if (id === "rent-room") {
    life.money -= 12000;
    j.homeless = false;
    logFinance(life, "กลับมามีที่พัก", "จ่ายค่าเริ่มเช่า 12,000 บาท");
    return true;
  }
  if (investmentActions.includes(id)) {
    invest(life, id);
    return true;
  }
  if (["fund", "crypto", "sell-fund", "sell-crypto"].includes(id)) {
    invest(
      life,
      id.startsWith("sell")
        ? "sell:" + id.slice(5)
        : "invest:" + id + ":" + (id === "fund" ? 10000 : 5000),
    );
    return true;
  }
  if (id === "loan") {
    j.debt += 50000;
    life.money += 50000;
    j.lastBorrowAge = life.age;
    logFinance(
      life,
      "กู้เงิน 50,000",
      "ดอกเบี้ย 18% ต่อปี ยอดขั้นต่ำปีหน้า " + debtPayment(j.debt),
    );
  } else if (id === "repay" || id === "repay-all") {
    const amount = id === "repay" ? Math.min(10000, j.debt) : j.debt;
    life.money -= amount;
    j.debt -= amount;
    if (j.debt === 0) j.arrears = 0;
    logFinance(life, "ชำระหนี้", amount.toLocaleString("th-TH") + " บาท");
  } else return applyVenture(life, id);
  life.simulation!.notice = {
    id: "finance-result-" + life.age,
    title: "ทำรายการแล้ว",
    text: life.history.at(-1)!.choice,
    scene: "gift",
    effects: "ยอดหนี้ " + j.debt.toLocaleString("th-TH") + " บาท",
  };
  return true;
}
export function yearlyFinance(
  life: Life,
  imprisoned = life.simulation!.economy!.prisonUntil > life.age,
) {
  const j = life.journey!,
    e = (life.simulation!.economy ??= emptyEconomy());
  settleFamily(life);
  if (life.age >= 18) {
    const income = !imprisoned && life.journey!.hasWorked ? householdIncome(life) : 0;
    life.money += income - annualExpenses(life);
  }
  if (!imprisoned) yearlyInvestments(life);
  if (e.policy !== "none" && e.insuredAt < life.age) {
    const premium = policyTerms[e.policy].premium;
    if (life.money >= premium) life.money -= premium;
    else {
      e.policy = "none";
      j.queue.push({
        id: "policy-lapse-" + life.age,
        title: "ประกันขาดต่อ",
        text: "เงินสดไม่พอจ่ายเบี้ย ความคุ้มครองสิ้นสุดก่อนเหตุการณ์ปีนี้",
        scene: "home",
        effects: "ตรวจแผนใหม่ได้ในหน้าการเงิน",
      });
    }
  }
  if (life.money < 0) {
    j.debt += -life.money;
    life.money = 0;
    logFinance(
      life,
      "ขาดดุลกลายเป็นหนี้",
      "รายจ่ายเกินเงินที่มี ยอดขาดดุลรวมเป็นหนี้ดอกเบี้ย 18%",
    );
  }
  settleAssets(life);
  if (j.debt > 0 && life.age >= gameConfig.family.supportUntil) {
    j.debt = Math.ceil(j.debt * 1.18);
    const due = Math.min(j.debt, Math.max(6000, Math.ceil(j.debt * 0.2)));
    const paid = Math.min(Math.max(0, life.money), due);
    life.money -= paid;
    j.debt -= paid;
    j.arrears = paid < due ? j.arrears + 1 : 0;
    if (j.arrears >= 3 || j.debt > 350000) bankrupt(life);
  }
}
export { settleDeathBenefit };
