import { labels } from "./constants.ts";
import { events } from "./events.ts";
import type { Choice, Life, Stat } from "./types.ts";
export function createLife(seed: number, name = "นที"): Life {
  const provinces = [
    "เชียงใหม่",
    "กรุงเทพมหานคร",
    "ขอนแก่น",
    "สงขลา",
    "นครราชสีมา",
    "ชลบุรี",
  ];
  const normalizedSeed = seed >>> 0;
  return {
    version: 1,
    seed: normalizedSeed,
    name: name.trim().slice(0, 30) || "นที",
    province: provinces[normalizedSeed % 6],
    background: ["ครอบครัวรายได้น้อย", "ครอบครัวชนชั้นกลาง", "ครอบครัวมั่นคง"][
      normalizedSeed % 3
    ],
    age: 0,
    money: [50000, 140000, 350000][normalizedSeed % 3],
    income: 0,
    location: "ประเทศไทย",
    job: "ยังไม่เริ่มทำงาน",
    stats: { health: 85, happy: 70, skill: 35, social: 50 },
    flags: [],
    history: [],
    done: false,
  };
}
export function nextEvent(life: Life) {
  return life.done
    ? undefined
    : events.find(
        (event) =>
          !life.history.some((entry) => entry.id === event.id) &&
          (!event.requires || life.flags.includes(event.requires)) &&
          (!event.excludes || !life.flags.includes(event.excludes)),
      );
}
export function expense(life: Life) {
  return Math.max(
    0,
    (life.location === "ญี่ปุ่น" ? 240000 : 96000) +
      (life.flags.includes("child") && life.age < 56 ? 60000 : 0) -
      (life.flags.includes("house") ? 36000 : 0),
  );
}
export function available(life: Life, choice: Choice) {
  const age = nextEvent(life)?.age ?? life.age;
  const projected =
    life.money + (life.age >= 18 ? (life.income - expense(life)) * (age - life.age) : 0);
  return (
    ((choice.cost || 0) <= 0 || projected >= (choice.cost || 0)) &&
    (!choice.needs || life.flags.includes(choice.needs)) &&
    life.stats.skill >= (choice.minSkill || 0)
  );
}
export function choose(life: Life, index: number): Life {
  const event = nextEvent(life);
  if (!event || !event.choices[index] || !available(life, event.choices[index]))
    return life;
  const choice = event.choices[index];
  const updatedLife: Life = structuredClone(life);
  const years = event.age - life.age;
  const net = life.age >= 18 ? life.income - expense(life) : 0;
  updatedLife.money += net * years - (choice.cost || 0);
  updatedLife.age = event.age;
  updatedLife.income = choice.income ?? life.income;
  if (event.id === "promotion")
    updatedLife.income += choice.flag === "leader" ? 120000 : 36000;
  updatedLife.location = choice.location || life.location;
  updatedLife.job = choice.job || life.job;
  for (const stat of Object.keys(labels) as Stat[])
    updatedLife.stats[stat] = Math.max(
      0,
      Math.min(
        100,
        updatedLife.stats[stat] +
          (choice.effects?.[stat] || 0) -
          (stat === "health" && event.age > 38 ? Math.ceil(years / 2) : 0),
      ),
    );
  if (choice.flag) updatedLife.flags.push(choice.flag);
  const cause = event.requires
    ? updatedLife.history.find((entry) =>
        events
          .find((candidate) => candidate.id === entry.id)
          ?.choices.some(
            (candidate) =>
              candidate.label === entry.choice && candidate.flag === event.requires,
          ),
      )?.id
    : undefined;
  updatedLife.history.push({
    id: event.id,
    age: event.age,
    title: event.title,
    choice: choice.label,
    detail: choice.detail,
    category: event.category,
    ...(cause ? { cause } : {}),
    money: updatedLife.money,
  });
  updatedLife.done = choice.flag === "finished";
  return updatedLife;
}
