import { extraStories } from "./extra-stories.ts";
import { opportunities } from "./opportunities.ts";
import type { Life } from "../../types.ts";
import type { StoryEvent, Skill } from "../types.ts";
import { event, option } from "./builders.ts";
import { randomAt } from "../../random.ts";
import { careerOffer, promotionEvent } from "./career.ts";
import { relationshipEvent } from "./relationships.ts";
export function randomStory(life: Life): StoryEvent {
  const j = life.journey!,
    pool: StoryEvent[] = [...opportunities(life), ...extraStories(life)];
  pool.push(
    event(
      life,
      "health-" + life.age,
      "ร่างกายส่งสัญญาณเตือน",
      "มีอาการป่วยเล็กน้อย เลือกการดูแลให้เหมาะกับกำลังเงิน",
      [
        option(
          "พักฟื้นที่บ้าน",
          "สุขภาพ +3 · สุข −2",
          { stats: { health: 3, happy: -2 } },
          { icon: "moon" },
        ),
        option(
          "ไปตรวจที่คลินิก",
          "2,000 · สุขภาพ +10",
          { stats: { health: 10 } },
          { icon: "heart", cost: 2000 },
        ),
        option(
          "ปรับการกินและการนอน",
          "สำเร็จสุขภาพ +8 · พลาดสุขภาพ −3",
          { stats: { health: 8 } },
          {
            icon: "leaf",
            chance: { base: 60, skill: "care", stat: "health" },
            failure: { stats: { health: -3 } },
          },
        ),
        option(
          "ให้ครอบครัวช่วยดูแล",
          "สุขภาพ +4 · สัมพันธ์ +3",
          { stats: { health: 4, social: 3 } },
          { icon: "users" },
        ),
        option(
          "ฝืนทำเรื่องที่ค้างไว้",
          "รับ 1,000 · สุขภาพ −8",
          { money: 1000, stats: { health: -8 } },
          { icon: "briefcase" },
        ),
      ],
      "สุขภาพ",
      "hospital",
    ),
  );
  pool.push(
    event(
      life,
      "contest-" + life.age,
      "เวทีประกวดเปิดรับสมัคร",
      "ทักษะและดวงอาจเปลี่ยนงานอดิเรกให้เป็นโอกาส",
      [
        option(
          "แข่งเขียนโปรแกรม",
          "สำเร็จรับ 12,000 · เทคโนโลยี +8",
          { money: 12000, skills: { tech: 8 } },
          {
            icon: "code",
            chance: { base: 30, skill: "tech" },
            failure: { skills: { tech: 3 } },
          },
        ),
        option(
          "ส่งงานศิลปะ",
          "สำเร็จรับ 8,000 · สร้างสรรค์ +10",
          { money: 8000, skills: { creative: 10 } },
          {
            icon: "art",
            chance: { base: 35, skill: "creative" },
            failure: { skills: { creative: 3 } },
          },
        ),
        option(
          "ขึ้นเวทีพูด",
          "สำเร็จสัมพันธ์ +12 · สื่อสาร +8",
          { stats: { social: 12 }, skills: { communication: 8 } },
          {
            icon: "users",
            chance: { base: 35, skill: "communication", stat: "happy" },
            failure: { skills: { communication: 3 } },
          },
        ),
        option(
          "ช่วยจัดงาน",
          "สัมพันธ์ +5 · ธุรกิจ +4",
          { stats: { social: 5 }, skills: { business: 4 } },
          { icon: "shop" },
        ),
        option("ไปเป็นผู้ชม", "สุข +5", { stats: { happy: 5 } }, { icon: "camera" }),
      ],
      "โอกาส",
      "festival",
    ),
  );
  pool.push(
    event(
      life,
      "friend-" + life.age,
      "เพื่อนชวนทำโปรเจกต์",
      "แต่ละบทบาทให้ประสบการณ์ต่างกัน คุณอยากช่วยตรงไหน?",
      [
        option(
          "เขียนระบบให้ทีม",
          "เทคโนโลยี +8 · สุข −2",
          { skills: { tech: 8 }, stats: { happy: -2 } },
          { icon: "code" },
        ),
        option(
          "ออกแบบภาพและเรื่องราว",
          "สร้างสรรค์ +8",
          { skills: { creative: 8 } },
          { icon: "art" },
        ),
        option(
          "ดูงบและการขาย",
          "ธุรกิจ +8",
          { skills: { business: 8 } },
          { icon: "wallet" },
        ),
        option(
          "นำเสนอโปรเจกต์",
          "สื่อสาร +8 · สัมพันธ์ +3",
          { skills: { communication: 8 }, stats: { social: 3 } },
          { icon: "users" },
        ),
        option(
          "ไม่ร่วม ขอพักก่อน",
          "สุขภาพ +4 · สุข +3",
          { stats: { health: 4, happy: 3 } },
          { icon: "moon" },
        ),
      ],
      "เพื่อน",
    ),
  );
  if (life.age >= 18) {
    pool.push(
      event(
        life,
        "scam-" + life.age,
        "ข้อเสนอรวยเร็วเข้ามา",
        "คนรู้จักชวนลงเงิน ผลลัพธ์ในเกมมีความเสี่ยงสูง เงินที่จ่ายเสียไปแม้ไม่สำเร็จ",
        [
          option(
            "เสี่ยงลงเงินเต็มที่",
            "จ่าย 20,000 · สำเร็จรับ 60,000 · พลาดไม่คืนเงิน",
            { money: 60000 },
            {
              icon: "coin",
              cost: 20000,
              chance: { base: 15, skill: "business" },
              failure: { stats: { happy: -8 } },
            },
          ),
          option(
            "ลองเพียงเล็กน้อย",
            "จ่าย 2,000 · สำเร็จรับ 5,000",
            { money: 5000 },
            { icon: "coin", cost: 2000, chance: { base: 20, skill: "business" } },
          ),
          option(
            "ตรวจสอบก่อนปฏิเสธ",
            "ธุรกิจ +6",
            { skills: { business: 6 } },
            { icon: "book" },
          ),
          option(
            "เตือนเพื่อน",
            "สำเร็จสัมพันธ์ +10 · พลาดสัมพันธ์ −3",
            { stats: { social: 10 } },
            {
              icon: "users",
              chance: { base: 55, skill: "communication" },
              failure: { stats: { social: -3 } },
            },
          ),
          option(
            "ปฏิเสธและเก็บเงินไว้",
            "เงินไม่เปลี่ยน · สุข +2",
            { stats: { happy: 2 } },
            { icon: "shield" },
          ),
        ],
        "การเงิน",
        "gift",
      ),
    );
    pool.push(
      event(
        life,
        "ethics-" + life.age,
        "ทางลัดจากคนมีเส้นสาย",
        "คนในเครือข่ายเสนอผลประโยชน์สีเทา การรับข้อเสนอเพิ่มความเสี่ยงคดีในปีต่อ ๆ ไป",
        [
          option(
            "รับเงินทุจริต",
            "รับ 60,000 · ความเสี่ยงคดี +35",
            { money: 60000, heat: 35, stats: { social: -8 } },
            { icon: "danger" },
          ),
          option(
            "จ่ายส่วยเพื่อรับงาน",
            "จ่าย 10,000 · สำเร็จรับ 45,000 · เสี่ยงคดี +20 ทั้งสองผล",
            { money: 45000, heat: 20 },
            {
              icon: "danger",
              cost: 10000,
              chance: { base: 45, skill: "business" },
              failure: { heat: 20 },
            },
          ),
          option(
            "จ่ายให้ตำรวจช่วยปิดเรื่อง",
            "จ่าย 20,000 · สำเร็จลดความเสี่ยง 15 · พลาดเพิ่ม 30",
            { heat: -15 },
            {
              icon: "danger",
              cost: 20000,
              chance: { base: 35, skill: "communication" },
              failure: { heat: 30 },
            },
          ),
          option(
            "เปิดเผยเรื่องต่อชุมชน",
            "สำเร็จสัมพันธ์ +15 · พลาดสัมพันธ์ −5",
            { stats: { social: 15 }, heat: -10 },
            {
              icon: "flag",
              chance: { base: 45, skill: "communication", stat: "social" },
              failure: { stats: { social: -5 } },
            },
          ),
          option(
            "ปฏิเสธและถอนตัว",
            "ไม่มีเงินเพิ่ม · สุข +4",
            { stats: { happy: 4 } },
            { icon: "shield" },
          ),
        ],
        "สังคม",
      ),
    );
    pool.push(
      event(
        life,
        "travel-" + life.age,
        "โอกาสออกไปเห็นโลก",
        "การเดินทางอาจกลายเป็นจุดเริ่มต้นของชีวิตใหม่",
        [
          option(
            "สมัครงานที่ญี่ปุ่น",
            "จ่ายเตรียมตัว 15,000 · สำเร็จย้ายไปญี่ปุ่นและรับงานนักขาย",
            { location: "ญี่ปุ่น", career: "sales", skills: { communication: 10 } },
            {
              icon: "plane",
              cost: 15000,
              chance: { base: 25, skill: "communication", stat: "skill" },
              failure: { skills: { communication: 3 } },
            },
          ),
          option(
            "เที่ยวกับคนใกล้ตัว",
            "8,000 · สุข +12 · สัมพันธ์ +5",
            { stats: { happy: 12, social: 5 } },
            { icon: "plane", cost: 8000 },
          ),
          option(
            "เดินทางในจังหวัด",
            "1,000 · สุข +6",
            { stats: { happy: 6 } },
            { icon: "camera", cost: 1000 },
          ),
          option(
            "เรียนภาษาผ่านสื่อฟรี",
            "สื่อสาร +6",
            { skills: { communication: 6 } },
            { icon: "language" },
          ),
          option(
            "อยู่บ้านเก็บเงิน",
            "สุขภาพ +3",
            { stats: { health: 3 } },
            { icon: "home" },
          ),
        ],
        "ต่างประเทศ",
        "travel",
      ),
    );
    if (!life.flags.includes("retired") && life.age < 65) {
      pool.push(careerOffer(life));
      if (j.career) {
        pool.push(promotionEvent(life));
        pool.push(careerOffer(life, "loss"));
      }
    }
    if (
      !j.stopHavingChildren &&
      j.partner?.status === "married" &&
      life.age < 60 &&
      j.children.length < 5
    )
      pool.push(relationshipEvent(life, "child"));
    if (j.partner && j.partner.status !== "separated") {
      if (j.partner.bond < 65) pool.push(relationshipEvent(life, "breakup"));
      else if (j.partner.status === "dating") pool.push(relationshipEvent(life, "marry"));
    } else if (life.age >= 23 && life.age <= 65)
      pool.push(relationshipEvent(life, "meet"));
  }
  const eligible = pool.filter(
    (story) => !story.id.startsWith("friend-") || life.age >= 18,
  );
  if (life.age < 18)
    return extraStories(life)[
      Math.floor(randomAt(life.seed, life.age, 88) * extraStories(life).length)
    ];
  return eligible[Math.floor(randomAt(life.seed, life.age, 88) * eligible.length)];
}
