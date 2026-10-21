import { journeyAction } from "./journey/engine.ts";
import * as legacy from "./legacy-engine.ts";
import { applyAction, canChoose, dueEvent } from "./simulation.ts";
import type { Life, Choice } from "./types.ts";
export const createLife = legacy.createLife;
export const expense = legacy.expense;
export const nextEvent = (life: Life) =>
  life.version === 8
    ? life.simulation?.notice
      ? undefined
      : life.journey?.pending || undefined
    : life.version === 2
      ? dueEvent(life)
      : legacy.nextEvent(life);
export const available = (life: Life, choice: Choice) =>
  life.version === 8
    ? !life.done &&
      !life.simulation?.notice &&
      (choice.cost || 0) <= Math.max(0, life.money)
    : life.version === 2
      ? canChoose(life, choice)
      : legacy.available(life, choice);
export const choose = (life: Life, index: number) =>
  life.version === 8
    ? journeyAction(life, { type: "choice", index })
    : life.version === 2
      ? applyAction(life, { type: "choice", index })
      : legacy.choose(life, index);
