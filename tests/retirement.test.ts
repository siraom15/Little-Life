import { test } from "node:test";
import assert from "node:assert/strict";
import { createGameLife, journeyAction } from "../lib/game/journey/engine.ts";
import { retirementEvent } from "../lib/game/journey/events/career.ts";
import { yearlyRetirementWork } from "../lib/game/journey/retirement.ts";
import { offeredSalary } from "../lib/game/journey/salary.ts";
import { gameConfig } from "../lib/game/journey/config.ts";
function fixture() {
  const l = createGameLife(42);
  l.age = 60;
  l.income = 1000000;
  l.journey!.hasWorked = true;
  l.journey!.career = { id: "technician", rank: 3, since: 22 };
  l.simulation!.notice = null;
  l.stats.health = 80;
  return l;
}
test("all retirement work routes pay quoted reduced salary and drain health every working year", () => {
  for (const [index, mode] of [
    [1, "consulting"],
    [2, "handover"],
    [3, "continue"],
  ] as const) {
    let l = fixture();
    l.journey!.pending = retirementEvent(l);
    const choice = l.journey!.pending.choices[index];
    choice.chance = undefined;
    assert.match(choice.detail, /ทุกปี/);
    l = journeyAction(l, { type: "choice", index });
    const cfg = gameConfig.retirement.work[mode];
    assert.equal(l.income, 1000000 * cfg.incomeRate);
    assert.equal(l.journey!.retirementWork, mode);
    assert.ok(l.flags.includes("retired"));
    l.age++;
    yearlyRetirementWork(l);
    assert.equal(l.stats.health, 80 - cfg.healthLossPerYear);
    l.age++;
    yearlyRetirementWork(l);
    assert.equal(l.stats.health, 80 - 2 * cfg.healthLossPerYear);
    assert.equal(l.income, 1000000 * cfg.incomeRate);
  }
});
test("full retirement and family care have no employment income or work health cost", () => {
  for (const index of [0, 4]) {
    let l = fixture();
    l.journey!.pending = retirementEvent(l);
    l = journeyAction(l, { type: "choice", index });
    const health = l.stats.health;
    yearlyRetirementWork(l);
    assert.equal(l.income, 0);
    assert.equal(l.stats.health, health);
    assert.equal(l.journey!.retirementWork, undefined);
  }
});
test("hospital and prison pause extra work damage, and work health cannot fall below zero", () => {
  const l = fixture();
  l.journey!.retirementWork = "continue";
  l.journey!.health.hospitalUntil = 61;
  yearlyRetirementWork(l);
  assert.equal(l.stats.health, 80);
  l.journey!.health.hospitalUntil = -1;
  yearlyRetirementWork(l, true);
  assert.equal(l.stats.health, 80);
  l.stats.health = 2;
  yearlyRetirementWork(l);
  assert.equal(l.stats.health, 0);
});
test("late-life job offers cannot bypass retirement salary reduction", () => {
  const l = fixture();
  assert.equal(offeredSalary(l, "technician"), 250000);
});
