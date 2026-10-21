import { test } from "node:test";
import assert from "node:assert/strict";
import { createGameLife, journeyAction } from "../lib/game/journey/engine.ts";
import { careerPaths } from "../lib/game/journey/career-paths.ts";
import { promotionEvent, retirementEvent } from "../lib/game/journey/events/career.ts";
import { universityChoices } from "../lib/game/journey/events/universities.ts";
import { relationshipEvent } from "../lib/game/journey/events/relationships.ts";
import { allCars, settleAssets, assetAnnual } from "../lib/game/journey/assets.ts";
import { yearlyInvestments, portfolioValue } from "../lib/game/journey/investments.ts";
import { yearlyHealth, mortalityRisk, applyHabit } from "../lib/game/journey/health.ts";
import { settleFamily } from "../lib/game/journey/family.ts";
import { bankrupt } from "../lib/game/journey/finance.ts";
import { randomAt } from "../lib/game/random.ts";
import { gameConfig } from "../lib/game/journey/config.ts";
function fixture() {
  const life = createGameLife(0);
  life.age = 30;
  life.money = 10000000;
  life.income = 1800000;
  life.simulation!.notice = null;
  life.journey!.hasWorked = true;
  return life;
}
test("every job has three distinct progression choices, proper ranks and retirement routes", () => {
  assert.equal(Object.keys(careerPaths).length, 20);
  for (const id of Object.keys(careerPaths)) {
    const l = fixture();
    l.journey!.career = { id, rank: 1, since: 22 };
    const e = promotionEvent(l);
    assert.equal(new Set(e.choices.slice(0, 3).map((c) => c.label)).size, 3);
    assert.ok(e.title.includes(careerPaths[id].titles[1]));
    assert.ok(retirementEvent(l).choices[1].label.includes(careerPaths[id].retirement));
  }
  assert.ok(universityChoices().length >= 8);
});
test("dark promotion raises salary and heat with result popup", () => {
  let l = fixture();
  l.journey!.career = { id: "mafia", rank: 0, since: 22 };
  l.journey!.skills.business = 100;
  l.journey!.luck = 100;
  l.stats.skill = 100;
  l.journey!.pending = promotionEvent(l);
  while (randomAt(l.seed, 30, 150) >= 0.5) l.seed++;
  l = journeyAction(l, { type: "choice", index: 0 });
  assert.equal(l.journey!.career!.rank, 1);
  assert.ok(l.income > 1800000);
  assert.equal(l.simulation!.economy!.heat, gameConfig.dark.promotionHeat);
  assert.ok(l.simulation!.notice!.id.startsWith("promotion"));
});
test("successful child has stable identity, traits, portrait data and birth popup", () => {
  let l = fixture();
  l.journey!.partner = { name: "คู่ชีวิต", status: "married", bond: 100, since: 24 };
  l.stats.health = 100;
  l.journey!.luck = 100;
  l.journey!.pending = relationshipEvent(l, "child");
  while (randomAt(l.seed, 30, 150) >= 0.5) l.seed++;
  l = journeyAction(l, { type: "choice", index: 0 });
  assert.equal(l.journey!.children.length, 1);
  assert.ok(l.journey!.children[0].id);
  assert.ok(l.journey!.children[0].skin);
  assert.ok(l.journey!.children[0].trait);
  assert.ok(l.simulation!.notice!.id.startsWith("new-child"));
});
test("garage holds three cars, charges each installment and sells specified car", () => {
  let l = fixture();
  for (const id of ["scooter", "compact", "sedan"])
    l = journeyAction(l, { type: "venture", id: "car:" + id + ":finance" });
  assert.equal(allCars(l).length, 3);
  assert.equal(journeyAction(l, { type: "venture", id: "car:suv:cash" }), l);
  const due = assetAnnual(l),
    money = l.money;
  settleAssets(l);
  assert.equal(l.money, money - due);
  l = journeyAction(l, { type: "venture", id: "car:sell:1" });
  assert.deepEqual(
    allCars(l).map((c) => c.id),
    ["scooter", "sedan"],
  );
});
test("all investment sizes work repeatedly and reports reconcile deposits and withdrawals", () => {
  let l = fixture();
  for (const key of ["fund", "stock", "crypto"])
    for (const amount of [1000, 10000, 100000])
      l = journeyAction(l, { type: "venture", id: "invest:" + key + ":" + amount });
  assert.equal(portfolioValue(l), 333000);
  assert.equal(l.journey!.investment.deposited, 333000);
  l = journeyAction(l, { type: "venture", id: "sell:stock" });
  assert.equal(l.journey!.investment.withdrawn, 111000);
  l.age = l.journey!.investment.nextReport;
  yearlyInvestments(l);
  assert.ok(l.journey!.investment.lastReport.includes("เงินลงทุนสะสม"));
  assert.ok([2, 3, 5].includes(l.journey!.investment.nextReport - l.age));
});
test("parent finances do not pay or charge player support", () => {
  const l = fixture();
  l.journey!.hasWorked = false;
  l.money = 0;
  settleFamily(l);
  assert.equal(l.journey!.debt, 0);
  for (const p of Object.values(l.journey!.parents)) {
    p.income = 0;
    p.savings = 0;
  }
  settleFamily(l);
  assert.equal(l.journey!.debt, 0);
  l.journey!.hasWorked = true;
  settleFamily(l);
  assert.equal(l.journey!.debt, 0);
});
test("addiction leads to hospitalization, treatment helps, and prison can be fatal", () => {
  const l = fixture();
  applyHabit(l, "drugs");
  applyHabit(l, "drugs");
  l.journey!.health.addiction = 75;
  yearlyHealth(l);
  assert.ok(l.journey!.health.disease);
  assert.ok(l.journey!.health.hospitalUntil > l.age);
  const before = l.journey!.health.addiction;
  applyHabit(l, "rehab");
  assert.ok(l.journey!.health.addiction < before);
  const prison = fixture();
  prison.simulation!.economy!.prisonUntil = 50;
  let seed = 0;
  const probe = structuredClone(prison);
  probe.age++;
  while (randomAt(seed, 31, 142) >= mortalityRisk(probe)) seed++;
  prison.seed = seed;
  const dead = journeyAction(prison, { type: "year" });
  assert.ok(dead.done);
  assert.equal(dead.age, 31);
});
test("bankruptcy seizes every asset and permits a paid route back to housing", () => {
  let l = fixture();
  l = journeyAction(l, { type: "venture", id: "car:scooter:cash" });
  l = journeyAction(l, { type: "venture", id: "invest:stock:10000" });
  bankrupt(l);
  assert.equal(l.money, 0);
  assert.equal(allCars(l).length, 0);
  assert.equal(portfolioValue(l), 0);
  assert.ok(l.journey!.homeless);
  l.journey!.queue = [];
  l.money = 12000;
  l = journeyAction(l, { type: "venture", id: "rent-room" });
  assert.equal(l.journey!.homeless, false);
  assert.equal(l.money, 0);
});
