import type { Life } from "./types.ts";
import { events } from "./expanded-events.ts";
import { settleDeathBenefit } from "./economy.ts";
export const clamp = (value: number) => Math.max(0, Math.min(100, value));
export function record(
  life: Life,
  id: string,
  title: string,
  detail: string,
  category: string,
) {
  life.history.push({
    id,
    age: life.age,
    title,
    choice: title,
    detail,
    category,
    money: life.money,
  });
}
export function die(life: Life, cause: string) {
  life.done = true;
  settleDeathBenefit(life);
  life.simulation!.death = { age: life.age, cause };
  life.simulation!.notice = {
    id: "death",
    title: "เรื่องราวนี้เดินทางถึงปลายทาง",
    text: cause,
    scene: "death",
    effects: `ชีวิตของ${life.name} · ${life.age} ปี · ${life.history.filter((h) => events.some((e) => e.id === h.id)).length} ทางเลือกสำคัญ`,
  };
  record(life, `death-${life.age}`, "ความทรงจำที่ยังอยู่", cause, "บทสรุป");
}
