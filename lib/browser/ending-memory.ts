import type { Life } from "../game/types.ts";
const KEY = "littlelife.ending-memory.v1";
type MemoryStore = Pick<Storage, "getItem" | "setItem">;
// Local, read-only handoff, independent of autosave and current replay rules.
export function rememberEnding(life: Life, encoded: string, storage?: MemoryStore) {
  if (!life.done || !life.journey?.funeral || !life.simulation?.death) return;
  try {
    (storage || sessionStorage).setItem(KEY, JSON.stringify({ encoded, life }));
  } catch {
    /* Private browsing/quota: the replay link remains available. */
  }
}
export function recallEnding(encoded: string, storage?: MemoryStore): Life | null {
  try {
    const raw = (storage || sessionStorage).getItem(KEY);
    if (!raw) return null;
    const memory = JSON.parse(raw);
    const l = memory.life as Life;
    if (
      memory.encoded !== encoded ||
      l?.version !== 8 ||
      l.done !== true ||
      typeof l.name !== "string" ||
      !Number.isFinite(l.age) ||
      !Number.isFinite(l.money) ||
      !l.journey?.funeral ||
      !l.simulation?.death ||
      !Array.isArray(l.history) ||
      !Array.isArray(l.journey.funeral.guests) ||
      !Array.isArray(l.journey.children) ||
      !l.journey.skills ||
      !l.journey.health ||
      !l.simulation.economy
    )
      return null;
    return l;
  } catch {
    return null;
  }
}
