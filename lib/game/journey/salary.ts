import type { Life } from "../types.ts";
import { careerIncome, jobs } from "./catalog.ts";
import { randomAt } from "../random.ts";
export function offeredSalary(life: Life, id: string, location = life.location) {
  const base = careerIncome(id, 0, location);
  if (!life.journey!.hasWorked) return base;
  const channel =
    340 +
    Math.max(
      0,
      jobs.findIndex((j) => j.id === id),
    );
  const previous = Math.max(life.income, life.journey!.lastSalary || 0);
  const experienced = randomAt(life.seed, life.age, channel) < 0.6;
  return Math.round(
    experienced
      ? Math.max(
          base,
          previous * (1.05 + randomAt(life.seed, life.age, channel + 40) * 0.2),
        )
      : Math.max(base, previous * 0.85),
  );
}
export function promotedSalary(life: Life) {
  const c = life.journey!.career!;
  return c.rank >= 3
    ? life.income
    : Math.round(
        (c.baseSalary || careerIncome(c.id, 0, life.location)) *
          (1 + Math.min(3, c.rank + 1) * 0.35),
      );
}
