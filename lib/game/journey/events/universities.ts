import { option } from "./builders.ts";
import type { Skill } from "../types.ts";
export function universityChoices() {
  return (
    [
      ["มหาวิทยาลัยรัฐ · วิศวกรรม", "tech", 30000],
      ["มหาวิทยาลัยรัฐ · แพทยศาสตร์", "care", 50000],
      ["มหาวิทยาลัยรัฐ · นิติศาสตร์", "academic", 25000],
      ["มหาวิทยาลัยเอกชน · บริหารธุรกิจ", "business", 60000],
      ["มหาวิทยาลัยศิลปะ · ออกแบบ", "creative", 35000],
      ["มหาวิทยาลัยนานาชาติ · นิเทศศาสตร์", "communication", 90000],
      ["มหาวิทยาลัยเปิด · เรียนควบงาน", "academic", 6000],
      ["ทุนมหาวิทยาลัยภูมิภาค · ครุศาสตร์", "academic", 0],
    ] as [string, Skill, number][]
  ).map(([name, skill, cost]) =>
    option(
      name,
      "ค่าเรียนในเกม ฿" +
        cost.toLocaleString("th-TH") +
        " · ทักษะเฉพาะ +30 · สำเร็จเมื่อผ่านการคัดเลือก",
      { school: name, skills: { [skill]: 30 } },
      {
        icon: "book",
        cost,
        chance: { base: cost === 0 ? 35 : 55, skill: "academic" },
        failure: { skills: { academic: 5 } },
        failureText: "ยังไม่ได้ที่เรียน ได้ประสบการณ์สอบ +5 ค่าเตรียมสมัครไม่คืน",
      },
    ),
  );
}
