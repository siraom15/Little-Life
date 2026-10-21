import { gameConfig } from "./config.ts";
import type { Skill } from "./types.ts";
export const skillLabels: Record<Skill, string> = {
  academic: "วิชาการ",
  tech: "เทคโนโลยี",
  business: "ธุรกิจ",
  creative: "สร้างสรรค์",
  communication: "สื่อสาร",
  care: "ดูแลผู้คน",
};
export const overseasJobs = [
  {
    id: "japan-tech",
    label: "ช่างระบบอัตโนมัติในญี่ปุ่น",
    skill: "tech",
    income: 360000,
    icon: "tool",
    country: "ญี่ปุ่น",
  },
  {
    id: "australia-care",
    label: "ผู้ดูแลผู้สูงอายุในออสเตรเลีย",
    skill: "care",
    income: 360000,
    icon: "heart",
    country: "ออสเตรเลีย",
  },
  {
    id: "germany-engineer",
    label: "วิศวกรพลังงานในเยอรมนี",
    skill: "tech",
    income: 480000,
    icon: "tool",
    country: "เยอรมนี",
  },
] as const;
export const jobs = [
  ...overseasJobs,
  { id: "doctor", label: "แพทย์", skill: "care", income: 540000, icon: "heart" },
  { id: "lawyer", label: "ทนายความ", skill: "academic", income: 420000, icon: "shield" },
  { id: "chef", label: "เชฟ", skill: "creative", income: 288000, icon: "food" },
  { id: "engineer", label: "วิศวกร", skill: "tech", income: 384000, icon: "tool" },
  { id: "actor", label: "นักแสดง", skill: "creative", income: 336000, icon: "camera" },
  {
    id: "streamer",
    label: "สตรีมเมอร์",
    skill: "communication",
    income: 264000,
    icon: "camera",
  },
  { id: "athlete", label: "นักกีฬา", skill: "care", income: 312000, icon: "sport" },
  { id: "pilot", label: "นักบิน", skill: "tech", income: 600000, icon: "plane" },
  {
    id: "detective",
    label: "นักสืบเอกชน",
    skill: "academic",
    income: 300000,
    icon: "shield",
  },
  {
    id: "mafia",
    label: "มาเฟียท้องถิ่น",
    skill: "business",
    income: gameConfig.dark.mafiaIncome,
    icon: "danger",
  },
  {
    id: "underground",
    label: "นายหน้าธุรกิจใต้ดิน",
    skill: "communication",
    income: gameConfig.dark.undergroundIncome,
    icon: "danger",
  },
  {
    id: "politician",
    label: "นักการเมืองท้องถิ่น",
    skill: "communication",
    income: 360000,
    icon: "flag",
  },
  {
    id: "developer",
    label: "นักพัฒนาซอฟต์แวร์",
    skill: "tech",
    income: 300000,
    icon: "code",
  },
  { id: "teacher", label: "ครู", skill: "academic", income: 216000, icon: "book" },
  {
    id: "nurse",
    label: "บุคลากรดูแลผู้ป่วย",
    skill: "care",
    income: 252000,
    icon: "heart",
  },
  { id: "designer", label: "นักออกแบบ", skill: "creative", income: 240000, icon: "art" },
  {
    id: "merchant",
    label: "ผู้ประกอบการ",
    skill: "business",
    income: 204000,
    icon: "shop",
  },
  { id: "sales", label: "นักขาย", skill: "communication", income: 228000, icon: "users" },
  { id: "technician", label: "ช่างเทคนิค", skill: "tech", income: 216000, icon: "tool" },
  { id: "farmer", label: "เกษตรกร", skill: "business", income: 168000, icon: "leaf" },
] as const;
export const ranks = ["เริ่มต้น", "ชำนาญงาน", "หัวหน้าทีม", "ผู้เชี่ยวชาญ"];
export const stages: Record<number, string> = {
  6: "ก้าวเข้าโรงเรียน",
  13: "เริ่มวัยรุ่น",
  18: "ก้าวสู่วัยผู้ใหญ่",
  25: "สร้างอนาคต",
  40: "ครึ่งทางของชีวิต",
  60: "บทใหม่วัยเกษียณ",
  80: "ความทรงจำแปดสิบปี",
};
export const clamp = (value: number) => Math.max(0, Math.min(100, value));
export function careerIncome(id: string, rank: number, location = "ไทย") {
  const job = jobs.find((j) => j.id === id);
  const country =
    gameConfig.abroad.countries[location as keyof typeof gameConfig.abroad.countries];
  return job
    ? Math.round(job.income * (1 + rank * 0.35) * (country?.salaryMultiplier || 1))
    : 0;
}

export const riskyJobs = new Set(["mafia", "underground"]);
