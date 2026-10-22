import type { Life } from "../../types.ts";
import type { StoryChoice, StoryEvent } from "../types.ts";
import { event, option as o } from "./builders.ts";
const social = (n: number) => ({ stats: { social: n } });
export function socialStories(life: Life): StoryEvent[] {
  const stories: StoryEvent[] = [];
  const add = (id: string, title: string, text: string, choices: StoryChoice[]) =>
    stories.push(
      event(
        life,
        "social-" + id + "-" + life.age,
        title,
        text,
        choices,
        "ความสัมพันธ์",
        "festival",
      ),
    );
  const age = life.age;
  if (age >= 6 && age <= 12)
    add(
      "playground",
      "เพื่อนชวนตั้งทีมเล่นหลังเลิกเรียน",
      "ทุกคนอยากเป็นหัวหน้าทีม คุณจะช่วยให้เล่นด้วยกันอย่างไร?",
      [
        o(
          "ผลัดกันเป็นหัวหน้า",
          "สัมพันธ์ +8 · สื่อสาร +3",
          { stats: { social: 8 }, skills: { communication: 3 } },
          { icon: "users" },
        ),
        o("แบ่งขนมให้เพื่อน", "จ่าย 100 · สัมพันธ์ +10", social(10), {
          cost: 100,
          icon: "food",
        }),
        o(
          "ชวนเพื่อนที่ถูกทิ้งให้อยู่คนเดียว",
          "สำเร็จสัมพันธ์ +12 · พลาดสุข −2",
          social(12),
          {
            icon: "heart",
            chance: { base: 55, skill: "communication" },
            failure: { stats: { happy: -2 } },
          },
        ),
        o(
          "ช่วยจัดอุปกรณ์ให้ทีม",
          "ดูแล +5 · สัมพันธ์ +5",
          { skills: { care: 5 }, stats: { social: 5 } },
          { icon: "tool" },
        ),
        o(
          "วันนี้ขอพักที่บ้าน",
          "สุขภาพ +3 · ยังไม่เข้าทีม",
          { stats: { health: 3 } },
          { icon: "home" },
        ),
      ],
    );
  if (age >= 13 && age <= 17)
    add(
      "friend-conflict",
      "เพื่อนสนิทสองคนทะเลาะกัน",
      "ทั้งสองคนอยากให้คุณเลือกข้าง การฟังอาจทำให้เรื่องดีขึ้น",
      [
        o(
          "นั่งฟังทีละคน",
          "สัมพันธ์ +8 · ดูแล +3",
          { stats: { social: 8 }, skills: { care: 3 } },
          { icon: "heart" },
        ),
        o(
          "ชวนทั้งคู่ปรับความเข้าใจ",
          "สำเร็จสัมพันธ์ +14 · พลาดสัมพันธ์ −5",
          social(14),
          {
            icon: "users",
            chance: { base: 40, skill: "communication", stat: "social" },
            failure: social(-5),
          },
        ),
        o(
          "ขอครูช่วยไกล่เกลี่ย",
          "สัมพันธ์ +6 · สื่อสาร +4",
          { stats: { social: 6 }, skills: { communication: 4 } },
          { icon: "book" },
        ),
        o(
          "ชวนทำงานกลุ่มร่วมกัน",
          "จ่ายอุปกรณ์ 300 · สัมพันธ์ +10 · สร้างสรรค์ +3",
          { stats: { social: 10 }, skills: { creative: 3 } },
          { cost: 300, icon: "art" },
        ),
        o(
          "เว้นระยะให้ใจเย็น",
          "สุข +3 · สัมพันธ์ −2",
          { stats: { happy: 3, social: -2 } },
          { icon: "moon" },
        ),
      ],
    );
  if (age >= 18 && age <= 24)
    add(
      "new-circle",
      "เพื่อนกลุ่มใหม่ชวนทำกิจกรรม",
      "การเริ่มชีวิตผู้ใหญ่เปิดโอกาสรู้จักผู้คนที่มีความสนใจเหมือนกัน",
      [
        o(
          "เข้าชมรมที่สนใจ",
          "สัมพันธ์ +8 · สร้างสรรค์ +4",
          { stats: { social: 8 }, skills: { creative: 4 } },
          { icon: "art" },
        ),
        o(
          "ชวนกันทำโปรเจกต์เล็ก ๆ",
          "จ่าย 500 · สำเร็จสัมพันธ์ +12 ธุรกิจ +5 · พลาดสุข −3",
          { stats: { social: 12 }, skills: { business: 5 } },
          {
            cost: 500,
            icon: "tool",
            chance: { base: 45, skill: "communication" },
            failure: { stats: { happy: -3 } },
          },
        ),
        o(
          "ช่วยงานอาสา",
          "สัมพันธ์ +7 · ดูแล +5",
          { stats: { social: 7 }, skills: { care: 5 } },
          { icon: "heart" },
        ),
        o(
          "นัดเจอเพื่อนเก่า",
          "จ่าย 300 · สุข +6 สัมพันธ์ +6",
          { stats: { happy: 6, social: 6 } },
          { cost: 300, icon: "food" },
        ),
        o(
          "คุยออนไลน์ก่อน",
          "สื่อสาร +4 · สัมพันธ์ +3",
          { skills: { communication: 4 }, stats: { social: 3 } },
          { icon: "language" },
        ),
      ],
    );
  if (age >= 25 && age <= 44)
    add(
      "neighbours",
      "เพื่อนบ้านชวนจัดมื้ออาหารร่วมกัน",
      "เพื่อนบ้านใหม่อยากรู้จักคุณมากขึ้น",
      [
        o(
          "ทำอาหารไปแบ่ง",
          "จ่าย 800 · สัมพันธ์ +10 · ดูแล +3",
          { stats: { social: 10 }, skills: { care: 3 } },
          { cost: 800, icon: "food" },
        ),
        o(
          "ช่วยจัดสถานที่",
          "สัมพันธ์ +7 · สุขภาพ −1",
          { stats: { social: 7, health: -1 } },
          { icon: "tool" },
        ),
        o(
          "ชวนคุยเรื่องที่ทุกคนสนใจ",
          "สำเร็จสัมพันธ์ +12 · พลาดสัมพันธ์ +2",
          social(12),
          {
            icon: "users",
            chance: { base: 45, skill: "communication" },
            failure: social(2),
          },
        ),
        o(
          "ชวนเพื่อนบ้านออกกำลังกาย",
          "สัมพันธ์ +5 · สุขภาพ +4",
          { stats: { social: 5, health: 4 } },
          { icon: "sport" },
        ),
        o(
          "ฝากคำทักทายแล้วกลับพัก",
          "สัมพันธ์ +2 · สุข +3",
          { stats: { social: 2, happy: 3 } },
          { icon: "home" },
        ),
      ],
    );
  if (age >= 45 && age <= 59)
    add(
      "reunion",
      "เพื่อนเก่านัดรวมตัวอีกครั้ง",
      "ต่างคนต่างผ่านเรื่องราวมากมาย บางความสัมพันธ์ยังต่อกันติด",
      [
        o(
          "ไปเล่าความทรงจำด้วยกัน",
          "จ่าย 1500 · สัมพันธ์ +10 สุข +8",
          { stats: { social: 10, happy: 8 } },
          { cost: 1500, icon: "users" },
        ),
        o(
          "โทรหาเพื่อนที่ไม่ได้มา",
          "สัมพันธ์ +7 · สื่อสาร +3",
          { stats: { social: 7 }, skills: { communication: 3 } },
          { icon: "language" },
        ),
        o(
          "ช่วยเพื่อนที่กำลังลำบาก",
          "จ่าย 3000 · สัมพันธ์ +14 · สุข +5",
          { stats: { social: 14, happy: 5 } },
          { cost: 3000, icon: "heart" },
        ),
        o(
          "รวมกลุ่มทำประโยชน์ให้ชุมชน",
          "สัมพันธ์ +9 · ดูแล +4",
          { stats: { social: 9 }, skills: { care: 4 } },
          { icon: "flag" },
        ),
        o(
          "ขอเจอกลุ่มเล็กวันหลัง",
          "สัมพันธ์ +4 · สุขภาพ +2",
          { stats: { social: 4, health: 2 } },
          { icon: "moon" },
        ),
      ],
    );
  if (age >= 60)
    add(
      "community",
      "ชมรมในชุมชนชวนออกมาพบเพื่อน",
      "บทสนทนาดี ๆ ช่วยให้วันธรรมดามีความหมาย",
      [
        o(
          "เดินเล่นกับเพื่อนวัยเดียวกัน",
          "สัมพันธ์ +8 · สุขภาพ +3",
          { stats: { social: 8, health: 3 } },
          { icon: "sport" },
        ),
        o(
          "เล่าประสบการณ์ให้คนรุ่นใหม่",
          "สัมพันธ์ +10 · สื่อสาร +4",
          { stats: { social: 10 }, skills: { communication: 4 } },
          { icon: "book" },
        ),
        o(
          "จัดวงอาหารเล็ก ๆ",
          "จ่าย 600 · สุข +8 สัมพันธ์ +10",
          { stats: { happy: 8, social: 10 } },
          { cost: 600, icon: "food" },
        ),
        o(
          "โทรคุยกับคนที่คิดถึง",
          "สัมพันธ์ +6 · สุข +5",
          { stats: { social: 6, happy: 5 } },
          { icon: "heart" },
        ),
        o(
          "พักแล้วส่งข้อความทักทาย",
          "สัมพันธ์ +3 · สุขภาพ +3",
          { stats: { social: 3, health: 3 } },
          { icon: "home" },
        ),
      ],
    );
  const partner = life.journey!.partner;
  if (!partner || partner.deceased || partner.status === "separated" || age < 18)
    return stories;
  const addCouple = (id: string, title: string, text: string, choices: StoryChoice[]) =>
    stories.push(
      event(
        life,
        "couple-" + id + "-" + age,
        title,
        partner.name + " " + text,
        choices,
        "ความสัมพันธ์",
        "home",
      ),
    );
  addCouple(
    "date",
    "คนรักอยากมีเวลาให้กัน",
    "คิดถึงช่วงเวลาที่ได้คุยกันโดยไม่มีเรื่องอื่นรบกวน",
    [
      o(
        "ทำอาหารด้วยกัน",
        "จ่าย 500 · ผูกพัน +10 สุข +6",
        { bond: 10, stats: { happy: 6 } },
        { cost: 500, icon: "food" },
      ),
      o(
        "เดินเล่นและฟังกันจริง ๆ",
        "ผูกพัน +8 · สัมพันธ์ +5",
        { bond: 8, stats: { social: 5 } },
        { icon: "heart" },
      ),
      o(
        "จัดเดตเซอร์ไพรส์",
        "จ่าย 2000 · สำเร็จผูกพัน +18 · พลาดผูกพัน +3",
        { bond: 18 },
        {
          cost: 2000,
          icon: "gift",
          chance: { base: 55, skill: "creative" },
          failure: { bond: 3 },
        },
      ),
      o(
        "วางแผนวันหยุดด้วยกัน",
        "ผูกพัน +6 · สื่อสาร +4",
        { bond: 6, skills: { communication: 4 } },
        { icon: "plane" },
      ),
      o(
        "ขอเลื่อนเพราะอยากอยู่คนเดียว",
        "สุข +4 · ผูกพัน −8",
        { bond: -8, stats: { happy: 4 } },
        { icon: "moon" },
      ),
    ],
  );
  addCouple(
    "misunderstanding",
    "เรื่องเล็กกลายเป็นความเข้าใจผิด",
    "รู้สึกว่าคุณไม่รับฟัง สิ่งที่พูดต่อจากนี้อาจเปลี่ยนความสัมพันธ์",
    [
      o(
        "ฟังให้จบแล้วขอโทษ",
        "ผูกพัน +8 · สื่อสาร +3",
        { bond: 8, skills: { communication: 3 } },
        { icon: "heart" },
      ),
      o(
        "คุยตรง ๆ เพื่อหาทางออกร่วมกัน",
        "สำเร็จผูกพัน +16 · พลาดผูกพัน −8",
        { bond: 16 },
        {
          icon: "language",
          chance: { base: 40, skill: "communication", stat: "social" },
          failure: { bond: -8 },
        },
      ),
      o(
        "ขอคำปรึกษาคู่รัก",
        "จ่าย 2500 · ผูกพัน +12 ดูแล +3",
        { bond: 12, skills: { care: 3 } },
        { cost: 2500, icon: "users" },
      ),
      o(
        "พักอารมณ์แล้วกลับมาคุย",
        "ผูกพัน +4 · สุข +3",
        { bond: 4, stats: { happy: 3 } },
        { icon: "moon" },
      ),
      o(
        "ประชดแล้วเดินหนี",
        "ผูกพัน −15 · สุข −5",
        { bond: -15, stats: { happy: -5 } },
        { icon: "danger" },
      ),
    ],
  );
  addCouple(
    "dream",
    "คนรักอยากเริ่มสิ่งที่ฝันไว้",
    "อยากเรียนรู้ทักษะใหม่และหวังให้คุณช่วยสนับสนุน",
    [
      o(
        "ช่วยหาทางเริ่มโดยไม่ต้องใช้เงิน",
        "ผูกพัน +9 · สื่อสาร +4",
        { bond: 9, skills: { communication: 4 } },
        { icon: "book" },
      ),
      o(
        "ช่วยออกค่าเรียน",
        "จ่าย 5000 · ผูกพัน +15 สุข +5",
        { bond: 15, stats: { happy: 5 } },
        { cost: 5000, icon: "coin" },
      ),
      o(
        "ลองทำไปด้วยกัน",
        "สำเร็จผูกพัน +14 สร้างสรรค์ +6 · พลาดผูกพัน +2",
        { bond: 14, skills: { creative: 6 } },
        { icon: "art", chance: { base: 45, skill: "creative" }, failure: { bond: 2 } },
      ),
      o(
        "ช่วยแบ่งเบางานในบ้าน",
        "ผูกพัน +10 · สุขภาพ −2",
        { bond: 10, stats: { health: -2 } },
        { icon: "home" },
      ),
      o(
        "บอกว่าไม่มีเวลาช่วย",
        "ผูกพัน −9 · สุข −2",
        { bond: -9, stats: { happy: -2 } },
        { icon: "moon" },
      ),
    ],
  );
  if (partner.status === "married")
    addCouple(
      "budget",
      "คุยเรื่องเงินในครอบครัว",
      "อยากให้ทั้งคู่ตัดสินใจเรื่องรายจ่ายด้วยกัน",
      [
        o(
          "เปิดบัญชีรายรับรายจ่ายคุยกัน",
          "ผูกพัน +9 · ธุรกิจ +5",
          { bond: 9, skills: { business: 5 } },
          { icon: "wallet" },
        ),
        o(
          "ตกลงลดรายจ่ายฟุ่มเฟือยร่วมกัน",
          "ผูกพัน +6 · สัมพันธ์ +4",
          { bond: 6, stats: { social: 4 } },
          { icon: "users" },
        ),
        o(
          "ปรึกษาผู้เชี่ยวชาญร่วมกัน",
          "จ่าย 2000 · ผูกพัน +12 ธุรกิจ +4",
          { bond: 12, skills: { business: 4 } },
          { cost: 2000, icon: "book" },
        ),
        o(
          "ยอมรับข้อผิดพลาดและเริ่มใหม่",
          "ผูกพัน +8 · สุข +3",
          { bond: 8, stats: { happy: 3 } },
          { icon: "heart" },
        ),
        o(
          "ปิดบังแล้วตัดสินใจคนเดียว",
          "ผูกพัน −14 · สัมพันธ์ −4",
          { bond: -14, stats: { social: -4 } },
          { icon: "danger" },
        ),
      ],
    );
  if (age >= 60)
    addCouple(
      "old-days",
      "ใช้วันธรรมดาให้เป็นวันพิเศษ",
      "อยากเก็บความทรงจำร่วมกันอีกสักวัน",
      [
        o(
          "นั่งดูรูปเก่าด้วยกัน",
          "ผูกพัน +12 · สุข +8",
          { bond: 12, stats: { happy: 8 } },
          { icon: "camera" },
        ),
        o(
          "เดินช้า ๆ ในสวน",
          "ผูกพัน +8 สุขภาพ +3",
          { bond: 8, stats: { health: 3 } },
          { icon: "leaf" },
        ),
        o(
          "พาไปกินร้านที่เคยชอบ",
          "จ่าย 1200 · ผูกพัน +15 สุข +6",
          { bond: 15, stats: { happy: 6 } },
          { cost: 1200, icon: "food" },
        ),
        o(
          "เขียนจดหมายถึงกัน",
          "ผูกพัน +10 สื่อสาร +3",
          { bond: 10, skills: { communication: 3 } },
          { icon: "book" },
        ),
        o(
          "พักผ่อนอยู่ข้างกัน",
          "ผูกพัน +6 สุขภาพ +4",
          { bond: 6, stats: { health: 4 } },
          { icon: "home" },
        ),
      ],
    );
  return stories;
}
