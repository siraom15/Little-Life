import type { Journey } from "./journey/types.ts";
export type Stat = "health" | "happy" | "skill" | "social";
export type Choice = {
  icon?: string;
  label: string;
  detail: string;
  effects?: Partial<Record<Stat, number>>;
  cost?: number;
  income?: number;
  flag?: string;
  location?: string;
  job?: string;
  needs?: string;
  minSkill?: number;
};
export type Event = {
  id: string;
  age: number;
  icon: string;
  category: string;
  title: string;
  text: string;
  requires?: string;
  excludes?: string;
  choices: Choice[];
};
export type Entry = {
  id: string;
  age: number;
  title: string;
  choice: string;
  detail: string;
  category: string;
  cause?: string;
  assetSnapshot?: {
    house: Journey["house"];
    car: Journey["car"];
    extraCars: Journey["extraCars"];
  };
  outcomeSuccess?: boolean;
  location?: string;
  money: number;
};
export type Life = {
  version: 1 | 2 | 8;
  journey?: Journey;
  seed: number;
  name: string;
  province: string;
  background: string;
  age: number;
  money: number;
  income: number;
  location: string;
  job: string;
  stats: Record<Stat, number>;
  flags: string[];
  history: Entry[];
  done: boolean;
  simulation?: Simulation;
};
export type Sex = "male" | "female";
export type Activity = "rest" | "learn" | "connect";
export type SceneKind =
  "birth" | "home" | "hospital" | "festival" | "travel" | "gift" | "death" | "prison";
export type LifeNotice = {
  visual?:
    | "lottery"
    | "red-envelope"
    | "grave"
    | "level-up"
    | "review"
    | "portfolio"
    | "fire"
    | "layoff"
    | "repair";
  accident?: "car" | "bus" | "collapse" | "drowning" | "electric";
  chart?: { age: number; profit: number }[];
  subject?: string;
  id: string;
  title: string;
  text: string;
  scene: SceneKind;
  effects: string;
};
export type SimulationAction =
  | { type: "year" }
  | { type: "choice"; index: number; borrow?: true }
  | { type: "ack" }
  | { type: "activity"; activity: Activity }
  | { type: "venture"; id: string }
  | { type: "notice-choice"; index: number };
export type Simulation = {
  economy?: Economy;
  sex: Sex;
  birthTrait: string;
  notice: LifeNotice | null;
  death: { age: number; cause: string } | null;
  activityAge: number;
  actions: SimulationAction[];
  origin?: Life;
};

export type Economy = {
  fund: number;
  crypto: number;
  policy: "none" | "basic" | "family" | "premium";
  lottery?: { active: boolean; years: number; lastDrawAge: number };
  insuredAt: number;
  beneficiaryPayout: number;
  heat: number;
  reputation: number;
  prisonUntil: number;
  lastAction: Record<string, number>;
};
