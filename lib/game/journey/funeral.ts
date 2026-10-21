import { allCars } from "./assets.ts";
import type { Life } from "../types.ts";
import { randomAt } from "../random.ts";
export function buildFuneral(life: Life) {
  const j = life.journey!,
    e = life.simulation!.economy!,
    guests: { name: string; role: string }[] = [];
  let channel = 310;
  const invite = (name: string, role: string, chance: number) => {
    if (randomAt(life.seed, life.age, channel++) < chance) guests.push({ name, role });
  };
  for (const [role, parent] of Object.entries(j.parents))
    if (parent.alive) invite(parent.name, role === "father" ? "พ่อ" : "แม่", 0.98);
  if (j.partner && !j.partner.deceased)
    invite(
      j.partner.name,
      j.partner.status === "separated" ? "คนที่เคยรัก" : "คู่ชีวิต",
      j.partner.status === "separated" ? 0.15 : 0.75 + j.partner.bond / 400,
    );
  for (const child of j.children)
    invite(child.name, "ลูก", 0.85 + life.stats.social / 1000);
  const names = [
    "ปรีชา",
    "อร",
    "นิชา",
    "ภพ",
    "เมย์",
    "เต้",
    "นุ่น",
    "วิน",
    "มิน",
    "ก้อง",
    "ดาวเหนือ",
    "ภัทร",
  ];
  const roles = [
    life.age < 22 ? "เพื่อนร่วมชั้น" : "เพื่อนร่วมงาน",
    "เพื่อนบ้าน",
    "เพื่อนเก่า",
  ];
  const friendCount = Math.max(1, Math.floor(life.stats.social / 12));
  for (let i = 0; i < friendCount; i++)
    invite(
      names[(life.seed + i) % names.length],
      roles[i % roles.length],
      0.55 + life.stats.social / 250,
    );
  if (j.careerHistory.includes("politician"))
    for (let i = 0; i < 6; i++)
      invite("ตัวแทนชุมชน " + (i + 1), "ผู้ที่เคยได้รับความช่วยเหลือ", 0.65);
  if (
    j.careerHistory.includes("teacher") ||
    j.careerHistory.includes("doctor") ||
    j.careerHistory.includes("nurse")
  )
    for (let i = 0; i < 4; i++)
      invite("คนที่คุณเคยดูแล " + (i + 1), "ผู้ระลึกถึงความเมตตา", 0.75);
  if (j.careerHistory.some((id) => ["actor", "athlete", "streamer"].includes(id)))
    for (let i = 0; i < 5; i++) invite("ผู้ติดตาม " + (i + 1), "ผู้ที่ชื่นชมผลงาน", 0.6);
  if (j.careerHistory.some((id) => ["mafia", "underground"].includes(id)))
    for (let i = 0; i < 4; i++)
      invite("คนจากเครือข่าย " + (i + 1), "คนรู้จักจากอดีต", 0.4);
  const estate =
    life.money +
    e.fund +
    e.crypto +
    j.investment.stock +
    (j.house ? Math.floor(j.house.price * 0.6) - j.house.balance : 0) +
    allCars(life).reduce(
      (sum, car) => sum + Math.floor(car.price * 0.6) - car.balance,
      0,
    ) -
    j.debt;
  return {
    guests,
    title:
      guests.length > 12
        ? "ผู้คนมากมายมาส่งคุณ"
        : guests.length > 4
          ? "คำอำลาจากคนที่ผูกพัน"
          : "พิธีเล็ก ๆ กับความทรงจำ",
    estate,
  };
}
