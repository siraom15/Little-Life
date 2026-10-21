export { createNewLife } from "./birth.ts";
import { advanceSimulationYear } from "./year.ts";
import { clamp, record } from "./life-effects.ts";
import { noticeChoices } from "./notice-choices.ts";
import { applyVenture } from "./economy.ts";
import { events } from "./expanded-events.ts";

import type { Life, Choice, Stat, SimulationAction, Activity } from "./types.ts";

export function upcomingEvent(life: Life) {
  return life.done
    ? undefined
    : events.find(
        (event) =>
          event.age >= life.age &&
          !life.history.some((entry) => entry.id === event.id) &&
          (!event.requires || life.flags.includes(event.requires)) &&
          (!event.excludes || !life.flags.includes(event.excludes)),
      );
}
export function dueEvent(life: Life) {
  const event = upcomingEvent(life);
  return !life.simulation?.notice && event && event.age <= life.age ? event : undefined;
}
export function canChoose(life: Life, choice: Choice) {
  return (
    !life.done &&
    !life.simulation?.notice &&
    ((choice.cost || 0) <= 0 || life.money >= (choice.cost || 0)) &&
    (!choice.needs || life.flags.includes(choice.needs)) &&
    life.stats.skill >= (choice.minSkill || 0)
  );
}
/** One action is deterministic; UI speed cannot change the odds. */
export function applyAction(life: Life, action: SimulationAction): Life {
  if (life.version !== 2 || !life.simulation) return life;
  if (action.type === "notice-choice") {
    const choice = noticeChoices(life)[action.index];
    if (
      life.done ||
      !choice ||
      ((choice.cost || 0) > life.money && (choice.cost || 0) > 0)
    )
      return life;
    const next = structuredClone(life);
    next.money -= choice.cost || 0;
    for (const stat of Object.keys(next.stats) as Stat[])
      next.stats[stat] = clamp(next.stats[stat] + (choice.effects?.[stat] || 0));
    record(
      next,
      "response-" + next.simulation!.notice!.id,
      choice.label,
      choice.detail,
      "ตอบรับเหตุการณ์",
    );
    next.simulation!.notice = null;
    next.simulation!.actions.push(action);
    return next;
  }
  if (action.type === "ack") {
    if (!life.simulation.notice) return life;
    const next = structuredClone(life);
    next.simulation!.notice = null;
    next.simulation!.actions.push(action);
    return next;
  }
  if (life.done || life.simulation.notice) return life;
  const next = structuredClone(life),
    simulation = next.simulation!;
  if (action.type === "venture") {
    if (dueEvent(life) || !applyVenture(next, action.id)) return life;
  } else if (action.type === "choice") {
    const event = dueEvent(life),
      choice = event?.choices[action.index];
    if (!event || !choice || !canChoose(life, choice)) return life;
    next.money -= choice.cost || 0;
    next.income = choice.income ?? next.income;
    if (event.id === "promotion")
      next.income += choice.flag === "leader" ? 120000 : 36000;
    next.location = choice.location || next.location;
    next.job = choice.job || next.job;
    for (const stat of Object.keys(next.stats) as Stat[])
      next.stats[stat] = clamp(next.stats[stat] + (choice.effects?.[stat] || 0));
    if (choice.flag) next.flags.push(choice.flag);
    const cause = event.requires
      ? next.history.find((entry) =>
          events
            .find((candidate) => candidate.id === entry.id)
            ?.choices.some(
              (candidate) =>
                candidate.label === entry.choice && candidate.flag === event.requires,
            ),
        )?.id
      : undefined;
    next.history.push({
      id: event.id,
      age: next.age,
      title: event.title,
      choice: choice.label,
      detail: choice.detail,
      category: event.category,
      ...(cause ? { cause } : {}),
      money: next.money,
    });
  } else if (action.type === "activity") {
    if (dueEvent(life) || life.age < 3 || simulation.activityAge === life.age)
      return life;
    const changes: Record<Activity, Partial<Record<Stat, number>>> = {
      rest: { health: 3, happy: 1 },
      learn: { skill: 2, happy: -1 },
      connect: { social: 3, happy: 2 },
    };
    if (!changes[action.activity]) return life;
    for (const stat of Object.keys(next.stats) as Stat[])
      next.stats[stat] = clamp(next.stats[stat] + (changes[action.activity][stat] || 0));
    simulation.activityAge = next.age;
  } else if (action.type === "year") {
    if (dueEvent(life)) return life;
    advanceSimulationYear(next);
  } else return life;
  simulation.actions.push(action);
  return next;
}
export const advanceYear = (life: Life) => applyAction(life, { type: "year" });
export const acknowledgeNotice = (life: Life) => applyAction(life, { type: "ack" });
export const doActivity = (life: Life, activity: Activity) =>
  applyAction(life, { type: "activity", activity });
/** Skip mode simulates each intervening year and still stops at surprises. */
export function skipToMoment(life: Life) {
  let next = life;
  for (let i = 0; i < 101; i++) {
    if (next.done || next.simulation?.notice || dueEvent(next)) break;
    const advanced = advanceYear(next);
    if (advanced === next) break;
    next = advanced;
  }
  return next;
}
