import { choose, createLife, nextEvent } from "./legacy-engine.ts";
import { events } from "./events.ts";
import type { Life } from "./types.ts";
export function validateLegacyLife(value: unknown): value is Life {
  try {
    const life = value as Life;
    if (
      !life ||
      life.version !== 1 ||
      !Number.isInteger(life.seed) ||
      life.seed < 0 ||
      life.seed > 4294967295 ||
      typeof life.name !== "string" ||
      life.name.length > 30 ||
      !Array.isArray(life.history) ||
      life.history.length > events.length
    )
      return false;
    let replay = createLife(life.seed, life.name);
    for (const entry of life.history) {
      const event = nextEvent(replay);
      if (!event || event.id !== entry.id) return false;
      const choiceIndex = event.choices.findIndex(
        (choice) => choice.label === entry.choice,
      );
      const next = choose(replay, choiceIndex);
      if (next === replay) return false;
      replay = next;
    }
    return JSON.stringify(replay) === JSON.stringify(life);
  } catch {
    return false;
  }
}
