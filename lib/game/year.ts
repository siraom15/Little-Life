import type { Life, Stat } from "./types.ts";
import { expense } from "./legacy-engine.ts";
import { randomAt } from "./random.ts";
import { randomEvents } from "./random-events.ts";
import { settleEconomyYear } from "./economy.ts";
import { clamp, die, record } from "./life-effects.ts";
/** Annual finances, ageing, mortality, then a possible surprise. */
export function advanceSimulationYear(next: Life) {
  const simulation = next.simulation!;
  if (next.age >= 18) {
    const imprisoned = (simulation.economy?.prisonUntil || 0) > next.age;
    next.money += (imprisoned ? 0 : next.income) - expense(next);
  }
  next.age += 1;
  settleEconomyYear(next);
  if (next.age > 40)
    next.stats.health = clamp(next.stats.health - (next.age > 75 ? 2 : 1));
  const hazard =
    next.age < 18
      ? 0.001
      : next.age < 40
        ? 0.002
        : next.age < 60
          ? 0.006
          : next.age < 80
            ? 0.018
            : 0.06;
  if (
    next.age >= 100 ||
    next.stats.health <= 0 ||
    randomAt(next.seed, next.age, 3) < hazard + (next.stats.health < 25 ? 0.025 : 0)
  )
    die(
      next,
      next.age >= 90
        ? "จากไปอย่างสงบเมื่อถึงปลายทางของวัยชรา"
        : next.stats.health <= 0
          ? "ร่างกายอ่อนล้าจนไม่สามารถไปต่อได้"
          : randomAt(next.seed, next.age, 4) < 0.5
            ? "อุบัติเหตุที่ไม่มีใครคาดคิดทำให้ชีวิตจบลง"
            : "อาการเจ็บป่วยฉับพลันทำให้ชีวิตจบลง",
    );
  else if (!simulation.notice && randomAt(next.seed, next.age, 5) < 0.24) {
    const pool = randomEvents.filter(
      (event) => next.age >= event.minAge && next.age <= event.maxAge,
    );
    const event = pool[Math.floor(randomAt(next.seed, next.age, 6) * pool.length)];
    if (event) {
      for (const stat of Object.keys(next.stats) as Stat[])
        next.stats[stat] = clamp(next.stats[stat] + (event.stats?.[stat] || 0));
      next.money += event.money || 0;
      simulation.notice = {
        id: `${event.id}-${next.age}`,
        title: event.title,
        text: event.text,
        scene: event.scene,
        effects: event.effects,
      };
      record(next, simulation.notice.id, event.title, event.effects, "เหตุการณ์สุ่ม");
    }
  }
}
