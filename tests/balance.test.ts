import { test } from "node:test";
import assert from "node:assert/strict";
import { createGameLife, journeyAction } from "../lib/game/journey/engine.ts";
import { settleFamily, ageFamily, spouseIncome } from "../lib/game/journey/family.ts";
import { yearlyFinance } from "../lib/game/journey/finance.ts";
import {
  assetOffer,
  assetDamage,
  storyChoiceLocked,
  applyAssetBenefits,
} from "../lib/game/journey/asset-stories.ts";
import { policeRaid } from "../lib/game/journey/police.ts";
import { successChance } from "../lib/game/journey/chance.ts";
import { gameConfig } from "../lib/game/journey/config.ts";
import { randomAt } from "../lib/game/random.ts";
function fixture(age = 30) {
  const l = createGameLife(0);
  l.age = age;
  l.money = 10000000;
  l.income = 1000000;
  l.journey!.hasWorked = age >= 22;
  l.simulation!.notice = null;
  return l;
}
test("pre-employment living costs never create child debt", () => {
  const l = fixture(10);
  l.money = 0;
  settleFamily(l);
  assert.equal(l.journey!.debt, 0);
  for (const p of Object.values(l.journey!.parents)) {
    p.income = 0;
    p.savings = 5000;
  }
  settleFamily(l);
  assert.equal(l.journey!.debt, 0);
  assert.equal(l.money, 0);
  yearlyFinance(l);
  assert.equal(l.journey!.debt, 0);
  assert.equal(l.journey!.arrears, 0);
});
test("married income and spouse costs both enter annual cash flow", () => {
  const single = fixture(),
    married = structuredClone(single);
  married.journey!.partner = {
    name: "คู่ชีวิต",
    status: "married",
    bond: 80,
    since: 24,
    income: 240000,
    savings: 50000,
  };
  assert.ok(randomAt(0, 30, 173) > gameConfig.family.spouseDeathChance);
  yearlyFinance(single);
  yearlyFinance(married);
  assert.equal(married.money - single.money, 240000 - gameConfig.family.spouseLivingCost);
});
test("parent inheritance is paid once and can be absent", () => {
  let paid = false,
    empty = false;
  for (let seed = 0; seed < 20; seed++) {
    const l = fixture();
    l.seed = seed;
    l.money = 0;
    l.journey!.parents.father.deathAt = 30;
    l.journey!.parents.father.savings = 100000;
    l.journey!.parents.mother.deathAt = 99;
    ageFamily(l);
    const money = l.money;
    ageFamily(l);
    assert.equal(l.money, money);
    assert.ok(money === 0 || money === 100000);
    paid ||= money > 0;
    empty ||= money === 0;
  }
  assert.ok(paid && empty);
});
test("spouse death stops income and inheritance cannot repeat", () => {
  const l = fixture(80);
  l.money = 0;
  let seed = 0;
  while (
    randomAt(seed, 80, 173) >=
    gameConfig.family.spouseDeathChance +
      gameConfig.family.spouseOlderDeathChance +
      gameConfig.family.spouseElderlyDeathChance
  )
    seed++;
  l.seed = seed;
  l.journey!.partner = {
    name: "คู่ชีวิต",
    status: "married",
    bond: 80,
    since: 24,
    income: 240000,
    savings: 100000,
  };
  settleFamily(l);
  assert.equal(l.journey!.partner.deceased, true);
  assert.equal(spouseIncome(l), 0);
  const money = l.money;
  settleFamily(l);
  assert.equal(l.money, money);
});
test("asset popup purchases charge once and enforce financing eligibility", () => {
  let l = fixture();
  const offer = assetOffer(l, "car");
  l.journey!.pending = offer;
  const cost = offer.choices[0].cost!;
  const before = l.money;
  l = journeyAction(l, { type: "choice", index: 0 });
  assert.ok(l.journey!.car);
  assert.equal(l.money, before - cost);
  const poor = fixture();
  poor.income = 0;
  poor.journey!.pending = assetOffer(poor, "house");
  assert.ok(storyChoiceLocked(poor, poor.journey!.pending.choices[1]));
  assert.equal(journeyAction(poor, { type: "choice", index: 1 }), poor);
});
test("assets grant capped annual benefits and destruction preserves outstanding debt", () => {
  let l = fixture();
  l = journeyAction(l, { type: "venture", id: "house:condo:finance" });
  l.stats.health = 50;
  l.stats.happy = 50;
  applyAssetBenefits(l);
  assert.equal(l.stats.health, 52);
  assert.equal(l.stats.happy, 53);
  const balance = l.journey!.house!.balance;
  l.journey!.pending = assetDamage(l, "house");
  l = journeyAction(l, { type: "choice", index: 4 });
  assert.equal(l.journey!.house, null);
  assert.equal(l.journey!.debt, balance);
});
test("relationship improves police negotiation and raid cap is below previous rate", () => {
  const l = fixture(),
    choice = policeRaid(l).choices[2];
  l.stats.social = 0;
  const low = successChance(l, choice);
  l.stats.social = 100;
  assert.ok(successChance(l, choice) > low);
  assert.equal(gameConfig.dark.maxRaidChance, 0.12);
});

