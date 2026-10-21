import { gameConfig } from "./config.ts";
import type { Life } from "../types.ts";
import { event, option } from "./events/builders.ts";
export const isImprisoned = (life: Life) =>
  !life.done && (life.simulation?.economy?.prisonUntil || 0) > life.age;
export function policeRaid(life: Life) {
  return event(
    life,
    "raid-" + life.age,
    "ตำรวจเข้าบุกค้น!",
    "ค่าสัมพันธ์และทักษะช่วยเพิ่ม % ต่อรอง ความร้อนจากเส้นทางที่เลือกตามมาถึงตัว ผลของการตัดสินใจนี้อาจทำให้ต้องหยุดชีวิตภายนอกหลายปี",
    [
      option(
        "ยอมรับผิดและเข้ามอบตัว",
        "รับโทษ 2 ปี · ค่าปรับ 30,000",
        { prison: 2, fine: 30000 },
        { icon: "shield" },
      ),
      option(
        "ให้ทนายต่อสู้คดี",
        "ค่าทนาย 20,000 · สำเร็จพ้นคดี · พลาดจำคุก 3 ปี ปรับ 50,000",
        { heat: -100 },
        {
          icon: "book",
          cost: 20000,
          chance: {
            base: 30,
            skill: "academic",
            stat: "social",
            statWeight: gameConfig.dark.negotiationSocialWeight,
          },
          failure: { prison: 3, fine: 50000 },
        },
      ),
      option(
        "ยื่นส่วยให้ตำรวจในเกม",
        "จ่าย 15,000 · สำเร็จลดความร้อน 40 · พลาดจำคุก 5 ปี ปรับ 80,000",
        { heat: -40 },
        {
          icon: "coin",
          cost: 15000,
          chance: {
            base: 20,
            skill: "communication",
            stat: "social",
            statWeight: gameConfig.dark.negotiationSocialWeight,
          },
          failure: { prison: 5, fine: 80000 },
        },
      ),
      option(
        "ร่วมมือในการสอบสวน",
        "รับโทษ 1 ปี · ค่าปรับ 10,000 · สูญเสียงาน",
        { prison: 1, fine: 10000 },
        { icon: "users" },
      ),
      option(
        "ยืนยันความบริสุทธิ์ด้วยหลักฐาน",
        "สำเร็จพ้นคดี · พลาดจำคุก 4 ปี ปรับ 60,000",
        { heat: -100 },
        {
          icon: "flag",
          chance: { base: 15, skill: "academic", stat: "skill" },
          failure: { prison: 4, fine: 60000 },
        },
      ),
    ],
    "ตำรวจ",
  );
}
export function imprison(life: Life, years: number, fine = 0) {
  const j = life.journey!,
    e = life.simulation!.economy!;
  e.prisonUntil = life.age + years;
  e.heat = 0;
  j.career = null;
  life.job = "ผู้ต้องขัง";
  life.income = 0;
  const paid = Math.min(life.money, fine);
  life.money -= paid;
  j.debt += fine - paid;
  j.pending = null;
  life.history.push({
    id: "prison-" + life.age,
    age: life.age,
    title: "เข้ารับโทษจำคุก",
    choice: "จำคุก " + years + " ปี",
    detail: "พ้นโทษเมื่ออายุ " + e.prisonUntil + " ปี · ค่าปรับ " + fine,
    category: "ตำรวจ",
    money: life.money,
  });
}
