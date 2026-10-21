import type { Life } from "../types.ts";
import type { Outcome } from "./types.ts";
import { gameConfig } from "./config.ts";
import { randomAt } from "../random.ts";
import { event, option } from "./events/builders.ts";

// Fictional balance values, not clinical probabilities.
export const diseases = gameConfig.diseases.models;
export function diseaseLabel(life: Life) {
  const d = life.journey!.health.severe;
  return d
    ? diseases[d.id].name + (d.id === "cancer" ? " ระยะ " : " ระดับอาการ ") + d.stage
    : "";
}
export function seriousDiseaseRisk(life: Life) {
  const d = life.journey!.health.severe;
  return d
    ? diseases[d.id].fatality[d.stage - 1] * (d.treatedUntil >= life.age ? 0.65 : 1)
    : 0;
}
export function yearlyDisease(life: Life) {
  const h = life.journey!.health,
    cfg = gameConfig.diseases;
  if (!h.severe) {
    const risk =
      (life.age < 20
        ? cfg.incidenceYoung
        : life.age < 50
          ? cfg.incidenceAdult
          : cfg.incidenceOlder) *
      (1 + (h.smoking + h.alcohol + h.addiction) / 150);
    if (randomAt(life.seed, life.age, 270) >= risk) return;
    const pool = (Object.keys(diseases) as (keyof typeof diseases)[]).filter(
      (id) => id !== "alzheimer" || life.age >= 50,
    );
    const id = pool[Math.floor(randomAt(life.seed, life.age, 271) * pool.length)];
    h.severe = {
      id,
      stage: 1 + Math.floor(randomAt(life.seed, life.age, 272) * 2),
      diagnosedAt: life.age,
      reviewedAt: -1,
      treatedUntil: -1,
    };
    life.history.push({
      id: "diagnosis-" + life.age,
      age: life.age,
      title: "ตรวจพบ" + diseaseLabel(life),
      choice: "เริ่มติดตามอาการ",
      detail: "ต้องเลือกแนวทางดูแล ความเสี่ยงเพิ่มตามความรุนแรง",
      category: "สุขภาพ",
      money: life.money,
    });
    life.journey!.queue.push({
      id: "diagnosis-" + life.age,
      title: "ผลตรวจเปลี่ยนชีวิต",
      text: diseaseLabel(life),
      scene: "hospital",
      effects: "รอเลือกการรักษา · ติดตามอาการและเลือกการรักษา",
    });
  } else if (
    h.severe.stage < 4 &&
    randomAt(life.seed, life.age, 273) <
      (h.severe.treatedUntil >= life.age ? cfg.treatedProgression : cfg.progression)
  ) {
    h.severe.stage++;
    life.journey!.queue.push({
      id: "disease-stage-" + life.age,
      title: "อาการรุนแรงขึ้น",
      text: diseaseLabel(life),
      scene: "hospital",
      effects: "ความเสี่ยงเสียชีวิตเพิ่มขึ้น ต้องติดตามการรักษา",
    });
  }
  const d = h.severe;
  life.stats.health = Math.max(0, life.stats.health - d.stage * 2);
  if (d.stage >= 3) h.hospitalUntil = Math.max(h.hospitalUntil, life.age);
}
export function diseaseEvent(life: Life) {
  const d = life.journey!.health.severe;
  if (
    !d ||
    (d.reviewedAt >= 0 && life.age - d.reviewedAt < gameConfig.diseases.reviewYears)
  )
    return null;
  const model = diseases[d.id],
    base = model.recovery[d.stage - 1];
  const goal = model.canRecover
    ? "โรคสงบและจบการรักษารอบนี้"
    : "ควบคุมอาการ ลดความรุนแรง 1 ระดับ (ไม่ใช่รักษาหาย)";
  const choice = (
    care: NonNullable<Outcome["diseaseCare"]>,
    label: string,
    cost: number,
    bonus: number,
  ) =>
    option(
      label,
      goal + " · ถ้าไม่สำเร็จยังได้ดูแลต่อเนื่อง 2 ปี",
      { diseaseCare: care, diseaseRecovered: true },
      {
        icon: "heart",
        cost,
        chance: { base: Math.min(95, base + bonus) },
        failure: { diseaseCare: care },
        successText: goal,
        failureText: "อาการยังไม่ดีขึ้น แต่เริ่มดูแลต่อเนื่องแล้ว",
      },
    );
  return event(
    life,
    "disease-care-" + life.age,
    "วางแผนรักษา: " + diseaseLabel(life),
    "ความเสี่ยงเสียชีวิตจากโรคปีนี้ประมาณ " +
      Math.round(seriousDiseaseRisk(life) * 100) +
      "% · ประกันชีวิตจ่ายให้คนข้างหลัง ไม่จ่ายค่ารักษา",
    [
      choice("standard", "รักษาตามแผน", 12000 * d.stage, 0),
      choice("intensive", "รักษาเข้มข้น", 30000 * d.stage, 15),
      choice("public", "ใช้สิทธิรักษาภาครัฐ", 0, -12),
      option(
        "ดูแลประคับประคอง",
        "ไม่เสียเงิน · ดูแลต่อเนื่องและความสุข +6 ไม่ทำให้โรคหาย",
        { diseaseCare: "support", stats: { happy: 6 } },
        { icon: "users" },
      ),
      option(
        "ยังไม่เริ่มรักษา",
        "ไม่มีค่าใช้จ่าย · โรคอาจทรุดและเสียชีวิต",
        { diseaseCare: "defer" },
        { icon: "moon" },
      ),
    ],
    "สุขภาพ",
    "hospital",
  );
}
export function applyDiseaseCare(
  life: Life,
  care: NonNullable<Outcome["diseaseCare"]>,
  recovered = false,
) {
  const d = life.journey!.health.severe;
  if (!d) return;
  d.reviewedAt = life.age;
  d.treatedUntil =
    care === "defer" ? life.age - 1 : life.age + gameConfig.diseases.reviewYears;
  const model = diseases[d.id];
  if (recovered) {
    life.stats.health = Math.min(100, life.stats.health + 12);
    if (model.canRecover) {
      life.journey!.health.severe = undefined;
      life.journey!.health.hospitalUntil = life.age - 1;
    } else d.stage = Math.max(1, d.stage - 1);
    life.journey!.queue.push({
      id: "recovery-" + life.age,
      title: model.canRecover ? "ข่าวดี! โรคสงบแล้ว" : "ควบคุมอาการได้ดีขึ้น",
      text:
        model.name +
        (model.canRecover
          ? " จบการรักษารอบนี้ แต่ยังมีโอกาสกลับมาป่วยอีก"
          : " ยังต้องติดตามและรักษาต่อเนื่อง"),
      scene: "hospital",
      effects: "สุขภาพ +12",
    });
  }
}
