import type { Life, LifeNotice } from "../types.ts";
import { randomAt } from "../random.ts";
import { gameConfig } from "./config.ts";
import { isImprisoned } from "./police.ts";
export const accidentTypes = [
  {
    id: "car",
    name: "รถชนรุนแรงระหว่างเดินทาง",
    minAge: 6,
    detail: "รถที่คุณโดยสารประสบอุบัติเหตุ หน่วยกู้ภัยรีบเข้าช่วยเหลือ",
  },
  {
    id: "bus",
    name: "รถโดยสารพลิกคว่ำ",
    minAge: 6,
    detail: "การเดินทางธรรมดากลายเป็นเหตุฉุกเฉิน ต้องนำส่งโรงพยาบาลทันที",
  },
  {
    id: "collapse",
    name: "โครงสร้างอาคารถล่ม",
    minAge: 18,
    detail: "อาคารใกล้ตัวพังถล่ม เจ้าหน้าที่เร่งค้นหาผู้ติดอยู่ใต้ซาก",
  },
  {
    id: "drowning",
    name: "พลัดตกน้ำเชี่ยว",
    minAge: 6,
    detail: "กระแสน้ำพัดจนไม่สามารถกลับขึ้นฝั่ง ทีมกู้ภัยเข้าช่วยอย่างเร่งด่วน",
  },
  {
    id: "electric",
    name: "ไฟฟ้าลัดวงจรและไฟดูด",
    minAge: 12,
    detail: "อุปกรณ์ไฟฟ้าชำรุดทำให้เกิดเหตุรุนแรง ต้องกู้ชีพและรักษาฉุกเฉิน",
  },
] as const;
export type AccidentKind = (typeof accidentTypes)[number]["id"];
export function eligibleAccidents(life: Life) {
  return accidentTypes.filter((a) => life.age >= a.minAge);
}
/** Pay the bill from liquid wealth first; any shortfall becomes debt. */
function payEmergencyBill(life: Life, bill: number) {
  let remaining = bill;
  const take = (value: number) => {
    const paid = Math.min(value, remaining);
    remaining -= paid;
    return value - paid;
  };
  life.money = take(life.money);
  const e = life.simulation!.economy!,
    j = life.journey!;
  const before = e.fund + e.crypto + j.investment.stock;
  e.fund = take(e.fund);
  e.crypto = take(e.crypto);
  j.investment.stock = take(j.investment.stock);
  j.investment.withdrawn += before - e.fund - e.crypto - j.investment.stock;
  j.debt += remaining;
  return remaining;
}
export function resolveAccident(life: Life, kind: AccidentKind) {
  const event = accidentTypes.find((a) => a.id === kind)!,
    cfg = gameConfig.accidents;
  const fatal = randomAt(life.seed, life.age, 292) < cfg.fatalChance;
  const notice: LifeNotice = {
    id: "accident-" + kind + "-" + life.age,
    title: event.name,
    text: event.detail,
    scene: "hospital",
    accident: kind,
    effects: "",
  };
  const cause = "เสียชีวิตจาก" + event.name;
  if (fatal) {
    notice.text += " · ทีมแพทย์พยายามช่วยแล้ว แต่ไม่สามารถยื้อชีวิตไว้ได้";
    notice.effects = "อุบัติเหตุทำให้การเดินทางของชีวิตสิ้นสุดลง";
  } else {
    const j = life.journey!,
      e = life.simulation!.economy!;
    const rate =
      cfg.minLossRate +
      randomAt(life.seed, life.age, 293) * (cfg.maxLossRate - cfg.minLossRate);
    const bill = Math.max(
      cfg.minimumBill,
      Math.round((life.money + e.fund + e.crypto + j.investment.stock) * rate),
    );
    const debt = payEmergencyBill(life, bill);
    life.stats.health = Math.max(1, life.stats.health - cfg.healthDamage);
    life.stats.happy = Math.max(0, life.stats.happy - 20);
    j.health.hospitalUntil = Math.max(
      j.health.hospitalUntil,
      life.age + cfg.recoveryYears,
    );
    notice.text += " · รอดชีวิตแต่บาดเจ็บสาหัส ต้องพักรักษา " + cfg.recoveryYears + " ปี";
    notice.effects =
      "ค่ารักษา −฿" +
      bill.toLocaleString("th-TH") +
      " · ใช้เงินสดและขายพอร์ต" +
      (debt ? " · หนี้เพิ่ม ฿" + debt.toLocaleString("th-TH") : "") +
      " · หยุดรับเงินเดือนขณะรักษา (ประกันชีวิตไม่จ่ายค่ารักษา)";
  }
  life.history.push({
    id: notice.id,
    age: life.age,
    title: notice.title,
    choice: fatal ? "เสียชีวิต" : "รอดชีวิต บาดเจ็บสาหัส",
    detail: notice.text + " · " + notice.effects,
    category: "อุบัติเหตุ",
    money: life.money,
  });
  return { fatal, cause, notice };
}
export function yearlyAccident(life: Life) {
  if (life.done || isImprisoned(life) || life.journey!.health.hospitalUntil >= life.age)
    return null;
  const pool = eligibleAccidents(life);
  if (
    !pool.length ||
    randomAt(life.seed, life.age, 290) >= gameConfig.accidents.annualChance
  )
    return null;
  return resolveAccident(
    life,
    pool[Math.floor(randomAt(life.seed, life.age, 291) * pool.length)].id,
  );
}
