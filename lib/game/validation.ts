import { replayJourney } from "./journey/engine.ts";
import { validateLegacyLife } from "./legacy-validation.ts";
import { createNewLife, applyAction } from "./simulation.ts";
import { ventures } from "./ventures.ts";
import type { Life, SimulationAction } from "./types.ts";
function isSimulationAction(value: unknown): value is SimulationAction {
  if (!value || typeof value !== "object") return false;
  const action = value as Record<string, unknown>;
  switch (action.type) {
    case "year":
    case "ack":
      return Object.keys(action).length === 1;
    case "notice-choice":
    case "choice":
      return (
        Object.keys(action).length === 2 &&
        Number.isInteger(action.index) &&
        (action.index as number) >= 0
      );
    case "venture":
      return (
        Object.keys(action).length === 2 && ventures.some((item) => item.id === action.id)
      );
    case "activity":
      return (
        Object.keys(action).length === 2 &&
        ["rest", "learn", "connect"].includes(action.activity as string)
      );
    default:
      return false;
  }
}
export function replayLife(
  seed: number,
  name: string,
  actions: SimulationAction[],
  origin?: Life,
): Life | null {
  if (
    !Number.isInteger(seed) ||
    seed < 0 ||
    seed > 4294967295 ||
    typeof name !== "string" ||
    name.length > 30 ||
    !Array.isArray(actions) ||
    actions.length > 5000
  )
    return null;
  if (
    origin &&
    (!validateLegacyLife(origin) || origin.seed !== seed || origin.name !== name)
  )
    return null;
  let replay = createNewLife(seed, name, origin);
  for (const action of actions) {
    if (!isSimulationAction(action)) return null;
    const next = applyAction(replay, action);
    if (next === replay) return null;
    replay = next;
  }
  return replay;
}
export function validateLife(value: unknown): value is Life {
  try {
    const life = value as Life;
    if (life?.version === 8) {
      const replay = replayJourney(life.seed, life.name, life.simulation?.actions);
      return !!replay && JSON.stringify(replay) === JSON.stringify(life);
    }
    if (life?.version === 1) return validateLegacyLife(value);
    if (life?.version !== 2 || !life.simulation) return false;
    const replay = replayLife(
      life.seed,
      life.name,
      life.simulation.actions,
      life.simulation.origin,
    );
    return !!replay && JSON.stringify(replay) === JSON.stringify(life);
  } catch {
    return false;
  }
}
