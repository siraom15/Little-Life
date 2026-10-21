import { randomAt } from "../random.ts";
import { gameConfig } from "./config.ts";
import type { Life } from "../types.ts";
import { event, option } from "./events/builders.ts";
export const isImprisoned = (life: Life) =>
  !life.done && (life.simulation?.economy?.prisonUntil || 0) > life.age;
/** Heat 100 is a guaranteed raid; lower heat accumulates exposure over time. */
export function raidChance(life: Life) {
  if (life.done || life.age < 18 || isImprisoned(life)) return 0;
  const heat = life.simulation!.economy!.heat;
  if (heat <= 0) return 0;
  if (heat >= 100) return 1;
  const cfg = gameConfig.dark;
  return Math.min(cfg.maxRaidChance, cfg.baseRaidChance + (life.journey!.policeExposureYears || 0) * cfg.raidIncreasePerYear + heat / 100 * cfg.heatRaidWeight);
}
export function agePoliceExposure(life: Life) {
  if (life.simulation!.economy!.heat <= 0) life.journey!.policeExposureYears = 0;
  else if (!isImprisoned(life)) life.journey!.policeExposureYears = (life.journey!.policeExposureYears || 0) + 1;
}
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
  j.policeExposureYears = 0;
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

/** One possible seizure per sentence; liquidate collateral only when cash is insufficient. */
export function prisonConfiscation(life: Life) {
  const j = life.journey!,
    e = life.simulation!.economy!,
    cfg = gameConfig.prison;
  const marker = "seized-sentence-" + e.prisonUntil;
  if (
    !isImprisoned(life) ||
    life.flags.includes(marker) ||
    randomAt(life.seed, life.age, 260) >= cfg.confiscationChance
  )
    return;
  const properties = [j.house, j.car, ...j.extraCars].filter((a) => a !== null);
  const equity = properties.reduce((sum, a) => sum + Math.max(0, a.price - a.balance), 0);
  const total =
    life.money + e.fund + e.crypto + j.investment.stock + (j.frozenMoney || 0) + equity;
  if (total <= 0) return;
  const percent =
    cfg.minSeizurePercent +
    Math.floor(
      randomAt(life.seed, life.age, 261) *
        (cfg.maxSeizurePercent - cfg.minSeizurePercent + 1),
    );
  const amount = Math.floor((total * percent) / 100);
  let remaining = amount;
  const take = (value: number) => {
    const paid = Math.min(value, remaining);
    remaining -= paid;
    return value - paid;
  };
  life.money = take(life.money);
  j.frozenMoney = take(j.frozenMoney || 0);
  e.fund = take(e.fund);
  e.crypto = take(e.crypto);
  j.investment.stock = take(j.investment.stock);
  let seizedProperties = 0;
  for (const asset of properties) {
    if (remaining <= 0) break;
    const value = Math.max(0, asset.price - asset.balance);
    if (!value) continue;
    // Sale pays the secured loan first; excess is frozen until release.
    j.frozenMoney = (j.frozenMoney || 0) + take(value);
    if (j.house === asset) j.house = null;
    else if (j.car === asset) j.car = null;
    else j.extraCars = j.extraCars.filter((car) => car !== asset);
    seizedProperties++;
  }
  if (!j.car) j.car = j.extraCars.shift() || null;
  life.flags.push(marker);
  const detail =
    "ยึด " +
    percent +
    "% ของทรัพย์สินสุทธิ รวม ฿" +
    amount.toLocaleString("th-TH") +
    (seizedProperties
      ? " · ขายบ้าน/รถ " +
        seizedProperties +
        " รายการ ชำระหนี้ผ่อนก่อน ส่วนเกินพักไว้จนพ้นโทษ"
      : " · หักจากเงินสดและพอร์ตลงทุน");
  j.queue.push({
    id: marker,
    title: "คำสั่งยึดทรัพย์ระหว่างจำคุก",
    scene: "prison",
    text: detail,
    effects: "ไม่มีเงินเดือนหรือผลตอบแทนลงทุนระหว่างรับโทษ",
  });
  life.history.push({
    id: marker,
    age: life.age,
    title: "ถูกยึดทรัพย์",
    choice: "ยึดทรัพย์ " + percent + "%",
    detail,
    category: "ตำรวจ",
    money: life.money,
  });
}
