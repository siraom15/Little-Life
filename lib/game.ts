// Stable public API: UI and existing saves/tests keep using this entry point.
export { labels } from "./game/constants.ts";
export { available, choose, createLife, expense, nextEvent } from "./game/engine.ts";
export { events } from "./game/events.ts";
export { decodeLife, encodeLife } from "./game/serialization.ts";
export type * from "./game/types.ts";
export { validateLife } from "./game/validation.ts";
export {
  createNewLife,
  advanceYear,
  acknowledgeNotice,
  doActivity,
  skipToMoment,
  upcomingEvent,
} from "./game/simulation.ts";

export { createGameLife, journeyAction } from "./game/journey/engine.ts";
