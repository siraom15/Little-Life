import { offeredSalary } from "./salary.ts";
import { educationBonus } from "./education.ts";
import type { Life } from "../types.ts";
import { gameConfig } from "./config.ts";
import { careerIncome, overseasJobs } from "./catalog.ts";
import { event, option } from "./events/builders.ts";
export const countryNames = Object.keys(
  gameConfig.abroad.countries,
) as (keyof typeof gameConfig.abroad.countries)[];
export function abroadEvent(life: Life) {
  const choices = countryNames
    .filter((country) => country !== life.location)
    .map((country) => {
      const config = gameConfig.abroad.countries[country],
        job = overseasJobs.find((j) => j.id === config.job)!;
      return option(
        "ย้ายไป" + country + " · " + job.label,
        "เตรียมย้าย ฿" +
          config.moveCost.toLocaleString("th-TH") +
          " · รายได้ ฿" +
          offeredSalary(life, job.id, country).toLocaleString("th-TH") +
          "/ปี · ค่าครองชีพเพิ่ม ฿" +
          config.livingCost.toLocaleString("th-TH") +
          "/ปี",
        { location: country, career: job.id },
        {
          icon: "plane",
          cost: config.moveCost,
          chance: {
            base: 40 + educationBonus(life, job.id),
            skill: job.skill,
            stat: "social",
          },
          failure: { skills: { communication: 3 } },
          failureText: "วีซ่าหรือข้อเสนองานไม่ผ่าน ยังอยู่ที่เดิม ค่าเตรียมตัวไม่คืน",
        },
      );
    });
  choices.push(
    option(
      "เตรียมภาษาและทักษะก่อน",
      "สื่อสาร +6 ยังไม่ย้าย",
      { skills: { communication: 6 } },
      { icon: "language" },
    ),
    option(
      "อยู่กับคนใกล้ตัว",
      "ความสุข +5 ยังไม่ย้าย",
      { stats: { happy: 5 } },
      { icon: "home" },
    ),
  );
  if (countryNames.includes(life.location as (typeof countryNames)[number]))
    choices.push(
      option(
        "กลับมาทำงานที่ไทย",
        "ค่าเดินทาง 20,000 · เริ่มงานช่างเทคนิคในไทย",
        { location: "ไทย", career: "technician" },
        { cost: 20000, icon: "plane" },
      ),
    );
  return event(
    life,
    "abroad-" + life.age,
    "โอกาสเริ่มต้นในต่างแดน",
    "ข้อเสนองานมาพร้อมการย้ายที่อยู่ เลือกจุดหมายที่อยากใช้ชีวิต",
    choices,
    "ต่างประเทศ",
    "travel",
  );
}
