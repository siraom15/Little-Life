import { universityChoices } from "./universities.ts";
import type { Life } from "../../types.ts";
import type { StoryEvent, Skill } from "../types.ts";
import { event, option } from "./builders.ts";
import { randomAt } from "../../random.ts";
import { careerOffer, promotionEvent, retirementEvent } from "./career.ts";
import { relationshipEvent } from "./relationships.ts";
export function milestoneEvent(life: Life): StoryEvent | null {
  const age = life.age,
    j = life.journey!;
  if (age === 6)
    return event(
      life,
      "school",
      "เลือกโรงเรียนแห่งแรก",
      "พื้นฐานครอบครัวช่วยเรื่องทุน แต่เส้นทางที่เลือกจะสร้างทักษะต่างกัน",
      [
        option(
          "โรงเรียนรัฐบาลใกล้บ้าน",
          "ไม่เสียค่าแรกเข้า · วิชาการ +12 · สื่อสาร +5",
          { school: "โรงเรียนรัฐบาล", skills: { academic: 12, communication: 5 } },
          { icon: "book" },
        ),
        option(
          "โรงเรียนเอกชน",
          "20,000 · วิชาการ +20 · สื่อสาร +8",
          { school: "โรงเรียนเอกชน", skills: { academic: 20, communication: 8 } },
          { icon: "book", cost: 20000 },
        ),
        option(
          "โรงเรียนสองภาษา",
          "45,000 · สื่อสาร +25 · วิชาการ +12",
          { school: "โรงเรียนสองภาษา", skills: { communication: 25, academic: 12 } },
          { icon: "language", cost: 45000 },
        ),
        option(
          "โรงเรียนกีฬา",
          "5,000 · สุขภาพ +15 · สื่อสาร +10",
          {
            school: "โรงเรียนกีฬา",
            stats: { health: 15 },
            skills: { communication: 10 },
          },
          { icon: "sport", cost: 5000 },
        ),
        option(
          "โรงเรียนศิลปะ",
          "8,000 · สร้างสรรค์ +25",
          { school: "โรงเรียนศิลปะ", skills: { creative: 25 } },
          { icon: "art", cost: 8000 },
        ),
      ],
      "การศึกษา",
    );
  if (age === 13)
    return event(
      life,
      "track",
      "เลือกสายการเรียน",
      "สิ่งที่ชอบวันนี้ช่วยเพิ่มโอกาสได้งานและเลื่อนตำแหน่งในอนาคต",
      (
        [
          ["วิทย์และเทคโนโลยี", "tech", "code"],
          ["วิชาการและการสอน", "academic", "book"],
          ["ธุรกิจและการค้า", "business", "shop"],
          ["ศิลปะและการออกแบบ", "creative", "art"],
          ["ภาษาและการสื่อสาร", "communication", "language"],
          ["สุขภาพและการดูแล", "care", "heart"],
        ] as [string, Skill, string][]
      ).map(([name, skill, icon]) =>
        option(name, "ทักษะเฉพาะ +22", { skills: { [skill]: 22 } }, { icon }),
      ),
      "การศึกษา",
    );
  if (age === 18)
    return event(
      life,
      "study",
      "หลังเรียนจบ จะไปต่อทางไหน?",
      "ทุนการศึกษาใช้ทั้งความสามารถและดวง หากพลาดยังเตรียมตัวหางานได้",
      [
        ...universityChoices(),
        option(
          "สมัครทุนมหาวิทยาลัย",
          "สำเร็จวิชาการ +25 · พลาดได้วิชาการ +5",
          { school: "มหาวิทยาลัย (ทุน)", skills: { academic: 25 } },
          {
            icon: "book",
            chance: { base: 30, skill: "academic", stat: "skill" },
            failure: { skills: { academic: 5 } },
          },
        ),
        option(
          "เรียนสายเทคโนโลยี",
          "40,000 · เทคโนโลยี +30",
          { school: "วิทยาลัยเทคโนโลยี", skills: { tech: 30 } },
          { icon: "code", cost: 40000 },
        ),
        option(
          "ฝึกงานธุรกิจ",
          "ได้ค่าฝึก 15,000 · ธุรกิจ +18",
          { money: 15000, skills: { business: 18 } },
          { icon: "shop" },
        ),
        option(
          "เรียนศิลปะและสื่อ",
          "25,000 · สร้างสรรค์ +25 · สื่อสาร +8",
          { school: "วิทยาลัยศิลปะ", skills: { creative: 25, communication: 8 } },
          { icon: "art", cost: 25000 },
        ),
        option(
          "ฝึกดูแลผู้คนในชุมชน",
          "ดูแล +22 · สัมพันธ์ +8",
          { skills: { care: 22 }, stats: { social: 8 } },
          { icon: "heart" },
        ),
        option(
          "ทำงานพิเศษและเตรียมสมัครงาน",
          "ได้รับ 20,000 · สื่อสาร +12",
          { money: 20000, skills: { communication: 12 } },
          { icon: "briefcase" },
        ),
      ],
      "การศึกษา",
    );
  if (age === 22) return careerOffer(life, "first");
  if ([24, 34, 44].includes(age) && (!j.partner || j.partner.status === "separated"))
    return relationshipEvent(life, "meet");
  if ([28, 38, 48].includes(age) && j.partner?.status === "dating")
    return relationshipEvent(life, "marry");
  if (
    [30, 34, 38, 42, 46, 50, 54].includes(age) &&
    j.partner?.status === "married" &&
    !j.stopHavingChildren &&
    j.children.length < 5
  )
    return relationshipEvent(life, "child");
  if (
    [26, 29, 33, 37, 41, 45, 49, 53, 57, 63].includes(age) &&
    !life.flags.includes("retired") &&
    age < (j.career ? 65 : 60)
  )
    return j.career && randomAt(life.seed, age, 83) < 0.6
      ? promotionEvent(life)
      : careerOffer(life);
  if (age === 60) return retirementEvent(life);
  return null;
}
