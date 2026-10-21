import { seriousDiseaseRisk, diseaseLabel } from "./diseases.ts";
import { extraStories } from "./events/extra-stories.ts";
import type { Life } from "../types.ts";
import { randomAt } from "../random.ts";
import { gameConfig } from "./config.ts";
import { event, option } from "./events/builders.ts";
export function lifestyleEvent(life: Life) {
  return event(
    life,
    "lifestyle-" + life.age,
    "ทางเลือกที่กลายเป็นนิสัย",
    "สุขภาพระยะยาวเริ่มจากสิ่งเล็ก ๆ การใช้สารอาจเพิ่มระดับการพึ่งพาและทำให้เจ็บป่วย",
    [
      option(
        "เริ่มออกกำลังกาย",
        "สร้างนิสัยออกกำลัง สุขภาพดีขึ้นทุกปี",
        { habit: "exercise", stats: { health: 5 } },
        { icon: "sport" },
      ),
      option(
        "ลองดื่มในงานสังคม",
        "เสีย 1,000 · ดื่มบ่อยกระทบตับและสุขภาพ",
        { habit: "alcohol", stats: { happy: 3 } },
        { cost: 1000, icon: "food" },
      ),
      option(
        "ลองสูบบุหรี่",
        "เสีย 500 · เสี่ยงพึ่งพาและโรคปอด",
        { habit: "smoking" },
        { cost: 500, icon: "danger" },
      ),
      option(
        "ลองสารที่คนรู้จักชวน",
        "เสีย 2,000 · เสี่ยงติดรุนแรง เจ็บป่วยและเสียชีวิต",
        { habit: "drugs", stats: { health: -8 } },
        { cost: 2000, icon: "danger" },
      ),
      option("ปฏิเสธและพักผ่อน", "สุขภาพ +4", { stats: { health: 4 } }, { icon: "moon" }),
      option(
        "เข้ารับการบำบัด",
        "ลดการพึ่งพา 35 และฟื้นสุขภาพ",
        { habit: "rehab", stats: { health: 8 } },
        { icon: "heart", cost: 3000 },
      ),
      option(
        "ขอความช่วยเหลือจากชุมชน",
        "ไม่มีค่าใช้จ่าย ลดการพึ่งพา 35",
        { habit: "rehab" },
        { icon: "users" },
      ),
    ],
    "สุขภาพ",
    "hospital",
  );
}
export function applyHabit(life: Life, habit: string) {
  const h = life.journey!.health;
  if (habit === "exercise") h.exercise = Math.min(5, h.exercise + 2);
  if (habit === "alcohol") h.alcohol = Math.min(100, h.alcohol + 20);
  if (habit === "smoking") h.smoking = Math.min(100, h.smoking + 25);
  if (habit === "drugs") h.addiction = Math.min(100, h.addiction + 35);
  if (habit === "rehab") {
    h.addiction = Math.max(0, h.addiction - 35);
    h.alcohol = Math.max(0, h.alcohol - 30);
    h.smoking = Math.max(0, h.smoking - 30);
  }
}
export function yearlyHealth(life: Life) {
  const h = life.journey!.health,
    cfg = gameConfig.health;
  if (h.addiction) h.addiction = Math.min(100, h.addiction + 6);
  if (h.smoking) h.smoking = Math.min(100, h.smoking + 2);
  if (h.alcohol) h.alcohol = Math.min(100, h.alcohol + 2);
  const damage = Math.floor(h.addiction / 12 + h.smoking / 25 + h.alcohol / 25);
  life.stats.health = Math.max(
    0,
    Math.min(
      100,
      life.stats.health + h.exercise - damage - (life.journey!.homeless ? 4 : 0),
    ),
  );
  if (life.stats.health <= 0) return deathCause(life);
  if (
    h.addiction >= cfg.overdoseThreshold &&
    randomAt(life.seed, life.age, 207) < cfg.overdoseRisk
  )
    return "ภาวะแทรกซ้อนรุนแรงจากการใช้สาร";
  if (
    (life.stats.health < cfg.hospitalThreshold ||
      h.addiction >= cfg.addictionHospitalThreshold) &&
    h.hospitalUntil < life.age
  ) {
    h.disease =
      h.addiction >= cfg.addictionHospitalThreshold
        ? "ภาวะพึ่งพาสารรุนแรง"
        : h.smoking >= 50
          ? "โรคระบบทางเดินหายใจ"
          : h.alcohol >= 50
            ? "โรคตับ"
            : "ภาวะร่างกายอ่อนแอ";
    h.hospitalUntil = life.age + 1;
    const fee = 15000,
      paid = Math.min(life.money, fee);
    life.money -= paid;
    life.journey!.debt += fee - paid;
    life.stats.health = Math.min(100, life.stats.health + 8);
    life.journey!.queue.push({
      id: "hospital-" + life.age,
      title: "ต้องเข้ารักษาตัว",
      text: h.disease + " · ค่ารักษา 15,000 บาท เงินไม่พอเป็นหนี้",
      scene: "hospital",
      effects: "พักงานหนึ่งปี · ยังมีความเสี่ยงเสียชีวิต",
    });
  } else if (h.hospitalUntil < life.age && life.stats.health >= 40 && h.addiction < 50)
    h.disease = null;
  return null;
}
export function mortalityRisk(life: Life) {
  const shifted = life.age + (78 - gameConfig.life.averageLifespan);
  return (
    seriousDiseaseRisk(life) +
    (shifted < 40
      ? gameConfig.life.mortality.under40
      : shifted < 60
        ? gameConfig.life.mortality.under60
        : shifted < 80
          ? gameConfig.life.mortality.under80
          : gameConfig.life.mortality.elderly) +
    (life.stats.health < 20 ? gameConfig.life.mortality.poorHealth : 0) +
    (life.simulation!.economy!.prisonUntil > life.age
      ? gameConfig.life.prisonDeathRisk
      : 0)
  );
}