test("prison seizure removes 40–80% net assets once per sentence and queues a prison popup", async () => {
  const { imprison, prisonConfiscation } = await import("../lib/game/journey/police.ts");
  for (let seed = 0; seed < 40; seed++) {
    const l = fixture();
    l.seed = seed;
    imprison(l, 5);
    l.money = 100;
    l.journey!.house = {
      id: "condo",
      price: 350000,
      balance: 100000,
      annualPayment: 10000,
      rate: 0.06,
      yearsLeft: 10,
      missed: 0,
      boughtAt: 20,
    };
    const before = 250100;
    prisonConfiscation(l);
    if (randomAt(seed, 30, 260) >= gameConfig.prison.confiscationChance) {
      assert.equal(l.journey!.house?.id, "condo");
      continue;
    }
    const after =
      l.money + (l.journey!.frozenMoney || 0) + (l.journey!.house ? 250000 : 0);
    assert.ok(before - after >= Math.floor(before * 0.4));
    assert.ok(before - after <= Math.ceil(before * 0.8));
    assert.equal(l.journey!.house, null);
    assert.equal(l.journey!.debt, 0);
    assert.equal(l.journey!.queue.at(-1)?.scene, "prison");
    assert.match(l.journey!.queue.at(-1)!.text, /%.*฿/);
    const saved = structuredClone(l);
    prisonConfiscation(l);
    assert.deepEqual(l, saved);
  }
});

test("prison freezes income, spouse transfers and portfolio growth; inheritance waits for release", async () => {
  const { imprison } = await import("../lib/game/journey/police.ts");
  const { receiveMoney } = await import("../lib/game/journey/wallet.ts");
  const { householdIncome } = await import("../lib/game/journey/family.ts");
  const l = fixture();
  l.journey!.partner = {
    name: "คู่ชีวิต",
    status: "married",
    bond: 80,
    since: 24,
    income: 9000000,
  };
  imprison(l, 5);
  l.simulation!.economy!.fund = 100000;
  const before = l.money;
  receiveMoney(l, 50000);
  assert.equal(l.money, before);
  assert.equal(l.journey!.frozenMoney, 50000);
  assert.equal(householdIncome(l), 0);
  yearlyFinance(l);
  assert.ok(l.money <= before);
  assert.equal(l.income, 0);
  assert.equal(l.simulation!.economy!.fund, 100000);
  l.age = 34;
  l.journey!.pending = null;
  l.journey!.queue = [];
  l.flags.push("seized-sentence-35");
  l.journey!.parents.father.deathAt = 100;
  l.journey!.parents.mother.deathAt = 100;
  const next = journeyAction(l, { type: "year" });
  assert.equal(next.age, 35);
  assert.equal(next.journey!.frozenMoney, 0);
});

test("no-more-children choice suppresses both milestone and random family planning", async () => {
  const { relationshipEvent } =
    await import("../lib/game/journey/events/relationships.ts");
  const { milestoneEvent, randomStory } = await import("../lib/game/journey/events.ts");
  let l = fixture();
  l.journey!.partner = { name: "คู่ชีวิต", status: "married", bond: 80, since: 24 };
  l.journey!.pending = relationshipEvent(l, "child");
  l = journeyAction(l, { type: "choice", index: 4 });
  assert.equal(l.journey!.stopHavingChildren, true);
  for (const age of [30, 34, 38, 42, 46, 50, 54]) {
    l.age = age;
    assert.ok(!milestoneEvent(l)?.id.startsWith("child-"));
    for (let seed = 0; seed < 40; seed++) {
      l.seed = seed;
      assert.ok(!randomStory(l).id.startsWith("child-"));
    }
  }
  const waiting = fixture();
  waiting.journey!.partner = l.journey!.partner;
  waiting.journey!.pending = relationshipEvent(waiting, "child");
  assert.ok(
    !journeyAction(waiting, { type: "choice", index: 3 }).journey!.stopHavingChildren,
  );
});

test("health events are less frequent while mortality increases with age and imprisonment", async () => {
  const { mortalityRisk, healthEventChance } =
    await import("../lib/game/journey/health.ts");
  assert.ok(healthEventChance(30) < 0.24);
  assert.ok(healthEventChance(50) < 0.29);
  const l = fixture();
  l.stats.health = 90;
  const young = mortalityRisk(l);
  assert.ok(young > 0.001);
  l.age = 50;
  const older = mortalityRisk(l);
  assert.ok(older > young);
  l.simulation!.economy!.prisonUntil = 60;
  assert.ok(mortalityRisk(l) > older);
});

test("seizure popup pauses prison time and acknowledgement resumes it without enabling actions", async () => {
  const { imprison, prisonConfiscation } = await import("../lib/game/journey/police.ts");
  let l = fixture();
  while (randomAt(l.seed, 30, 260) >= gameConfig.prison.confiscationChance) l.seed++;
  imprison(l, 5);
  prisonConfiscation(l);
  l.simulation!.notice = l.journey!.queue.shift()!;
  assert.equal(journeyAction(l, { type: "year" }), l);
  const next = journeyAction(l, { type: "ack" });
  assert.equal(next.simulation!.notice, null);
  assert.equal(journeyAction(next, { type: "venture", id: "loan" }), next);
  assert.equal(journeyAction(next, { type: "year" }).age, 31);
});
