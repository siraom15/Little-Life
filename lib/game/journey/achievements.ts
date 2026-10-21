import { startingWallet } from "./wallet.ts";
import type { Entry } from "../types.ts";
import type { Life } from "../types.ts";
export type TrophyTier = "bronze" | "gold" | "plat";
export const trophyColors = { bronze: "#ce9669", gold: "#ffcf58", plat: "#a0f1ff" };
export function endingAchievements(life: Life) {
  const j = life.journey!,
    scores = j.milestonesScore;
  const peakMoney = Math.max(life.money, ...life.history.map((e) => e.money));
  const rank = scores?.promotionCount || 0;
  const legacy =
    Math.max(0, j.funeral?.estate || 0) +
    (life.simulation?.economy?.beneficiaryPayout || 0);
  const skill = Object.values(j.skills)
    .sort((a, b) => b - a)
    .slice(0, 2)
    .reduce((a, b) => a + b, 0);
  const definitions = [
    {
      id: "wealth",
      title: "การเงิน",
      value: peakMoney,
      thresholds: [200000, 2000000, 20000000],
      unit: "บาทสูงสุด",
    },
    {
      id: "health",
      title: "สุขภาพ",
      value: scores?.healthyYears || 0,
      thresholds: [20, 60, 100],
      unit: "ปีสุขภาพดี",
    },
    {
      id: "career",
      title: "อาชีพ",
      value: rank,
      thresholds: [2, 4, 6],
      unit: "ขั้นที่เลื่อน",
    },
    {
      id: "love",
      title: "ความรัก",
      value: scores?.marriedYears || 0,
      thresholds: [2, 20, 50],
      unit: "ปีคู่ชีวิต",
    },
    {
      id: "learning",
      title: "การเรียนรู้",
      value: skill,
      thresholds: [80, 140, 190],
      unit: "ผลรวมสองทักษะสูงสุด",
    },
    {
      id: "legacy",
      title: "ส่งต่อ",
      value: legacy,
      thresholds: [300000, 2000000, 10000000],
      unit: "บาทให้คนข้างหลัง",
    },
  ];
  return definitions.map((a) => ({
    ...a,
    tier: (a.value >= a.thresholds[2]
      ? "plat"
      : a.value >= a.thresholds[1]
        ? "gold"
        : a.value >= a.thresholds[0]
          ? "bronze"
          : null) as TrophyTier | null,
  }));
}
export function lifeHighlights(life: Life) {
  const importance = (e: Entry) => {
    if (
      e.outcomeSuccess === false ||
      e.id === "death" ||
      e.age === 0 ||
      /ไม่สำเร็จ|ไม่ผ่าน/.test(e.detail)
    )
      return 0;
    const text = e.title + " " + e.choice;
    if (/เสียชีวิต|ล้มละลาย|แต่งงาน|คลอด|กำเนิด|มีลูก|ถูกจับ|รับโทษ/.test(text)) return 4;
    if (/เลื่อน|ย้าย|ต่างแดน|มะเร็ง|วินิจฉัย|อุบัติเหตุ|ไฟไหม้/.test(text)) return 3;
    if (/งานแรก|เกษียณ|ซื้อบ้าน|บ้านหลังแรก|มหาวิทยาลัย/.test(text)) return 2;
    return 0;
  };
  const picked = life.history
    .map((entry, index) => ({ entry, index, score: importance(entry) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, 6)
    .sort((a, b) => a.index - b.index)
    .map((x) => x.entry);
  const birth: Entry = {
    id: "birth",
    age: 0,
    title: "ครั้งหนึ่ง… ชีวิตเริ่มต้น",
    choice: life.name + " เกิดที่" + life.province,
    detail: life.background,
    category: "ชีวิต",
    money: startingWallet(life).money,
  };
  const death = life.history.findLast((e) => e.id === "death") || {
    id: "death",
    age: life.age,
    title: "สิ่งที่ทิ้งไว้ในความทรงจำ",
    choice: life.simulation?.death?.cause || "จบการเดินทาง",
    detail: life.journey!.funeral?.title || "หนึ่งชีวิต หลายเรื่องราว",
    category: "บทสรุป",
    money: life.money,
  };
  return [birth, ...picked, death];
}
