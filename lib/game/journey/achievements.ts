import { startingWallet } from "./wallet.ts";
import type { Entry } from "../types.ts";
import type { Life } from "../types.ts";
export type TrophyTier = "bronze" | "gold" | "plat";
export const trophyColors = { bronze: "#ce9669", gold: "#ffcf58", plat: "#a0f1ff" };
export function endingAchievements(life: Life) {
  const j = life.journey!,
    scores = j.milestonesScore;
  const peakMoney = Math.max(life.money, ...life.history.map((e) => e.money));
  const rank = Math.max(j.career?.rank || 0, scores?.peakRank || 0);
  const legacy =
    Math.max(0, j.funeral?.estate || 0) +
    (life.simulation?.economy?.beneficiaryPayout || 0);
  const skill = Math.max(...Object.values(j.skills));
  const definitions = [
    {
      id: "wealth",
      title: "การเงิน",
      value: peakMoney,
      thresholds: [100000, 1000000, 10000000],
      unit: "บาทสูงสุด",
    },
    {
      id: "health",
      title: "สุขภาพ",
      value: scores?.healthyYears || 0,
      thresholds: [10, 30, 50],
      unit: "ปีสุขภาพดี",
    },
    {
      id: "career",
      title: "อาชีพ",
      value: rank,
      thresholds: [1, 2, 3],
      unit: "ขั้นที่เลื่อน",
    },
    {
      id: "love",
      title: "ความรัก",
      value: scores?.marriedYears || 0,
      thresholds: [1, 10, 25],
      unit: "ปีคู่ชีวิต",
    },
    {
      id: "learning",
      title: "การเรียนรู้",
      value: skill,
      thresholds: [40, 70, 95],
      unit: "ทักษะสูงสุด",
    },
    {
      id: "legacy",
      title: "ส่งต่อ",
      value: legacy,
      thresholds: [150000, 1000000, 5000000],
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
  const entries = life.history.filter(
    (e) =>
      !e.id.startsWith("finance-") && !e.id.startsWith("invest-") && e.id !== "death",
  );
  const middle = entries.filter((e) => e.age > 0 && e.age < life.age);
  const picked = Array.from(
    { length: Math.min(6, middle.length) },
    (_, i) =>
      middle[
        Math.floor(
          (i * Math.max(0, middle.length - 1)) /
            Math.max(1, Math.min(6, middle.length) - 1),
        )
      ],
  );
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
