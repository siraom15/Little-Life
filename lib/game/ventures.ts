import { gameConfig } from "./journey/config.ts";
import { lotteryPercent } from "./journey/lottery.ts";
import { careers } from "./careers.ts";
export type Venture = {
  id: string;
  label: string;
  detail: string;
  icon: string;
  cost: number;
  group: "ลงทุน" | "ประกัน" | "เส้นทางชีวิต" | "อาชีพ";
  minAge?: number;
};
export const ventures: Venture[] = [
  {
    id: "cancel-lottery",
    label: "ยกเลิกซื้อหวยรายปี",
    detail:
      "หยุดรายจ่ายและรีเซ็ตโอกาสกลับไป " +
      lotteryPercent(gameConfig.lottery.chance) +
      "%",
    icon: "ticket",
    cost: 0,
    group: "ลงทุน",
    minAge: 20,
  },
  {
    id: "premium",
    label: "ประกันอุ่นใจสูงสุด",
    detail: "เบี้ย 18,000/ปี · เสียชีวิต 1,500,000 · อุบัติเหตุ 90% · รักษาโรค 80%",
    icon: "shield",
    cost: 18000,
    group: "ประกัน",
  },
  ...careers.map((job) => ({
    id: "job-" + job.id,
    label: "สมัคร: " + job.label,
    detail: "รายได้ " + job.income.toLocaleString("th-TH") + "/ปี · ทักษะ " + job.skill,
    icon: job.icon,
    cost: job.cost,
    group: "อาชีพ" as const,
  })),
  {
    id: "fund",
    label: "ซื้อกองทุน",
    detail: "ซื้อหน่วย 10,000 · ผลตอบแทนจำลอง −12% ถึง +18% ต่อปี",
    icon: "chart",
    cost: 10000,
    group: "ลงทุน",
  },
  {
    id: "crypto",
    label: "ซื้อคริปโต",
    detail: "ซื้อหน่วย 5,000 · ผันผวน −60% ถึง +80% ต่อปี",
    icon: "coin",
    cost: 5000,
    group: "ลงทุน",
  },
  {
    id: "sell-fund",
    label: "ขายกองทุนทั้งหมด",
    detail: "รับเงินตามมูลค่าปัจจุบัน",
    icon: "wallet",
    cost: 0,
    group: "ลงทุน",
  },
  {
    id: "sell-crypto",
    label: "ขายคริปโตทั้งหมด",
    detail: "รับเงินตามมูลค่าปัจจุบัน",
    icon: "wallet",
    cost: 0,
    group: "ลงทุน",
  },
  {
    id: "lottery",
    label: "ซื้อหวยทุกปี",
    detail:
      gameConfig.lottery.annualCost +
      " บาท/ปี · เริ่ม " +
      lotteryPercent(gameConfig.lottery.chance) +
      "% เพิ่มปีละ " +
      lotteryPercent(gameConfig.lottery.annualIncrease) +
      " จุดเปอร์เซ็นต์ · รางวัล " +
      gameConfig.lottery.prize.toLocaleString("th-TH") +
      " · เริ่มซื้อปีหน้า",
    icon: "ticket",
    cost: 0,
    group: "ลงทุน",
    minAge: 20,
  },
  {
    id: "basic",
    label: "ประกันชีวิตพื้นฐาน",
    detail:
      "เบี้ย 3,000/ปี · เงินถึงผู้รับผลประโยชน์ 150,000 เมื่อเสียชีวิต · อุบัติเหตุ 60% · รักษาโรค 40%",
    icon: "shield",
    cost: 3000,
    group: "ประกัน",
  },
  {
    id: "family",
    label: "ประกันชีวิตครอบครัว",
    detail:
      "เบี้ย 8,000/ปี · เงินถึงผู้รับผลประโยชน์ 500,000 เมื่อเสียชีวิต · อุบัติเหตุ 75% · รักษาโรค 60%",
    icon: "shield",
    cost: 8000,
    group: "ประกัน",
  },
  {
    id: "cancel-policy",
    label: "หยุดต่อประกัน",
    detail: "ความคุ้มครองสิ้นสุดทันที · ไม่คืนเบี้ยที่จ่าย",
    icon: "shield",
    cost: 0,
    group: "ประกัน",
  },
  {
    id: "volunteer",
    label: "ทำงานชุมชน",
    detail: "ชื่อเสียง +12 · สัมพันธ์ +5",
    icon: "heart",
    cost: 0,
    group: "เส้นทางชีวิต",
  },
  {
    id: "campaign",
    label: "ลงสมัครการเมืองท้องถิ่น",
    detail: "ชื่อเสียง 30 · โอกาสชนะ 55% · หากชนะ รายได้ 360,000/ปี",
    icon: "flag",
    cost: 30000,
    group: "เส้นทางชีวิต",
    minAge: 25,
  },
  {
    id: "corrupt",
    label: "รับเงินทุจริต",
    detail: "เฉพาะผู้ชนะเลือกตั้ง · รับ 80,000 · เสี่ยงถูกจับเพิ่ม 30",
    icon: "danger",
    cost: 0,
    group: "เส้นทางชีวิต",
    minAge: 25,
  },
  {
    id: "tribute",
    label: "จ่ายส่วยให้เครือข่ายมืด",
    detail: "ได้รับ 35,000 จากงานสีเทา · เสี่ยงถูกจับเพิ่ม 20 · ชื่อเสียง −8",
    icon: "danger",
    cost: 10000,
    group: "เส้นทางชีวิต",
    minAge: 20,
  },
  {
    id: "bribe",
    label: "ติดสินบนตำรวจ",
    detail: "โอกาส 50% ลดความเสี่ยง 15 · ล้มเหลวเพิ่ม 30 · ไม่ล้างคดี",
    icon: "danger",
    cost: 20000,
    group: "เส้นทางชีวิต",
    minAge: 20,
  },
  {
    id: "cooperate",
    label: "เลิกสายมืดและร่วมมือสอบสวน",
    detail: "เสียเงิน 15,000 · ความเสี่ยง −25 · ชื่อเสียง +5",
    icon: "shield",
    cost: 15000,
    group: "เส้นทางชีวิต",
  },
];
export const policyTerms = {
  none: {
    label: "ไม่มีประกัน",
    premium: 0,
    payout: 0,
    accidentCover: 0,
    diseaseCover: 0,
  },
  basic: {
    label: "พื้นฐาน",
    premium: 3000,
    payout: 150000,
    accidentCover: 0.6,
    diseaseCover: 0.4,
  },
  family: {
    label: "ครอบครัว",
    premium: 8000,
    payout: 500000,
    accidentCover: 0.75,
    diseaseCover: 0.6,
  },
  premium: {
    label: "อุ่นใจสูงสุด",
    premium: 18000,
    payout: 1500000,
    accidentCover: 0.9,
    diseaseCover: 0.8,
  },
};
