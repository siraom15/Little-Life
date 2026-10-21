import { gameConfig } from "./journey/config.ts";
import { replayJourney } from "./journey/engine.ts";
import type { Life } from "./types.ts";
import { validateLife, replayLife } from "./validation.ts";
export function encodeLife(life: Life) {
  const payload =
    life.version === 8
      ? {
          format: "little-life-v8",
          balanceRevision: gameConfig.revision,
          seed: life.seed,
          name: life.name,
          actions: life.simulation!.actions,
        }
      : life.version === 2
        ? {
            format: "little-life-v2",
            seed: life.seed,
            name: life.name,
            actions: life.simulation!.actions,
            origin: life.simulation!.origin,
          }
        : life;
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}
export function decodeLife(raw: string): Life | null {
  try {
    if (raw.length > 200000) return null;
    const value = JSON.parse(
      new TextDecoder().decode(Uint8Array.from(atob(raw), (char) => char.charCodeAt(0))),
    );
    if (
      value?.format === "little-life-v8" &&
      value.balanceRevision === gameConfig.revision
    )
      return replayJourney(value.seed, value.name, value.actions);
    if (value?.format === "little-life-v2")
      return replayLife(value.seed, value.name, value.actions, value.origin);
    return validateLife(value) ? value : null;
  } catch {
    return null;
  }
}
