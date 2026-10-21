import type { Choice, Event, LifeNotice, Stat } from "../types.ts";
export type Skill =
  "academic" | "tech" | "business" | "creative" | "communication" | "care";
export type Person = {
  name: string;
  ageAtBirth: number;
  alive: boolean;
  job: string;
  income: number;
  deathAt: number;
  savings?: number;
};
export type Partner = {
  name: string;
  status: "dating" | "married" | "separated";
  bond: number;
  since: number;
  income?: number;
  savings?: number;
  deceased?: boolean;
};
export type Child = {
  name: string;
  bornAt: number;
  id?: string;
  sex?: "male" | "female";
  skin?: string;
  trait?: string;
  parentSeed?: number;
};
export type Outcome = {
  stats?: Partial<Record<Stat, number>>;
  skills?: Partial<Record<Skill, number>>;
  money?: number;
  school?: string;
  career?: string;
  promote?: boolean;
  promotionTitle?: string;
  retirementIncome?: number;
  habit?: "exercise" | "alcohol" | "smoking" | "drugs" | "rehab";
  loseJob?: boolean;
  relationship?: "meet" | "marry" | "child" | "leave" | "repair";
  bond?: number;
  heat?: number;
  debtFactor?: number;
  bankrupt?: boolean;
  location?: string;
  retire?: boolean;
  prison?: number;
  fine?: number;
  loseAsset?: "house" | "car";
};
export type StoryChoice = Choice & {
  assetAction?: string;
  chance?: { base: number; skill?: Skill; stat?: Stat; statWeight?: number };
  success: Outcome;
  failure?: Outcome;
  successText?: string;
  failureText?: string;
};
export type StoryEvent = Omit<Event, "choices"> & {
  scene: "home" | "hospital" | "festival" | "travel" | "gift";
  choices: StoryChoice[];
};
export type Journey = {
  balanceRevision: number;

  house: OwnedAsset | null;
  car: OwnedAsset | null;
  extraCars: OwnedAsset[];
  homeless: boolean;
  hasWorked: boolean;
  retirement: string;
  completedMissions: string[];
  health: {
    addiction: number;
    alcohol: number;
    smoking: number;
    exercise: number;
    disease: string | null;
    hospitalUntil: number;
  };
  investment: {
    stock: number;
    deposited: number;
    withdrawn: number;
    nextReport: number;
    startedAt: number;
    lastReport: string;
    points: { age: number; profit: number }[];
  };
  careerHistory: string[];
  funeral: Funeral | null;
  skills: Record<Skill, number>;
  luck: number;
  school: string;
  parents: { father: Person; mother: Person };
  partner: Partner | null;
  children: Child[];
  career: { id: string; rank: number; since: number } | null;
  debt: number;
  arrears: number;
  creditUntil: number;
  lastBorrowAge: number;
  pending: StoryEvent | null;
  queue: LifeNotice[];
  lastEventAge: number;
  summaries: number[];
  milestones: string[];
  lastResult: string;
  moneyChange?: number;
};

export type OwnedAsset = {
  id: string;
  price: number;
  balance: number;
  annualPayment: number;
  rate: number;
  yearsLeft: number;
  missed: number;
  boughtAt: number;
};
export type Funeral = {
  guests: { name: string; role: string }[];
  title: string;
  estate: number;
};
