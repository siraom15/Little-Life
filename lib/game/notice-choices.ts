import type { Choice, Life } from "./types.ts";
import { randomEvents } from "./random-events.ts";
export function noticeChoices(life: Life): Choice[] {
  const notice = life.simulation?.notice;
  if (!notice || !randomEvents.some((event) => notice.id === event.id + "-" + life.age))
    return [];
  if (notice.scene === "hospital")
    return [
      { label: "พักตามอาการ", detail: "สุขภาพ +2", icon: "moon", effects: { health: 2 } },
      {
        label: "ใช้เงินดูแลเพิ่ม",
        detail: "สุขภาพ +8",
        icon: "heart",
        cost: 2000,
        effects: { health: 8 },
      },
      {
        label: "ให้ครอบครัวช่วยดูแล",
        detail: "สุขภาพ +3 · สัมพันธ์ +3",
        icon: "users",
        effects: { health: 3, social: 3 },
      },
      {
        label: "ปรับกิจวัตรทั้งบ้าน",
        detail: "สุขภาพ +4 · สุข −2",
        icon: "leaf",
        effects: { health: 4, happy: -2 },
      },
      {
        label: "เรียนรู้การดูแลตัวเอง",
        detail: "ทักษะ +4 · สุขภาพ +1",
        icon: "book",
        effects: { skill: 4, health: 1 },
      },
    ];
  return [
    {
      label: "เก็บเป็นความทรงจำ",
      detail: "สุข +2",
      icon: "camera",
      effects: { happy: 2 },
    },
    {
      label: "แบ่งปันกับครอบครัว",
      detail: "สัมพันธ์ +4",
      icon: "users",
      effects: { social: 4 },
    },
    {
      label: "ลองเรียนรู้จากเรื่องนี้",
      detail: "ทักษะ +3",
      icon: "book",
      effects: { skill: 3 },
    },
    {
      label: "ฉลองเล็ก ๆ ด้วยกัน",
      detail: "สุข +5 · สัมพันธ์ +2",
      icon: "food",
      cost: 500,
      effects: { happy: 5, social: 2 },
    },
    { label: "กลับไปพักผ่อน", detail: "สุขภาพ +3", icon: "moon", effects: { health: 3 } },
  ];
}
