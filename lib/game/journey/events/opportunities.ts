import type { Life } from "../../types.ts";
import { event, option } from "./builders.ts";
export function opportunities(life: Life) {
  const list = [
    event(
      life,
      "exam-" + life.age,
      "โจทย์ยากที่อยากเอาชนะ",
      "ชุมชนจัดการแข่งขันความรู้ คุณเลือกวิธีเตรียมตัวได้",
      [
        option(
          "ลงสนามแข่งทันที",
          "สำเร็จรับ 5,000 · วิชาการ +6",
          { money: 5000, skills: { academic: 6 } },
          {
            icon: "book",
            chance: { base: 30, skill: "academic", stat: "happy" },
            failure: { skills: { academic: 2 } },
          },
        ),
        option(
          "ลงคอร์สเตรียมตัว",
          "จ่าย 1,000 · วิชาการ +10",
          { skills: { academic: 10 } },
          { icon: "book", cost: 1000 },
        ),
        option(
          "ติวกับเพื่อน",
          "วิชาการ +5 · สัมพันธ์ +4",
          { skills: { academic: 5 }, stats: { social: 4 } },
          { icon: "users" },
        ),
        option(
          "ช่วยดูแลผู้เข้าแข่งขัน",
          "ดูแล +6 · สัมพันธ์ +3",
          { skills: { care: 6 }, stats: { social: 3 } },
          { icon: "heart" },
        ),
        option(
          "ขอพักจากการแข่งขัน",
          "สุข +5 · สุขภาพ +2",
          { stats: { happy: 5, health: 2 } },
          { icon: "moon" },
        ),
      ],
      "การเรียนรู้",
    ),
    event(
      life,
      "wallet-" + life.age,
      "พบกระเป๋าสตางค์ตกอยู่",
      "เงินในกระเป๋าอาจช่วยคุณได้ แต่เจ้าของก็กำลังตามหา",
      [
        option(
          "ตามหาเจ้าของ",
          "สำเร็จได้รับสินน้ำใจ 3,000 · สัมพันธ์ +6",
          { money: 3000, stats: { social: 6 } },
          { icon: "users", chance: { base: 45, skill: "communication", stat: "social" } },
        ),
        option(
          "ส่งมอบจุดรับของหาย",
          "สัมพันธ์ +5 · สุข +3",
          { stats: { social: 5, happy: 3 } },
          { icon: "shield" },
        ),
        option(
          "เก็บเงินไว้เอง",
          "ได้เงิน 5,000 · ความเสี่ยงคดี +10",
          { money: 5000, heat: 10, stats: { social: -4 } },
          { icon: "danger" },
        ),
        option(
          "ชวนเพื่อนช่วยติดต่อ",
          "สื่อสาร +5 · สัมพันธ์ +3",
          { skills: { communication: 5 }, stats: { social: 3 } },
          { icon: "users" },
        ),
        option("แจ้งคนดูแลพื้นที่", "สุข +3", { stats: { happy: 3 } }, { icon: "flag" }),
      ],
      "สังคม",
      "gift",
    ),
  ];
  if (life.age >= 18)
    list.push(
      event(
        life,
        "flood-" + life.age,
        "ฝนหนักกระทบที่พัก",
        "ของในบ้านเริ่มเสียหาย เลือกวิธีรับมือก่อนน้ำมาเพิ่ม",
        [
          option(
            "จ้างช่างซ่อมทันที",
            "จ่าย 8,000 · สุข +6",
            { stats: { happy: 6 } },
            { icon: "tool", cost: 8000 },
          ),
          option(
            "ซ่อมเอง",
            "สำเร็จไม่เสียเงิน · พลาดเสีย 4,000",
            { skills: { tech: 6 } },
            {
              icon: "tool",
              chance: { base: 35, skill: "tech", stat: "health" },
              failure: { money: -4000, stats: { happy: -4 } },
            },
          ),
          option(
            "ขอแรงเพื่อนบ้าน",
            "สำเร็จสัมพันธ์ +8 · พลาดสุข −5",
            { stats: { social: 8 } },
            {
              icon: "users",
              chance: { base: 45, skill: "communication", stat: "social" },
              failure: { stats: { happy: -5 } },
            },
          ),
          option(
            "ย้ายของไปพักชั่วคราว",
            "จ่าย 2,000 · สุขภาพ +3",
            { stats: { health: 3 } },
            { icon: "home", cost: 2000 },
          ),
          option(
            "เก็บเฉพาะของสำคัญ",
            "เสียเงิน 1,000 · สุข −3",
            { money: -1000, stats: { happy: -3 } },
            { icon: "wallet" },
          ),
        ],
        "ที่อยู่อาศัย",
      ),
    );
  if (life.age >= 25 && life.age < 65)
    list.push(
      event(
        life,
        "politics-" + life.age,
        "ชุมชนชวนลงสมัครการเมือง",
        "โอกาสใหม่ในงานสาธารณะ ความสัมพันธ์และการสื่อสารช่วยเพิ่มคะแนนเสียง",
        [
          option(
            "ลงสมัครตัวแทนท้องถิ่น",
            "หาเสียง 30,000 · ชนะเปลี่ยนอาชีพ รายได้ 360,000/ปี",
            { career: "politician", stats: { social: 10 } },
            {
              icon: "flag",
              cost: 30000,
              chance: { base: 20, skill: "communication", stat: "social" },
              failure: { stats: { happy: -5 } },
            },
          ),
          option(
            "ร่วมทีมพัฒนาชุมชน",
            "สื่อสาร +8 · สัมพันธ์ +8",
            { skills: { communication: 8 }, stats: { social: 8 } },
            { icon: "users" },
          ),
          option(
            "ช่วยตรวจงบโครงการ",
            "ธุรกิจ +7 · วิชาการ +4",
            { skills: { business: 7, academic: 4 } },
            { icon: "book" },
          ),
          option(
            "ทำสื่อรณรงค์",
            "สร้างสรรค์ +8 · สัมพันธ์ +4",
            { skills: { creative: 8 }, stats: { social: 4 } },
            { icon: "camera" },
          ),
          option(
            "ขอทำงานเดิมต่อ",
            "สุข +4 · งานไม่เปลี่ยน",
            { stats: { happy: 4 } },
            { icon: "briefcase" },
          ),
        ],
        "การเมือง",
        "festival",
      ),
    );
  return list;
}
