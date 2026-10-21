import balance from "../../../config/game-balance.json" with { type: "json" };
export const gameConfig = balance;

// Fail early with a useful path instead of silently producing NaN cash or impossible odds.
function nonNegative(value: unknown, path: string): void {
  if (typeof value === "number" && (!Number.isFinite(value) || value < 0))
    throw new Error("Invalid game config: " + path);
  if (value && typeof value === "object")
    for (const [key, child] of Object.entries(value))
      nonNegative(child, path + "." + key);
}
nonNegative(balance, "game-balance");
for (const [path, value] of Object.entries({
  overseasOffer: balance.abroad.offerChance,
  lottery: balance.lottery.chance,
  confiscation: balance.prison.confiscationChance,
  healthEvent: balance.health.eventChance,
  healthAdult: balance.health.eventChance20to40,
  healthOlder: balance.health.eventChanceOver40,
  prisonDeath: balance.life.prisonDeathRisk,
  ...balance.life.mortality,
  raid: balance.dark.maxRaidChance,
  raidBase: balance.dark.baseRaidChance,
  raidIncrease: balance.dark.raidIncreasePerYear,
  accident: balance.accidents.annualChance,
  accidentDeath: balance.accidents.fatalChance,
  diseaseYoung: balance.diseases.incidenceYoung,
  diseaseAdult: balance.diseases.incidenceAdult,
  diseaseOlder: balance.diseases.incidenceOlder,
  inheritance: balance.family.inheritanceChance,
  parentSaving: balance.family.parentSavingRate,
  spouseDeath: balance.family.spouseDeathChance,
  spouseOlderDeath: balance.family.spouseOlderDeathChance,
  spouseElderlyDeath: balance.family.spouseElderlyDeathChance,
  assetOffer: balance.assets.offerChance,
  assetDamage: balance.assets.damageChance,
})) {
  if (value > 1) throw new Error("Game config probability must be 0–1: " + path);
}
for (const kind of ["house", "car"] as const) {
  const terms = balance.assets[kind];
  if (
    !Number.isInteger(terms.years) ||
    terms.years < 1 ||
    terms.rate <= 0 ||
    terms.rate > 1 ||
    terms.downRate >= 1 ||
    terms.repairRate > 1 ||
    terms.maintenanceRate > 1
  )
    throw new Error("Invalid game config asset terms: " + kind);
}
if (!Number.isInteger(balance.revision) || balance.revision < 1)
  throw new Error("Game config revision must be a positive integer");

if (
  balance.life.averageLifespan < 30 ||
  balance.life.averageLifespan > 110 ||
  balance.life.maxAge < balance.life.averageLifespan ||
  balance.life.maxAge > 130
)
  throw new Error("Invalid life expectancy config");
if (
  !balance.investment.intervals.length ||
  balance.investment.intervals.some((n) => !Number.isInteger(n) || n < 1)
)
  throw new Error("Investment intervals must be positive years");

if (
  balance.prison.minSeizurePercent > balance.prison.maxSeizurePercent ||
  balance.prison.maxSeizurePercent > 100
)
  throw new Error("Invalid prison seizure range");

for (const model of Object.values(balance.diseases.models)) {
  if (
    model.fatality.length !== 4 ||
    model.recovery.length !== 4 ||
    model.fatality.some((n) => n > 1) ||
    model.recovery.some((n) => n > 100)
  )
    throw new Error("Invalid disease model");
}
for (const risk of Object.values(balance.investment.risks)) {
  if (risk.crashChance > 1 || risk.crashLoss > 1)
    throw new Error("Invalid investment risk");
}

if (
  balance.accidents.minLossRate > balance.accidents.maxLossRate ||
  balance.accidents.maxLossRate > 1 ||
  !Number.isInteger(balance.accidents.recoveryYears)
)
  throw new Error("Invalid accident config");
