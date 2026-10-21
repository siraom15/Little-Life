import { receiveMoney } from "./wallet.ts";
import { gameConfig } from "./config.ts";
import type { Life } from "../types.ts";
import type { Person } from "./types.ts";
import { randomAt } from "../random.ts";
const fathers = ["สมชาย", "วิชัย", "ธนา", "ประเสริฐ", "กิตติ", "สุรชัย"];
const mothers = ["มาลี", "สุภา", "รัตนา", "วรรณา", "กมล", "จินตนา"];
export function createParents(seed: number) {
  const parent = (names: string[], channel: number): Person => {
    const ageAtBirth = 24 + Math.floor(randomAt(seed, 0, channel) * 15);
    const index = Math.floor(randomAt(seed, 0, channel + 1) * names.length);
    return {
      name: names[index],
      ageAtBirth,
      alive: true,
      savings: Math.floor(
        gameConfig.family.startingSavings * randomAt(seed, 0, channel + 3),
      ),
      job: ["พนักงานบริษัท", "ค้าขาย", "เกษตรกร"][index % 3],
      income: [180000, 240000, 144000][index % 3],
      deathAt:
        Math.floor(
          gameConfig.family.parentDeathAgeMin +
            randomAt(seed, 0, channel + 2) * gameConfig.family.parentDeathAgeRange,
        ) - ageAtBirth,
    };
  };
  return { father: parent(fathers, 110), mother: parent(mothers, 120) };
}
export const familyIncome = (life: Life) =>
  Object.values(life.journey!.parents).reduce(
    (total, parent) => total + (parent.alive ? parent.income : 0),
    0,
  );
export function ageFamily(life: Life) {
  const j = life.journey!;
  for (const [role, parent] of Object.entries(j.parents))
    if (parent.alive && life.age >= parent.deathAt) {
      parent.alive = false;
      inherit(life, parent.name, parent.savings || 0, role === "father" ? 171 : 172);
      parent.savings = 0;
      life.stats.happy = Math.max(0, life.stats.happy - 12);
      const title = (role === "father" ? "พ่อ" : "แม่") + parent.name + "จากไปแล้ว";
      j.queue.push({
        id: "parent-" + role,
        visual: "grave",
        subject: parent.name,
        title,
        text:
          "จากไปเมื่ออายุ " +
          (parent.ageAtBirth + life.age) +
          " ปี รายได้ส่วนของท่านจะไม่รวมอยู่ในรายได้ครอบครัวอีก",
        scene: "home",
        effects: "ความทรงจำยังอยู่ · ความสุข −12",
      });
      life.history.push({
        id: "parent-" + role,
        age: life.age,
        title,
        choice: title,
        detail: "อายุ " + (parent.ageAtBirth + life.age) + " ปี",
        category: "ครอบครัว",
        money: life.money,
      });
    }
  if (j.partner && j.partner.status !== "separated")
    j.partner.bond = Math.max(
      0,
      Math.min(
        100,
        j.partner.bond + (life.stats.happy >= 65 ? 1 : -2) - (j.arrears ? 2 : 0),
      ),
    );
}

export function spouseIncome(life: Life) {
  const p = life.journey!.partner;
  return p?.status === "married" && !p.deceased ? p.income || 0 : 0;
}
export function householdIncome(life: Life) {
  if (life.simulation!.economy!.prisonUntil > life.age) return 0;
  return (
    (life.simulation!.economy!.prisonUntil > life.age ||
    life.journey!.health.hospitalUntil >= life.age
      ? 0
      : life.income) + spouseIncome(life)
  );
}
function inherit(life: Life, name: string, savings: number, channel: number) {
  const amount =
    randomAt(life.seed, life.age, channel) < gameConfig.family.inheritanceChance
      ? Math.max(0, Math.floor(savings))
      : 0;
  receiveMoney(life, amount);
  life.history.push({
    id: "inherit-" + channel + "-" + life.age,
    age: life.age,
    title: "มรดกจาก " + name,
    choice: amount ? "ได้รับ +฿" + amount.toLocaleString("th-TH") : "ไม่มีมรดกเป็นเงิน",
    detail: "รายได้ของผู้จากไปสิ้นสุดลง",
    category: "ครอบครัว",
    money: life.money,
  });
  life.journey!.queue.push({
    visual: "grave",
    subject: name,
    id: "inherit-" + channel + "-" + life.age,
    title: "สิ่งที่ " + name + " ทิ้งไว้",
    text: amount
      ? "มรดก ฿" +
        amount.toLocaleString("th-TH") +
        (life.simulation!.economy!.prisonUntil > life.age
          ? " · พักไว้ รับเมื่อพ้นโทษ"
          : " · รับแล้ว")
      : "ไม่มีมรดกเป็นเงินเหลือให้",
    scene: "home",
    effects: "รายได้ของผู้จากไปสิ้นสุดลง",
  });
}
export function settleFamily(life: Life) {
  const cfg = gameConfig.family,
    j = life.journey!;
  // Parents retain their own finances; never withdraw their cash for player expenses.
  for (const parent of Object.values(j.parents)) {
    if (parent.alive)
      parent.savings =
        (parent.savings || 0) +
        Math.floor(
          Math.max(0, parent.income - cfg.parentLivingCost) * cfg.parentSavingRate,
        );
  }
  const p = j.partner;
  if (p && !p.deceased && p.status !== "separated") {
    const risk =
      cfg.spouseDeathChance +
      (life.age >= 60 ? cfg.spouseOlderDeathChance : 0) +
      (life.age >= 80 ? cfg.spouseElderlyDeathChance : 0);
    if (randomAt(life.seed, life.age, 173) < risk) {
      if (p.status === "married") inherit(life, p.name, p.savings || 0, 174);
      p.deceased = true;
      p.status = "separated";
      p.savings = 0;
      life.flags = life.flags.filter((flag) => flag !== "partner");
      life.stats.happy = Math.max(0, life.stats.happy - 20);
      j.queue.push({
        id: "spouse-death-" + life.age,
        visual: "grave",
        subject: p.name,
        title: p.name + " จากไปแล้ว",
        text: "คนที่เคยอยู่ข้างกันกลายเป็นความทรงจำ รายได้คู่ชีวิตสิ้นสุดลง",
        scene: "home",
        effects: "ความสุข −20",
      });
    }
  }
}