export function healthEventChance(age: number) {
  return age < 18
    ? 0
    : age < 20
      ? gameConfig.health.eventChance
      : age <= 40
        ? gameConfig.health.eventChance20to40
        : gameConfig.health.eventChanceOver40;
}
export function randomHealthEvent(life: Life) {
  const pool = [lifestyleEvent(life), ...extraStories(life, true)];
  return pool[Math.floor(randomAt(life.seed, life.age, 209) * pool.length)];
}
export function deathCause(life: Life, healthCause: string | null = null) {
  if (healthCause) return healthCause;
  if (life.journey!.health.severe)
    return (
      "ภาวะแทรกซ้อนจาก" +
      diseaseLabel(life) +
      (life.simulation!.economy!.prisonUntil > life.age ? "ระหว่างรับโทษ" : "")
    );
  const h = life.journey!.health,
    prison = life.simulation!.economy!.prisonUntil > life.age;
  if (life.age >= gameConfig.life.maxAge) return "อวัยวะเสื่อมตามวัยชรา";
  if (h.disease && (life.stats.health < 35 || h.hospitalUntil >= life.age))
    return "ภาวะแทรกซ้อนจาก" + h.disease + (prison ? "ระหว่างรับโทษในเรือนจำ" : "");
  if (life.stats.health <= 0)
    return life.journey!.homeless
      ? "ร่างกายอ่อนแอและเจ็บป่วยสะสมระหว่างไร้ที่พัก"
      : h.addiction >= 50
        ? "ร่างกายทรุดจากการพึ่งพาสารสะสม"
        : "ภาวะร่างกายล้มเหลวหลังสุขภาพทรุดหนัก";
  const causes = prison
    ? ["การติดเชื้อรุนแรงระหว่างรับโทษในเรือนจำ", "ภาวะหัวใจหยุดเต้นฉับพลันระหว่างรับโทษ"]
    : life.age >= 80
      ? ["ภาวะแทรกซ้อนจากความเสื่อมของร่างกายในวัยชรา", "หัวใจล้มเหลวในวัยชรา"]
      : life.age < 6
        ? ["ภาวะแทรกซ้อนจากการติดเชื้อรุนแรงในวัยเด็ก", "อุบัติเหตุภายในบ้าน"]
        : [
            "อุบัติเหตุระหว่างเดินทาง",
            "การติดเชื้อรุนแรงเฉียบพลัน",
            "ภาวะหัวใจหยุดเต้นฉับพลัน",
          ];
  return causes[Math.floor(randomAt(life.seed, life.age, 246) * causes.length)];
}
