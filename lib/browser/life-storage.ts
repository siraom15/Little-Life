import { gameConfig } from "../game/journey/config";
import type { Life } from "../game";
import { encodeLife, validateLife } from "../game";
// The simplified ruleset starts fresh; older save keys are not read or deleted.
export const SAVE_KEY = "littlelife.save.v8." + gameConfig.revision;
export function readAutosavePreference() {
  return !document.cookie
    .split(";")
    .some((cookie) => cookie.trim() === "thailife_autosave=off");
}
export function writeAutosavePreference(enabled: boolean) {
  document.cookie =
    "thailife_autosave=" +
    (enabled ? "on" : "off") +
    "; Path=/; Max-Age=31536000; SameSite=Lax";
}
export function loadLife(): Life | null {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  const value: unknown = JSON.parse(raw);
  if (!validateLife(value)) throw new Error("Invalid save");
  return value.version === 8 ? value : null;
}
export function saveLife(life: Life) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(life));
}
export async function readLifeFile(file: File): Promise<Life> {
  if (file.size > 500000) throw new Error("Save exceeds size limit");
  const value: unknown = JSON.parse(await file.text());
  if (!validateLife(value)) throw new Error("Invalid save");
  if (value.version !== 8) throw new Error("Save uses older rules");
  return value;
}
export function downloadLife(life: Life) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(life, null, 2)], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "little-life-" + life.seed + ".json";
  link.click();
  URL.revokeObjectURL(url);
}
export function storyLink(life: Life) {
  return (
    location.origin + location.pathname + "#life=" + encodeURIComponent(encodeLife(life))
  );
}
export function challengeLink(life: Life) {
  return location.origin + location.pathname + "#seed=" + life.seed;
}
