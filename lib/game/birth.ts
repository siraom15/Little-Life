import type { Life } from "./types.ts";
import { createLife as createLegacyLife } from "./legacy-engine.ts";
import { randomAt } from "./random.ts";
export function createNewLife(seed: number, name = "นที", origin?: Life): Life {
  const life: Life = origin ? structuredClone(origin) : createLegacyLife(seed, name);
  life.version = 2;
  const birthTrait = ["บ้านอบอุ่น", "เด็กขี้สงสัย", "ครอบครัวนักเดินทาง"][
    Math.floor(randomAt(seed, 0, 1) * 3)
  ];
  life.simulation = {
    sex: randomAt(seed, 0, 2) < 0.5 ? "male" : "female",
    birthTrait,
    notice: null,
    death: null,
    activityAge: -1,
    actions: [],
    ...(origin ? { origin: structuredClone(origin) } : {}),
  };
  if (!origin) {
    if (birthTrait === "บ้านอบอุ่น") {
      life.stats.happy += 8;
      life.stats.social += 5;
    }
    if (birthTrait === "เด็กขี้สงสัย") life.stats.skill += 8;
    if (birthTrait === "ครอบครัวนักเดินทาง") {
      life.stats.social += 8;
      life.stats.happy += 5;
    }
    life.simulation.notice = {
      id: "birth",
      title: "ลืมตาดูโลกแล้ว!",
      text: `${life.name} เกิดที่${life.province} ใน${life.background} จุดเริ่มต้นพิเศษ: ${birthTrait}`,
      scene: "birth",
      effects: "ทุกชีวิตเริ่มจากศูนย์ ค่อย ๆ เติบโตไปด้วยกัน",
    };
  } else if (!life.done)
    life.simulation.notice = {
      id: "migration",
      title: "บทใหม่ของชีวิตเดิม",
      text: "เซฟของคุณเข้าสู่ระบบเวลาและเหตุการณ์สุ่มแล้ว อายุ เงิน และทางเลือกที่ผ่านมาอยู่ครบ",
      scene: "home",
      effects: "ตั้งความเร็วแล้วเริ่มเล่นต่อได้เลย",
    };
  return life;
}
