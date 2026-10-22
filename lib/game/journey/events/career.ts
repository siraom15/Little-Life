import { offeredSalary, promotedSalary } from "../salary.ts";
import { educationBonus } from "../education.ts";
import { careerPaths, positionTitle } from "../career-paths.ts";
import { careerIncome } from "../catalog.ts";
import { gameConfig } from "../config.ts";
import type { Life } from "../../types.ts";
import type { StoryEvent, Skill } from "../types.ts";
import { event, option } from "./builders.ts";
import { overseasJobs } from "../catalog.ts";
import { jobs, riskyJobs } from "../catalog.ts";
export function careerOffer(life: Life, kind: "first" | "offer" | "loss" = "offer") {
  const choices = jobs
    .filter(
      (job) =>
        job.id !== "politician" &&
        (!overseasJobs.some((o) => o.id === job.id) ||
          overseasJobs.some((o) => o.id === job.id && o.country === life.location)),
    )
    .map((job) =>
      option(
        job.label,
        "เงินเดือนเริ่มต้น " +
          Math.round(offeredSalary(life, job.id) / 12).toLocaleString("th-TH") +
          " บาท" +
          (educationBonus(life, job.id)
            ? " · การเรียนตรงสาย +" + educationBonus(life, job.id) + " จุดเปอร์เซ็นต์"
            : " · ไม่มีโบนัสตรงสาย") +
          (riskyJobs.has(job.id)
            ? " · เสี่ยงบุกค้น/ถูกจับ · ความร้อนเพิ่มทุกปี"
            : " · ใช้ทักษะเฉพาะสายงาน"),
        { career: job.id, ...(riskyJobs.has(job.id) ? { heat: 20 } : {}) },
        {
          icon: job.icon,
          chance: {
            base: riskyJobs.has(job.id) ? 25 : job.income >= 420000 ? 20 : 40,
            skill: job.skill,
            stat: "social",
          },
          failure: { stats: { happy: -3 } },
          failureText:
            "ยังไม่ได้รับเลือก รายได้และงานเดิมคงอยู่ หากว่างงานจะรอโอกาสครั้งใหม่",
        },
      ),
    );
  if (kind !== "first")
    choices.push(
      option(
        "ยังไม่รับข้อเสนอ",
        "รักษางานเดิม หรือรอโอกาสใหม่หากว่างงาน",
        { stats: { happy: 2 } },
        { icon: "moon" },
      ),
    );
  return event(
    life,
    "career-" + kind + "-" + life.age,
    kind === "loss"
      ? "บริษัทปิดตัว คุณตกงาน"
      : kind === "first"
        ? "เลือกเส้นทางงานแรก"
        : "มีคนชวนไปทำงานใหม่",
    kind === "loss"
      ? "รายได้ประจำหยุดแล้ว ลองสมัครงานใหม่ หรือรอโอกาสถัดไป"
      : "ทักษะเฉพาะ ความสัมพันธ์ และดวงปีนี้รวมกันเป็นโอกาสได้งาน เลือกสายที่อยากเติบโต",
    choices,
    "การงาน",
  );
}
export function promotionEvent(life: Life) {
  const career = life.journey!.career;
  if (!career) return careerOffer(life);
  const job = jobs.find((j) => j.id === career.id)!,
    path = careerPaths[career.id],
    max = career.rank >= 3;
  const heat = !max && riskyJobs.has(career.id) ? gameConfig.dark.promotionHeat : 0;
  const nextIncome = promotedSalary(life);
  return event(
    life,
    "promotion-" + life.age,
    "พิจารณาผลงาน: " + positionTitle(career.id, career.rank),
    path.reason +
      " · " +
      (max
        ? "คุณอยู่ตำแหน่งสูงสุดแล้ว เลือกพัฒนาหรือดูแลทีม"
        : "ตำแหน่งถัดไป " +
          positionTitle(career.id, career.rank + 1) +
          " · รายได้ ฿" +
          nextIncome.toLocaleString("th-TH") +
          "/ปี"),
    [
      ...path.routes.map((route, index) =>
        option(
          route,
          max
            ? "โบนัสตามผลงาน ไม่เพิ่มตำแหน่ง"
            : "เลื่อนเป็น " +
                positionTitle(career.id, career.rank + 1) +
                (heat ? " · ตำรวจจับตา +" + heat : ""),
          {
            promote: !max,
            promotionTitle: route,
            skills: { [job.skill]: 3 },
            ...(max ? { money: Math.round(job.income * 0.08) } : {}),
            heat,
          },
          {
            icon: index === 1 ? "users" : "chart",
            chance: {
              base: 32 - index * 3,
              skill: index === 1 ? "communication" : job.skill,
              stat: index === 1 ? "social" : "skill",
            },
            failure: { stats: { happy: -3 } },
            successText: path.reason + " คุณจึงได้รับความไว้วางใจให้ " + route,
          },
        ),
      ),
      option(
        "พัฒนาฝีมือก่อน",
        "ทักษะอาชีพ +12",
        { skills: { [job.skill]: 12 } },
        { icon: "book" },
      ),
      option("อยู่ตำแหน่งเดิม", "ความสุข +6", { stats: { happy: 6 } }, { icon: "moon" }),
    ],
    "การงาน",
    "festival",
  );
}
export function retirementEvent(life: Life) {
  const id = life.journey!.career?.id || life.journey!.careerHistory.at(-1),
    path = id ? careerPaths[id] : null;
  const pension = Math.round(life.income * 0.25),
    consulting = Math.round(life.income * 0.45);
  return event(
    life,
    "retire",
    "ออกแบบชีวิตหลังวัยทำงาน",
    path
      ? "ประสบการณ์จาก " + life.job + " เปิดทางให้ " + path.retirement
      : "เลือกวิถีชีวิตที่เหมาะกับเงินเก็บและสุขภาพ",
    [
      option(
        "พักเต็มตัว",
        "หยุดรายได้งาน · สุขภาพ +10",
        { retire: true, stats: { health: 10, happy: 15 } },
        { icon: "moon" },
      ),
      option(
        path?.retirement || "รับงานเบาแรง",
        "รายได้ ฿" + consulting.toLocaleString("th-TH") + "/ปี · ลดความร้อน 20",
        { retire: true, retirementIncome: consulting, heat: -20 },
        { icon: "book" },
      ),
      option(
        "ส่งต่อกิจการและรับส่วนแบ่ง",
        "รายได้ ฿" + pension.toLocaleString("th-TH") + "/ปี",
        { retire: true, retirementIncome: pension, stats: { social: 8 } },
        {
          icon: "users",
          chance: { base: 45, skill: "business", stat: "social" },
          failure: { stats: { happy: -5 } },
        },
      ),
      option(
        "ทำงานเดิมต่อ",
        "รายได้เดิม · สุขภาพ -5",
        { stats: { health: -5 } },
        { icon: "briefcase" },
      ),
      option(
        "ดูแลครอบครัว",
        "หยุดงาน · สัมพันธ์ +15",
        { retire: true, stats: { social: 15 } },
        { icon: "heart" },
      ),
    ],
    "การงาน",
    "home",
  );
}
