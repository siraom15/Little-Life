import type { Life } from "../types.ts";
import type { StoryChoice } from "./types.ts";
import { storyChoiceLocked } from "./asset-stories.ts";
import { gameConfig } from "./config.ts";
export function choiceCredit(life: Life, choice: StoryChoice) {
  const amount = Math.max(0, (choice.cost || 0) - Math.max(0, life.money));
  if (!amount || life.done || life.journey!.creditUntil > life.age) return null;
  const total = life.journey!.debt + amount;
  const funded = structuredClone(life);
  funded.money += amount;
  if (storyChoiceLocked(funded, choice)) return null;
  return {
    bankruptcyRisk: total * 1.18 > gameConfig.choiceCredit.bankruptcyThreshold,
    repaymentAge: Math.max(life.age + 1, gameConfig.family.supportUntil),
    amount,
    total,
    annual: Math.min(
      Math.ceil(total * 1.18),
      Math.max(6000, Math.ceil(total * 1.18 * 0.2)),
    ),
  };
}
