import type { Life } from "../../types.ts";
import type { Outcome, StoryChoice, StoryEvent } from "../types.ts";
export const option = (
  label: string,
  detail: string,
  success: Outcome,
  extra: Partial<StoryChoice> = {},
): StoryChoice => ({ label, detail, success, ...extra });
export const event = (
  life: Life,
  id: string,
  title: string,
  text: string,
  choices: StoryChoice[],
  category = "ชีวิต",
  scene: StoryEvent["scene"] = "home",
): StoryEvent => ({
  id,
  age: life.age,
  icon: "✦",
  title,
  text,
  choices,
  category,
  scene,
});
