import { gameConfig } from "../config.ts";
import type { Life } from "../../types.ts";
import type { StoryEvent, Skill } from "../types.ts";
import { event, option } from "./builders.ts";
export function relationshipEvent(
  life: Life,
  kind: "meet" | "marry" | "child" | "breakup",
) {
  if (kind === "meet")
    return event(
      life,
      "love-" + life.age,
      "มีคนทำให้ใจเต้นแรง",
      "คุณได้รู้จักคนใหม่ ความสัมพันธ์และการสื่อสารช่วยให้เปิดใจได้ง่ายขึ้น",
      [
        option(
          "ชวนคุยและขอทำความรู้จัก",
          "ถ้าสำเร็จเริ่มคบกัน",
          { relationship: "meet" },
          {
            icon: "heart",
            chance: { base: 40, skill: "communication", stat: "social" },
            failure: { stats: { happy: -3 } },
          },
        ),
        option(
          "ชวนไปกินข้าว",
          "จ่าย 1,000 · โอกาสเริ่มคบสูงขึ้น",
          { relationship: "meet", stats: { happy: 5 } },
          {
            icon: "food",
            cost: 1000,
            chance: { base: 55, skill: "communication", stat: "social" },
            failure: { stats: { happy: -2 } },
          },
        ),
        option(
          "ให้เพื่อนช่วยแนะนำ",
          "ถ้าสำเร็จเริ่มคบกัน",
          { relationship: "meet", stats: { social: 3 } },
          { icon: "users", chance: { base: 45, stat: "social" } },
        ),
        option(
          "เป็นเพื่อนกันก่อน",
          "สัมพันธ์ +6 · สื่อสาร +4",
          { stats: { social: 6 }, skills: { communication: 4 } },
          { icon: "users" },
        ),
        option(
          "ขอโฟกัสตัวเอง",
          "สุข +4 · ยังโสด",
          { stats: { happy: 4 } },
          { icon: "moon" },
        ),
      ],
      "ความสัมพันธ์",
      "festival",
    );
  if (kind === "marry")
    return event(
      life,
      "marry-" + life.age,
      "จะเดินต่อไปด้วยกันไหม?",
      "คุณกับคู่รักคุยถึงอนาคต การแต่งงานเปิดโอกาสสร้างครอบครัว",
      [
        option(
          "แต่งงานเล็ก ๆ",
          "ค่าใช้จ่าย 15,000 · ความผูกพัน +15",
          { relationship: "marry", bond: 15 },
          {
            icon: "heart",
            cost: 15000,
            chance: { base: 55, skill: "communication", stat: "social" },
            failure: { bond: -8 },
          },
        ),
        option(
          "จัดงานพร้อมครอบครัว",
          "ค่าใช้จ่าย 50,000 · ความผูกพัน +25",
          { relationship: "marry", bond: 25 },
          {
            icon: "users",
            cost: 50000,
            chance: { base: 65, skill: "communication", stat: "social" },
            failure: { bond: -5 },
          },
        ),
        option(
          "จดทะเบียนเรียบง่าย",
          "ค่าใช้จ่าย 1,000 · ความผูกพัน +8",
          { relationship: "marry", bond: 8 },
          {
            icon: "book",
            cost: 1000,
            chance: { base: 50, skill: "communication", stat: "social" },
            failure: { bond: -5 },
          },
        ),
        option(
          "คบกันต่อ ยังไม่แต่ง",
          "สื่อสาร +4 · ความผูกพัน +3",
          { skills: { communication: 4 }, bond: 3 },
          { icon: "heart" },
        ),
        option(
          "แยกทางด้วยความเข้าใจ",
          "จบความสัมพันธ์ · สุข −5",
          { relationship: "leave", stats: { happy: -5 } },
          { icon: "moon" },
        ),
      ],
      "ความสัมพันธ์",
      "festival",
    );
  if (kind === "child")
    return event(
      life,
      "child-" + life.age,
      "พร้อมมีสมาชิกใหม่ไหม?",
      "ตอนนี้มีลูก " +
        life.journey!.children.length +
        " คน · มีลูกเพิ่มค่าเลี้ยงดูปีละ " +
        gameConfig.family.childCost.toLocaleString("th-TH") +
        " บาทต่อคน หากสำเร็จจะได้พบสมาชิกใหม่",
      [
        option(
          "วางแผนมีลูก",
          "เตรียมตัว 20,000 · ใช้สุขภาพและดวง",
          { relationship: "child", stats: { happy: 12, health: -4 } },
          { icon: "heart", cost: 20000, chance: { base: 55, stat: "health" } },
        ),
        option(
          "เตรียมความพร้อมให้ดีที่สุด",
          "ใช้ 45,000 · โอกาสสูงขึ้น",
          { relationship: "child", bond: 8 },
          { icon: "shield", cost: 45000, chance: { base: 70, stat: "health" } },
        ),
        option(
          "ต้อนรับลูกบุญธรรม",
          "เตรียมบ้าน 30,000 · ใช้ทักษะดูแล",
          { relationship: "child", stats: { social: 8 } },
          {
            icon: "users",
            cost: 30000,
            chance: { base: 65, skill: "care", stat: "social" },
          },
        ),
        option(
          "รอให้การเงินพร้อม",
          "ความผูกพัน +4 · ยังไม่มีค่าเลี้ยงดูใหม่",
          { bond: 4 },
          { icon: "wallet" },
        ),
        option(
          "เลือกชีวิตคู่ไม่มีลูกเพิ่ม",
          "สุข +6 · ความผูกพัน +5 · ไม่ถามเรื่องมีลูกอีกตลอดชีวิต",
          { stats: { happy: 6 }, bond: 5, stopHavingChildren: true },
          { icon: "heart" },
        ),
      ],
      "ครอบครัว",
      "home",
    );
  return event(
    life,
    "breakup-" + life.age,
    "คนรักกำลังจะเดินจากไป",
    "ความผูกพันสั่นคลอน คุณอาจประคองความสัมพันธ์ได้ แต่ไม่มีคำตอบไหนรับประกันว่าจะรั้งอีกคนไว้",
    [
      option(
        "คุยกันอย่างเปิดใจ",
        "สำเร็จผูกพัน +20 · ไม่สำเร็จแยกทาง",
        { relationship: "repair", bond: 20 },
        {
          icon: "heart",
          chance: { base: 25, skill: "communication", stat: "social" },
          failure: { relationship: "leave", stats: { happy: -12 } },
        },
      ),
      option(
        "ขอคำปรึกษาร่วมกัน",
        "จ่าย 5,000 · สำเร็จผูกพัน +25",
        { relationship: "repair", bond: 25 },
        {
          icon: "users",
          cost: 5000,
          chance: { base: 45, skill: "care", stat: "social" },
          failure: { relationship: "leave", stats: { happy: -8 } },
        },
      ),
      option(
        "ให้เวลากันและกัน",
        "สำเร็จผูกพัน +12 · ไม่สำเร็จแยกทาง",
        { bond: 12 },
        {
          icon: "moon",
          chance: { base: 35, stat: "happy" },
          failure: { relationship: "leave", stats: { happy: -10 } },
        },
      ),
      option(
        "ยอมรับการเลิกรา",
        "แยกทาง · สุข −8 · ลูกยังอยู่ในประวัติ",
        { relationship: "leave", stats: { happy: -8 } },
        { icon: "heart" },
      ),
      option(
        "เป็นฝ่ายจบความสัมพันธ์",
        "แยกทาง · สุข −6 · สื่อสาร +3",
        { relationship: "leave", stats: { happy: -6 }, skills: { communication: 3 } },
        { icon: "flag" },
      ),
    ],
    "ความสัมพันธ์",
  );
}
